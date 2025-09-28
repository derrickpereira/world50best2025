import { create } from 'zustand';
import { NewsItem, FaqItem } from '../types';
import { supabase } from '../lib/supabase';

interface NewsState {
  newsItems: NewsItem[];
  faqItems: FaqItem[];
  loading: boolean;
  
  // Actions
  fetchNewsItems: () => Promise<void>;
  fetchFaqItems: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  newsItems: [],
  faqItems: [],
  loading: false,

  fetchNewsItems: async () => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      set(state => ({ ...state, newsItems: data || [] }));
    } catch (error) {
      console.error('Error fetching news items:', error);
    }
  },

  fetchFaqItems: async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      set(state => ({ ...state, faqItems: data || [] }));
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
    }
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().fetchNewsItems(),
        get().fetchFaqItems()
      ]);
    } catch (error) {
      console.error('Error fetching news and FAQ data:', error);
    } finally {
      set({ loading: false });
    }
  },
}));