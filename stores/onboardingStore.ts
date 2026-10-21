import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Gender, OnboardingDraft } from '../lib/types';

type OnboardingState = {
  draft: OnboardingDraft;
  setIntent: (intentId: string | null) => void;
  setTags: (tags: string[]) => void;
  toggleTag: (tagId: string) => void;
  setName: (name: string) => void;
  setAge: (age: string) => void;
  setGender: (gender: Gender | null) => void;
  reset: () => void;
};

const emptyDraft: OnboardingDraft = {
  intentId: null,
  selectedTags: [],
  name: '',
  age: '',
  gender: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      setIntent: (intentId) =>
        set((state) => ({
          draft: { ...state.draft, intentId },
        })),
      setTags: (selectedTags) =>
        set((state) => ({
          draft: { ...state.draft, selectedTags },
        })),
      toggleTag: (tagId) =>
        set((state) => {
          const selectedTags = state.draft.selectedTags.includes(tagId)
            ? state.draft.selectedTags.filter((id) => id !== tagId)
            : [...state.draft.selectedTags, tagId];

          return {
            draft: { ...state.draft, selectedTags },
          };
        }),
      setName: (name) =>
        set((state) => ({
          draft: { ...state.draft, name },
        })),
      setAge: (age) =>
        set((state) => ({
          draft: { ...state.draft, age },
        })),
      setGender: (gender) =>
        set((state) => ({
          draft: { ...state.draft, gender },
        })),
      reset: () => set({ draft: emptyDraft }),
    }),
    {
      name: 'wokol-ciebie-onboarding',
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
    },
  ),
);
