import { create } from 'zustand';
import { Event, SortOption, FilterLocation } from '../types';
import { supabase } from '../lib/supabase';
import { parseISO, addMinutes, format, differenceInMinutes } from 'date-fns';
import { trackAgendaAction, trackSearch, trackFilter } from '../utils/analytics';
import { 
  getGuestAgenda, 
  addToGuestAgenda, 
  removeFromGuestAgenda,
  getGuestSessionId 
} from '../utils/guestStorage';

interface EventState {
  events: Event[];
  loading: boolean;
  sortBy: SortOption;
  filterLocation: FilterLocation;
  filterDate: string;
  searchQuery: string;
  userAgenda: Record<string, string | undefined>; // eventId -> arrivalTime
  conflictMessage: string;
  
  // Actions
  fetchEvents: () => Promise<void>;
  setSortBy: (sort: SortOption) => void;
  setFilterLocation: (location: FilterLocation) => void;
  setFilterDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  addToAgenda: (eventId: string, arrivalTime?: string) => Promise<boolean>;
  removeFromAgenda: (eventId: string) => Promise<void>;
  fetchUserAgenda: () => Promise<void>;
  getFilteredEvents: () => Event[];
}

// Minimum time between arrival times in minutes
const MIN_TIME_BETWEEN_ARRIVALS_MINUTES = 30;

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  sortBy: 'date',
  filterLocation: 'all',
  filterDate: '',
  searchQuery: '',
  userAgenda: {},
  conflictMessage: '',

  fetchEvents: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_version', 'world_2025')
        .order('date', { ascending: true });
      
      if (error) throw error;
      set({ events: data || [] });
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      set({ loading: false });
    }
  },

  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterLocation: (location) => {
    set({ filterLocation: location });
    if (location !== 'all') {
      trackFilter('events', 'location', location);
    }
  },
  setFilterDate: (date) => {
    set({ filterDate: date });
    if (date) {
      trackFilter('events', 'date', date);
    }
  },
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (query.trim()) {
      trackSearch('events', query);
    }
  },

  addToAgenda: async (eventId: string, arrivalTime?: string) => {
    try {
      set({ conflictMessage: '' });
      const { data: { user } } = await supabase.auth.getUser();

      const { events } = get();
      const event = events.find(e => e.id === eventId);
      if (!event) return false;

      // Check if event has TBA date or time
      if (!event.date || !event.time) {
        set({ conflictMessage: 'This event cannot be added to your agenda as the date and time are still to be announced (TBA).' });
        return false;
      }

      const finalArrivalTime = arrivalTime || event.time;

      if (user) {
        // Authenticated user - save to Supabase
        const hasConflict = await checkArrivalTimeConflict(event, finalArrivalTime, user.id);
        if (hasConflict) {
          return false;
        }

        const { error } = await supabase
          .from('user_agenda')
          .insert({ 
            user_id: user.id, 
            event_id: eventId,
            arrival_time: finalArrivalTime 
          });
        
        if (error) {
          console.error('Error adding to agenda:', error);
          return false;
        }
      } else {
        // Guest user - save to localStorage
        addToGuestAgenda(eventId, finalArrivalTime);
      }
      
      // Track successful addition
      trackAgendaAction('add_event', event?.name);
      
      set(state => ({
        userAgenda: {
          ...state.userAgenda,
          [eventId]: finalArrivalTime
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Error adding to agenda:', error);
      return false;
    }
  },

  removeFromAgenda: async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Authenticated user - remove from Supabase
        const { error } = await supabase
          .from('user_agenda')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);
        
        if (error) throw error;
      } else {
        // Guest user - remove from localStorage
        removeFromGuestAgenda(eventId);
      }
      
      // Track removal
      const { events } = get();
      const event = events.find(e => e.id === eventId);
      trackAgendaAction('remove_event', event?.name);
      
      set(state => ({
        userAgenda: Object.fromEntries(
          Object.entries(state.userAgenda).filter(([id]) => id !== eventId)
        )
      }));
    } catch (error) {
      console.error('Error removing from agenda:', error);
    }
  },

  fetchUserAgenda: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Authenticated user - load from Supabase
        const { data, error } = await supabase
          .from('user_agenda')
          .select('event_id, arrival_time')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        const agendaMap: Record<string, string | undefined> = {};
        data?.forEach(item => {
          agendaMap[item.event_id] = item.arrival_time;
        });
        
        set({ userAgenda: agendaMap });
      } else {
        // Guest user - load from localStorage
        const guestAgenda = getGuestAgenda();
        set({ userAgenda: guestAgenda });
      }
    } catch (error) {
      console.error('Error fetching user agenda:', error);
    }
  },

  getFilteredEvents: () => {
    const { events, filterLocation, filterDate, searchQuery, sortBy } = get();
    
    let filtered = events.filter(event => {
      const matchesLocation = filterLocation === 'all' || event.location === filterLocation;
      const matchesDate = !filterDate || (event.date && event.date.startsWith(filterDate));
      const matchesSearch = !searchQuery || 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.feature_bar.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesLocation && matchesDate && matchesSearch;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          // Handle TBA events - put them at the end
          if (!a.date || !a.time) return 1;
          if (!b.date || !b.time) return -1;
          
          // Create proper DateTime objects for accurate chronological sorting
          const [aHours, aMinutes] = a.time.split(':').map(Number);
          const [bHours, bMinutes] = b.time.split(':').map(Number);
          
          const dateTimeA = parseISO(a.date);
          dateTimeA.setHours(aHours, aMinutes, 0, 0);
          
          const dateTimeB = parseISO(b.date);
          dateTimeB.setHours(bHours, bMinutes, 0, 0);
          
          return dateTimeA.getTime() - dateTimeB.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'venue':
          return a.venue.localeCompare(b.venue);
        default:
          return 0;
      }
    });

    return filtered;
  },
}));

