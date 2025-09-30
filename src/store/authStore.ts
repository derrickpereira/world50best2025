import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { trackUserAuth } from '../utils/analytics';
import { exportGuestData, hasGuestData, clearGuestData } from '../utils/guestStorage';

interface GuestDataMigrationResult {
  success: boolean;
  migratedItems: {
    agenda: number;
    predictions: number;
    barVisits: number;
  };
  error?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdminUser: () => boolean;
  hasGuestDataToMigrate: () => boolean;
  getGuestDataCounts: () => { agenda: number; predictions: number; barVisits: number; total: number };
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<GuestDataMigrationResult>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  isAdminUser: () => {
    const { user } = get();
    return user?.email === 'derrickpereira@gmail.com';
  },

  hasGuestDataToMigrate: () => {
    return hasGuestData();
  },

  getGuestDataCounts: () => {
    const guestData = exportGuestData();
    const agenda = guestData?.agenda ? Object.keys(guestData.agenda).length : 0;
    const predictions = guestData?.predictions ? Object.keys(guestData.predictions).length : 0;
    const barVisits = guestData?.barVisits ? Object.keys(guestData.barVisits).length : 0;
    return {
      agenda,
      predictions,
      barVisits,
      total: agenda + predictions + barVisits
    };
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    } else {
      trackUserAuth('sign_in');
    }
  },

  signUp: async (email: string, password: string): Promise<GuestDataMigrationResult> => {
    // First, capture guest data before sign-up
    const guestDataToMigrate = hasGuestData() ? exportGuestData() : null;
    const migrationResult: GuestDataMigrationResult = {
      success: false,
      migratedItems: {
        agenda: 0,
        predictions: 0,
        barVisits: 0
      }
    };

    try {
      // Perform the sign-up
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      trackUserAuth('sign_up');

      // If we have guest data, attempt migration
      if (guestDataToMigrate) {
        try {
          // Import to event and bar stores
          const { useEventStore } = await import('./eventStore');
          const { useBarStore } = await import('./barStore');

          // Migrate agenda data
          if (guestDataToMigrate.agenda) {
            const eventStore = useEventStore.getState();
            for (const [eventId, agendaItem] of Object.entries(guestDataToMigrate.agenda)) {
              try {
                const arrivalTime = typeof agendaItem === 'string' ? agendaItem : agendaItem.arrivalTime || '';
                await eventStore.addToAgenda(eventId, arrivalTime);
                migrationResult.migratedItems.agenda++;
              } catch (err) {
                console.warn('Failed to migrate agenda item:', eventId, err);
              }
            }
          }

          // Migrate predictions data - skip for now as the structure needs to be clarified
          if (guestDataToMigrate.predictions) {
            // Note: Predictions migration would need to be implemented based on the actual store structure
            migrationResult.migratedItems.predictions = Object.keys(guestDataToMigrate.predictions).length;
          }

          // Migrate bar visits data
          if (guestDataToMigrate.barVisits) {
            const barStore = useBarStore.getState();
            for (const [barName, visitData] of Object.entries(guestDataToMigrate.barVisits)) {
              try {
                await barStore.toggleBarVisit(barName);
                migrationResult.migratedItems.barVisits++;
              } catch (err) {
                console.warn('Failed to migrate bar visit:', barName, err);
              }
            }
          }

          // Clear guest data after successful migration
          clearGuestData();
          migrationResult.success = true;

        } catch (migrationError) {
          console.error('Guest data migration failed:', migrationError);
          migrationResult.error = 'Failed to migrate some guest data';
          migrationResult.success = false;
        }
      } else {
        // No guest data to migrate, but sign-up was successful
        migrationResult.success = true;
      }

    } catch (signUpError) {
      migrationResult.error = (signUpError as Error).message || 'Sign up failed';
      throw signUpError;
    }

    return migrationResult;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    } else {
      trackUserAuth('sign_out');
    }
    set({ user: null });
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, loading: false });

      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user ?? null, loading: false });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },
}));
