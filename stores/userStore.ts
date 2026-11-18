import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ConversationStart } from './accessPlans';

export type AccessPlan = 'free' | 'plus' | 'premium';

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
  accessPlan: AccessPlan;
  accountCreatedAt: string | null;
  conversationStarts: ConversationStart[];
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: Session | null) => void;
  setAccessPlan: (accessPlan: AccessPlan) => void;
  recordConversationStart: (postId: string) => void;
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
      accessPlan: 'free',
      accountCreatedAt: null,
      conversationStarts: [],
      hydrated: false,

      setUser: (user) =>
        set((state) => {
          if (!user) return { user: null };
          const isNewAccount = state.user?.id !== user.id;
          return {
            user,
            accountCreatedAt: isNewAccount ? new Date().toISOString() : state.accountCreatedAt ?? new Date().toISOString(),
            accessPlan: isNewAccount ? 'free' : state.accessPlan,
          };
        }),

      setSession: (session) => set({ session }),

      // This plan selector is for local prototype testing only; it is not purchase validation.
      setAccessPlan: (accessPlan) => set({ accessPlan }),

      recordConversationStart: (postId) =>
        set((state) => {
          const userId = state.user?.id;
          if (!userId || state.conversationStarts.some((start) => start.userId === userId && start.postId === postId)) {
            return state;
          }
          return {
            conversationStarts: [
              ...state.conversationStarts,
              { userId, postId, createdAt: new Date().toISOString() },
            ],
          };
        }),

      setOnboarding: (payload) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...payload, onboarding_completed: true }
            : { id: 'local-user', ...payload, onboarding_completed: true },
          accountCreatedAt: state.accountCreatedAt ?? new Date().toISOString(),
        })),

      updateUser: (payload) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...payload }
            : { id: 'local-user', ...payload },
          accountCreatedAt: state.accountCreatedAt ?? new Date().toISOString(),
        })),

      clearUser: () => set({ user: null, session: null, accessPlan: 'free', accountCreatedAt: null }),

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