// Helper function to parse time range and get end time
export const parseEventEndTime = (event: Event): Date => {
  try {
    // Handle TBA events
    if (!event.date || !event.time) {
      return new Date(); // Return current date as fallback
    }
    
    // Validate and parse event date
    let eventDate: Date;
    try {
      eventDate = parseISO(event.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      console.error('Error parsing event date:', event.date, error);
      eventDate = new Date(); // Fallback to current date
    }
    
    // Validate and parse start time
    const timeParts = event.time.split(':');
    if (timeParts.length !== 2) {
      console.error('Invalid time format:', event.time);
      return addMinutes(eventDate, 180); // Default 3 hours
    }
    
    const [hours, minutes] = timeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error('Invalid time values:', event.time);
      return addMinutes(eventDate, 180); // Default 3 hours
    }
    
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const timeRange = event.time_range_display?.toLowerCase() || '';
    
    // Handle "till late" or "till sold out" - default to 2 AM next day
    if (timeRange.includes('till late') || timeRange.includes('till sold out')) {
      const endDateTime = new Date(startDateTime);
      endDateTime.setDate(endDateTime.getDate() + 1);
      endDateTime.setHours(2, 0, 0, 0);
      return endDateTime;
    }
    
    // Handle specific end times (e.g., "8pm-11pm", "3pm-7pm", "8:00pm-11:00pm")
    const timeRangeMatch = timeRange.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeRangeMatch) {
      const [, , , , endHour, endMinute = '0', endPeriod] = timeRangeMatch;
      let endHours = parseInt(endHour);
      const endMinutes = parseInt(endMinute || '0');
      
      // Validate parsed values
      if (isNaN(endHours) || isNaN(endMinutes)) {
        console.error('Failed to parse end time from:', timeRange);
        return addMinutes(startDateTime, 180); // Default 3 hours
      }
      
      if (endPeriod === 'pm' && endHours !== 12) {
        endHours += 12;
      } else if (endPeriod === 'am' && endHours === 12) {
        endHours = 0;
      }
      
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      
      // If end time is before start time, it's next day
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      return endDateTime;
    }
    
    // Default: 3 hours duration for "onwards" events
    return addMinutes(startDateTime, 180);
  } catch (error) {
    console.error('Error in parseEventEndTime for event:', event.name, error);
    // Ultimate fallback
    const now = new Date();
    return addMinutes(now, 180);
  }
};

