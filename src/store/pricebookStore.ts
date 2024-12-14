import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface PricebookEntry {
  id: string;
  user_id: string;
  name: string;
  price: number;
  description: string;
  upload_id?: string;
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PricebookStore {
  entries: PricebookEntry[];
  selectedUploadId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addEntries: (entries: Partial<PricebookEntry>[], uploadId: string) => Promise<void>;
  removeEntriesByUploadId: (uploadId: string) => Promise<void>;
  setSelectedUploadId: (uploadId: string | null) => void;
  updateEntry: (id: string, updates: Partial<PricebookEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  undeleteEntry: (id: string) => Promise<void>;
}

export const usePricebookStore = create<PricebookStore>()((set) => ({
  entries: [],
  selectedUploadId: null,
  isLoading: false,
  error: null,

  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pricebook_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ entries: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addEntries: async (entries, uploadId) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const entriesWithMetadata = entries.map(entry => ({
        name: entry.name,
        price: entry.price,
        description: entry.description,
        user_id: user.id,
        upload_id: uploadId,
        ...((entry.id && { id: entry.id }) || {})
      }));

      const { data, error } = await supabase
        .from('pricebook_entries')
        .insert(entriesWithMetadata)
        .select();

      if (error) throw error;

      set(state => ({
        entries: [...(data || []), ...state.entries]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeEntriesByUploadId: async (uploadId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('pricebook_entries')
        .delete()
        .match({ upload_id: uploadId });

      if (error) throw error;

      set(state => ({
        entries: state.entries.filter(entry => entry.upload_id !== uploadId),
        selectedUploadId: state.selectedUploadId === uploadId ? null : state.selectedUploadId
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedUploadId: (uploadId) => {
    set({ selectedUploadId: uploadId });
  },

  updateEntry: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pricebook_entries')
        .update(updates)
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, ...data } : entry
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('pricebook_entries')
        .update({ deleted: true })
        .match({ id });

      if (error) throw error;

      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, deleted: true } : entry
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  undeleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('pricebook_entries')
        .update({ deleted: false })
        .match({ id });

      if (error) throw error;

      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, deleted: false } : entry
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