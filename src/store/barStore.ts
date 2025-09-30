import { create } from 'zustand';
import { Bar, UserBarVisit } from '../types';
import { supabase } from '../lib/supabase';
import { trackBarAction, trackPrediction, trackSearch } from '../utils/analytics';
import { 
  getGuestBarVisits, 
  toggleGuestBarVisit,
  getGuestPredictions,
  saveGuestPredictions 
} from '../utils/guestStorage';

interface BarState {
  bars: Bar[];
  userVisits: Record<string, boolean>;
  loading: boolean;
  searchQuery: string;
  predictions: string[];
  selectedRegion: 'world' | 'asia';
  
  // Actions
  fetchBars: () => Promise<void>;
  fetchUserVisits: () => Promise<void>;
  toggleBarVisit: (barId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedRegion: (region: 'world' | 'asia') => void;
  updatePredictions: (predictions: string[]) => Promise<void>;
  fetchPredictions: () => Promise<void>;
  getFilteredBars: () => Bar[];
  getPredictionBars: () => Bar[];
  getVisitedCount: () => number;
  getVisitedPercentage: () => number;
}

export const useBarStore = create<BarState>((set, get) => ({
  bars: [],
  userVisits: {},
  loading: false,
  searchQuery: '',
  predictions: [],
  selectedRegion: 'world',

  fetchBars: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .order('rank_2025', { ascending: true, nullsFirst: false });
      
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
      
      if (user) {
        // Authenticated user - load from Supabase
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
      } else {
        // Guest user - load from localStorage
        const guestVisits = getGuestBarVisits();
        set({ userVisits: guestVisits });
      }
    } catch (error) {
      console.error('Error fetching user visits:', error);
    }
  },

  toggleBarVisit: async (barId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentVisited = get().userVisits[barId] || false;
      const newVisited = !currentVisited;

      if (user) {
        // Authenticated user - save to Supabase
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
      } else {
        // Guest user - save to localStorage
        toggleGuestBarVisit(barId);
      }
      
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

  setSelectedRegion: (region: 'world' | 'asia') => {
    set({ selectedRegion: region });
  },

  updatePredictions: async (predictions: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Authenticated user - save to Supabase
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
      } else {
        // Guest user - save to localStorage
        saveGuestPredictions(predictions);
      }
      
      trackPrediction('save_predictions', predictions.length);
      set({ predictions });
    } catch (error) {
      console.error('Error updating predictions:', error);
    }
  },

  fetchPredictions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Authenticated user - load from Supabase
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
      } else {
        // Guest user - load from localStorage
        const guestPredictions = getGuestPredictions();
        set({ predictions: guestPredictions });
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  },

  getFilteredBars: () => {
    const { bars, searchQuery, selectedRegion } = get();
    
    // First filter by region
    let filteredBars = bars.filter(bar => bar.region === selectedRegion);
    
    // Then filter by search query if provided
    if (searchQuery) {
      filteredBars = filteredBars.filter(bar =>
        bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bar.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bar.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredBars;
  },

  getPredictionBars: () => {
    const { bars } = get();
    
    // Filter to only World's 50 Best bars and limit to top 50
    return bars
      .filter(bar => bar.region === 'world')
      .filter(bar => bar.rank_2025 || bar.rank_2024) // Only bars with ranks
      .sort((a, b) => {
        const rankA = a.rank_2025 || a.rank_2024 || 999;
        const rankB = b.rank_2025 || b.rank_2024 || 999;
        return rankA - rankB;
      })
      .slice(0, 50); // Limit to top 50
  },

  getVisitedCount: () => {
    const { bars, userVisits, selectedRegion } = get();
    // Only count visits for bars in the selected region
    const regionBars = bars.filter(bar => bar.region === selectedRegion);
    return regionBars.filter(bar => userVisits[bar.id]).length;
  },

  getVisitedPercentage: () => {
    const { bars, userVisits, selectedRegion } = get();
    // Only calculate percentage for bars in the selected region
    const regionBars = bars.filter(bar => bar.region === selectedRegion);
    if (regionBars.length === 0) return 0;
    const visitedCount = regionBars.filter(bar => userVisits[bar.id]).length;
    return Math.round((visitedCount / regionBars.length) * 100);
  },
}));