// Helper function to generate available arrival time slots
export const generateArrivalTimeSlots = (event: Event): string[] => {
  // Handle TBA events
  if (!event.date || !event.time) {
    return [];
  }
  
  const eventDate = parseISO(event.date);
  const [hours, minutes] = event.time.split(':').map(Number);
  const startDateTime = new Date(eventDate);
  startDateTime.setHours(hours, minutes, 0, 0);
  
  const endDateTime = parseEventEndTime(event);
  const cutoffDateTime = addMinutes(endDateTime, -30); // 30 minutes before end
  
  
  const slots: string[] = [];
  let currentTime = new Date(startDateTime);
  
  while (currentTime < cutoffDateTime) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, 30);
  }
  
  // Ensure events with reasonable duration (>= 1 hour) have at least 2 slots
  const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
  if (slots.length <= 1 && durationHours >= 1) {
    // Force generate at least 2 slots for events >= 1 hour duration
    const secondSlot = format(addMinutes(startDateTime, 30), 'HH:mm');
    if (!slots.includes(secondSlot)) {
      slots.push(secondSlot);
    }
  }
  
  return slots;
};

// Helper function to check for arrival time conflicts
export const checkArrivalTimeConflict = async (newEvent: Event, newArrivalTime: string, userId: string): Promise<boolean> => {
  try {
    // Handle TBA events
    if (!newEvent.date) return false;
    
    // Get user's existing agenda with arrival times for the same date
    const { data: existingAgenda, error } = await supabase
      .from('user_agenda')
      .select(`
        event_id,
        arrival_time,
        events!inner(id, name, date, time)
      `)
      .eq('user_id', userId)
      .eq('events.date', newEvent.date); // Only check events on the same date
    
    if (error) throw error;
    if (!existingAgenda || existingAgenda.length === 0) return false;
    
    // Parse the new arrival time
    const newEventDate = parseISO(newEvent.date);
    const [newHours, newMinutes] = newArrivalTime.split(':').map(Number);
    const newArrivalDateTime = new Date(newEventDate);
    newArrivalDateTime.setHours(newHours, newMinutes, 0, 0);
    
    // Check against each existing event's arrival time
    for (const agendaItem of existingAgenda) {
      const existingEvent = agendaItem.events as any;
      const existingArrivalTime = agendaItem.arrival_time || existingEvent.time;
      
      // Skip if existing event has no date
      if (!existingEvent.date) continue;
      
      // Parse existing arrival time
      const existingEventDate = parseISO(existingEvent.date);
      const [existingHours, existingMinutes] = existingArrivalTime.split(':').map(Number);
      const existingArrivalDateTime = new Date(existingEventDate);
      existingArrivalDateTime.setHours(existingHours, existingMinutes, 0, 0);
      
      // Calculate the difference in minutes between arrival times
      const timeDifferenceMinutes = Math.abs(differenceInMinutes(newArrivalDateTime, existingArrivalDateTime));
      
      // Check if the arrival times are too close together
      if (timeDifferenceMinutes < MIN_TIME_BETWEEN_ARRIVALS_MINUTES) {
        const { events } = useEventStore.getState();
        const conflictingEvent = events.find(e => e.id === agendaItem.event_id);
        useEventStore.setState({
          conflictMessage: `Arrival time conflict with "${conflictingEvent?.name}" (arrival: ${existingArrivalTime}). Please choose an arrival time at least ${MIN_TIME_BETWEEN_ARRIVALS_MINUTES} minutes apart.`
        });
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking arrival time conflict:', error);
    return false;
  }
};
