import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface TemplateSection {
  id: string;
  type: 'header' | 'team' | 'content';
  title: string;
  content: string;
  order: number;
  images?: {
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
  }[];
  settings: {
    backgroundColor?: string;
    textColor?: string;
    layout?: 'left' | 'center' | 'right';
  };
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_default: boolean;
  preview_image: string;
  sections: TemplateSection[];
  created_at?: string;
  updated_at?: string;
}

interface TemplateStore {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<Template, 'id' | 'user_id'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
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
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addTemplate: async (template) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const templateWithMetadata = {
        ...template,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('templates')
        .insert(templateWithMetadata)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        templates: [data, ...state.templates]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
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
        .update({ ...updates, updated_at: new Date().toISOString() })
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
      set({ error: (error as Error).message });
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
      set({ error: (error as Error).message });
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
      const { data, error } = await supabase
        .from('templates')
        .update({ is_default: true })
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        templates: state.templates.map(template => ({
          ...template,
          is_default: template.id === id ? data.is_default : false
        }))
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));