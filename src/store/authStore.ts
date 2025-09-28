import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { trackUserAuth } from '../utils/analytics';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdminUser: () => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw error;
    } else {
      trackUserAuth('sign_up');
    }
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