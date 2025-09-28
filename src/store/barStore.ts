import { create } from 'zustand';
import { Bar, UserBarVisit } from '../types';
import { supabase } from '../lib/supabase';
import { trackBarAction, trackPrediction, trackSearch } from '../utils/analytics';

interface BarState {
  bars: Bar[];
  userVisits: Record<string, boolean>;
  loading: boolean;
  searchQuery: string;
  predictions: string[];
  
  // Actions
  fetchBars: () => Promise<void>;
  fetchUserVisits: () => Promise<void>;
  toggleBarVisit: (barId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  updatePredictions: (predictions: string[]) => Promise<void>;
  fetchPredictions: () => Promise<void>;
  getFilteredBars: () => Bar[];
  getVisitedCount: () => number;
  getVisitedPercentage: () => number;
}

export const useBarStore = create<BarState>((set, get) => ({
  bars: [],
  userVisits: {},
  loading: false,
  searchQuery: '',
  predictions: [],

  fetchBars: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .order('rank_2025', { ascending: true, nullsLast: true });
      
      if (error) throw error;
      set({ bars: data || [] });
    } catch (error) {
      console.error('Error fetching bars:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchUserVisits: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_bar_visits')
        .select('bar_id, visited')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const visits: Record<string, boolean> = {};
      data?.forEach(visit => {
        visits[visit.bar_id] = visit.visited;
      });
      
      set({ userVisits: visits });
    } catch (error) {
      console.error('Error fetching user visits:', error);
    }
  },

  toggleBarVisit: async (barId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentVisited = get().userVisits[barId] || false;
      const newVisited = !currentVisited;

      const { error } = await supabase
        .from('user_bar_visits')
        .upsert({
          user_id: user.id,
          bar_id: barId,
          visited: newVisited,
          visited_at: newVisited ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,bar_id'
        });
      
      if (error) throw error;
      
      // Track bar visit action
      const { bars } = get();
      const bar = bars.find(b => b.id === barId);
      trackBarAction(newVisited ? 'mark_visited' : 'mark_unvisited', bar?.name);
      
      set(state => ({
        userVisits: {
          ...state.userVisits,
          [barId]: newVisited
        }
      }));
    } catch (error) {
      console.error('Error toggling bar visit:', error);
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (query.trim()) {
      trackSearch('bars', query);
    }
  },

  updatePredictions: async (predictions: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_predictions')
        .upsert({
          user_id: user.id,
          prediction_json: JSON.stringify(predictions),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      trackPrediction('save_predictions', predictions.length);
      set({ predictions });
    } catch (error) {
      console.error('Error updating predictions:', error);
    }
  },

  fetchPredictions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_predictions')
        .select('prediction_json')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        set({ predictions: JSON.parse(data[0].prediction_json) });
      } else {
        set({ predictions: [] });
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  },

  getFilteredBars: () => {
    const { bars, searchQuery } = get();
    
    if (!searchQuery) return bars;
    
    return bars.filter(bar =>
      bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  },

  getVisitedCount: () => {
    const { userVisits } = get();
    return Object.values(userVisits).filter(visited => visited).length;
  },

  getVisitedPercentage: () => {
    const { bars, userVisits } = get();
    if (bars.length === 0) return 0;
    const visitedCount = Object.values(userVisits).filter(visited => visited).length;
    return Math.round((visitedCount / bars.length) * 100);
  },
}));