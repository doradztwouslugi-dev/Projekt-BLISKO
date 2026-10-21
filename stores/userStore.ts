import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthUser = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  onboarding_completed?: boolean;
};

type UserState = {
  user: AuthUser | null;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
  setHydrated: (value: boolean) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
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
