import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, make any email ending with @admin.com an admin
        const isAdmin = email.toLowerCase().endsWith('@admin.com');
        
        set({
          isAuthenticated: true,
          user: {
            email,
            name: email.split('@')[0],
            role: isAdmin ? 'admin' : 'user'
          }
        });
      },
      logout: () => {
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