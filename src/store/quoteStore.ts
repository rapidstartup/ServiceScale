import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface Quote {
  id: string;
  user_id: string;
  customer_id: string;
  status: 'active' | 'converted' | 'lost';
  service: string;
  total: number;
  template_id: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  created_at?: string;
  updated_at?: string;
  property_details: {
    address: {
      streetAddress: string;
      city: string;
      state: string;
    };
    type: string;
    size: string;
    yearBuilt: string;
    bedrooms: string;
    bathrooms: string;
  };
}

interface QuoteStore {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  fetchQuotes: () => Promise<void>;
  addQuote: (quote: Omit<Quote, 'id' | 'user_id'>) => Promise<void>;
  updateQuote: (id: string, quote: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  updateQuoteStatus: (id: string, status: Quote['status']) => Promise<void>;
  trackQuoteView: (id: string) => Promise<void>;
}

export const useQuoteStore = create<QuoteStore>()((set) => ({
  quotes: [],
  isLoading: false,
  error: null,

  fetchQuotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ quotes: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addQuote: async (quote) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const quoteWithMetadata = {
        ...quote,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert(quoteWithMetadata)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        quotes: [data, ...state.quotes]
      }));

      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuote: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        quotes: state.quotes.map(quote =>
          quote.id === id ? { ...quote, ...data } : quote
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteQuote: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .match({ id });

      if (error) throw error;

      set(state => ({
        quotes: state.quotes.filter(quote => quote.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuoteStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update({ status })
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        quotes: state.quotes.map(quote =>
          quote.id === id ? { ...quote, ...data } : quote
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  trackQuoteView: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('quotes')
        .update({
          opened_at: now,
          clicked_at: now
        })
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        quotes: state.quotes.map(quote =>
          quote.id === id ? { ...quote, ...data } : quote
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));