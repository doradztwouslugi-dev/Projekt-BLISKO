import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  city?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  onboarding_completed?: boolean;
  gender?: 'F' | 'M' | 'O' | null;
  birth_year?: number | null;
  home_radius_km?: number | null;
};

type UserState = {
  user: AuthUser | null;
  session: Session | null;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  setOnboarding: (payload: Partial<AuthUser>) => void;
  updateUser: (payload: Partial<AuthUser>) => void;
  clearUser: () => void;
  setHydrated: (value: boolean) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      hydrated: false,

      setUser: (user) => set({ user }),

      setSession: (session) => set({ session }),

      setOnboarding: (payload) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...payload, onboarding_completed: true }
            : { id: 'local-user', ...payload, onboarding_completed: true },
        })),

      updateUser: (payload) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...payload }
            : { id: 'local-user', ...payload },
        })),

      clearUser: () => set({ user: null, session: null }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'wokol-ciebie-user',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
