import { create } from 'zustand';
import { PredictionAggregate, BarVisitAggregate, EventAgendaAggregate } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface AdminState {
  topPredictions: PredictionAggregate[];
  barVisitStats: BarVisitAggregate[];
  eventAgendaStats: EventAgendaAggregate[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTopPredictions: () => Promise<void>;
  fetchBarVisitAggregates: () => Promise<void>;
  fetchEventAgendaAggregates: () => Promise<void>;
  fetchAllAdminData: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  topPredictions: [],
  barVisitStats: [],
  eventAgendaStats: [],
  loading: false,
  error: null,

  fetchTopPredictions: async () => {
    try {
      // Check if user is admin
      const { isAdminUser } = useAuthStore.getState();
      if (!isAdminUser()) {
        set({ error: 'Unauthorized access' });
        return;
      }

      // Fetch all predictions
      const { data: predictions, error: predictionsError } = await supabase
        .from('user_predictions')
        .select('prediction_json');

      if (predictionsError) throw predictionsError;

      // Fetch all bars for reference
      const { data: bars, error: barsError } = await supabase
        .from('bars')
        .select('id, name, rank_2025, city, country');

      if (barsError) throw barsError;

      // Create a map for quick bar lookup
      const barMap = new Map(bars.map(bar => [bar.id, bar]));

      // Aggregate prediction counts
      const predictionCounts: Record<string, number> = {};

      predictions?.forEach(prediction => {
        try {
          const barIds: string[] = JSON.parse(prediction.prediction_json);
          barIds.forEach(barId => {
            predictionCounts[barId] = (predictionCounts[barId] || 0) + 1;
          });
        } catch (error) {
          console.error('Error parsing prediction JSON:', error);
        }
      });

      // Convert to array and sort by prediction count
      const topPredictions: PredictionAggregate[] = Object.entries(predictionCounts)
        .map(([barId, count]) => {
          const bar = barMap.get(barId);
          return {
            bar_id: barId,
            bar_name: bar?.name || 'Unknown Bar',
            prediction_count: count,
            rank_2025: bar?.rank_2025,
            city: bar?.city || 'Unknown',
            country: bar?.country || 'Unknown'
          };
        })
        .sort((a, b) => b.prediction_count - a.prediction_count);

      set({ topPredictions });
    } catch (error) {
      console.error('Error fetching top predictions:', error);
      set({ error: 'Failed to fetch prediction data' });
    }
  },

  fetchBarVisitAggregates: async () => {
    try {
      // Check if user is admin
      const { isAdminUser } = useAuthStore.getState();
      if (!isAdminUser()) {
        set({ error: 'Unauthorized access' });
        return;
      }

      // Fetch all bar visits where visited = true
      const { data: visits, error: visitsError } = await supabase
        .from('user_bar_visits')
        .select('bar_id, user_id')
        .eq('visited', true);

      if (visitsError) throw visitsError;

      // Fetch all bars for reference
      const { data: bars, error: barsError } = await supabase
        .from('bars')
        .select('id, name, rank_2025, city, country');

      if (barsError) throw barsError;

      // Create a map for quick bar lookup
      const barMap = new Map(bars.map(bar => [bar.id, bar]));

      // Aggregate visit counts (count unique users per bar)
      const visitCounts: Record<string, Set<string>> = {};

      visits?.forEach(visit => {
        if (!visitCounts[visit.bar_id]) {
          visitCounts[visit.bar_id] = new Set();
        }
        visitCounts[visit.bar_id].add(visit.user_id);
      });

      // Convert to array and sort by visit count
      const barVisitStats: BarVisitAggregate[] = Object.entries(visitCounts)
        .map(([barId, userSet]) => {
          const bar = barMap.get(barId);
          return {
            bar_id: barId,
            bar_name: bar?.name || 'Unknown Bar',
            total_visits: userSet.size,
            rank_2025: bar?.rank_2025,
            city: bar?.city || 'Unknown',
            country: bar?.country || 'Unknown'
          };
        })
        .sort((a, b) => b.total_visits - a.total_visits);

      set({ barVisitStats });
    } catch (error) {
      console.error('Error fetching bar visit aggregates:', error);
      set({ error: 'Failed to fetch visit data' });
    }
  },

  fetchEventAgendaAggregates: async () => {
    try {
      // Check if user is admin
      const { isAdminUser } = useAuthStore.getState();
      if (!isAdminUser()) {
        set({ error: 'Unauthorized access' });
        return;
      }

      // Fetch all agenda entries with event details
      const { data: agendaData, error: agendaError } = await supabase
        .from('user_agenda')
        .select(`
          event_id,
          user_id,
          events!inner(
            id,
            name,
            date,
            time,
            location,
            venue
          )
        `);

      if (agendaError) throw agendaError;

      // Aggregate event data (count unique users per event)
      const eventCounts: Record<string, {
        users: Set<string>;
        eventData: any;
      }> = {};

      agendaData?.forEach(item => {
        const eventId = item.event_id;
        if (!eventCounts[eventId]) {
          eventCounts[eventId] = {
            users: new Set(),
            eventData: item.events
          };
        }
        eventCounts[eventId].users.add(item.user_id);
      });

      // Convert to array and sort by user count
      const eventAgendaStats: EventAgendaAggregate[] = Object.entries(eventCounts)
        .map(([eventId, data]) => ({
          event_id: eventId,
          event_name: data.eventData.name,
          total_users_added: data.users.size,
          date: data.eventData.date,
          time: data.eventData.time,
          location: data.eventData.location,
          venue: data.eventData.venue
        }))
        .sort((a, b) => b.total_users_added - a.total_users_added);

      set({ eventAgendaStats });
    } catch (error) {
      console.error('Error fetching event agenda aggregates:', error);
      set({ error: 'Failed to fetch event agenda data' });
    }
  },

  fetchAllAdminData: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchTopPredictions(),
        get().fetchBarVisitAggregates(),
        get().fetchEventAgendaAggregates()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      set({ error: 'Failed to fetch admin data' });
    } finally {
      set({ loading: false });
    }
  },
}));