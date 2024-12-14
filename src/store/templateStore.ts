import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface TemplateSection {
  id: string;
  type: 'header' | 'content' | 'team' | 'services' | 'certifications' | 'insurance' | 'warranty' | 'reviews' | 'financing';
  title: string;
  content: string;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
  }>;
  order: number;
  settings: {
    backgroundColor: string;
    textColor: string;
    layout: 'left' | 'right' | 'center';
  };
}

export interface QuoteTemplate {
  id: string;
  user_id: string;
  name: string;
  content: string;
  preview_image: string;
  sections: TemplateSection[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateStore {
  templates: QuoteTemplate[];
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<QuoteTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<QuoteTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setDefaultTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>()((set) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ templates: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTemplate: async (template) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert([{
          ...template,
          user_id: useAuthStore.getState().user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        templates: [data, ...state.templates]
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTemplate: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        templates: state.templates.map(template =>
          template.id === id ? { ...template, ...data } : template
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .match({ id });

      if (error) throw error;

      set(state => ({
        templates: state.templates.filter(template => template.id !== id)
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setDefaultTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // First, remove default status from all templates
      await supabase
        .from('templates')
        .update({ is_default: false })
        .neq('id', id);

      // Then set the new default template
      const { error } = await supabase
        .from('templates')
        .update({ is_default: true })
        .match({ id });

      if (error) throw error;

      set(state => ({
        templates: state.templates.map(template => ({
          ...template,
          is_default: template.id === id
        }))
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));