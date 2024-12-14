import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface SupabaseUser extends User {
  raw_user_meta_data?: {
    is_admin?: boolean;
  };
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthStore {
  isAuthenticated: boolean;
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error('No user data returned');
        }

        const role = data.user.user_metadata.is_admin === true ? 'admin' : 'user';
        
        set({
          isAuthenticated: true,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name || email.split('@')[0],
            role
          }
        });
      },
      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        
        set({
          isAuthenticated: false,
          user: null
        });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);