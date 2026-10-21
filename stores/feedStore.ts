import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FeedCategory = 'life' | 'mind' | 'hobby';

export type FeedPost = {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  text: string;
  tags: string[];
  category: FeedCategory;
  location_label?: string;
  distance_m?: number;
  created_at: string;
};

type FeedState = {
  posts: FeedPost[];
  addPost: (post: Omit<FeedPost, 'id' | 'created_at'> & { id?: string; created_at?: string }) => void;
  setPosts: (posts: FeedPost[]) => void;
};

const initialPosts: FeedPost[] = [
  {
    id: '1',
    author_id: 'seed-1',
    author_name: 'Ania',
    title: 'Spacer z wózkiem',
    text: 'Spacer wokół stawów. Szukam pogaduszek z inną mamą.',
    tags: ['Noworodek', 'Niemowlę'],
    category: 'life',
    location_label: 'Oleśnica',
    distance_m: 300,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    author_id: 'seed-2',
    author_name: 'Tomek',
    title: 'Szachy + Geopolityka',
    text: 'Szukam kogoś na 2-3 partie w parku miejskim.',
    tags: ['Szachy', 'Geopolityka'],
    category: 'mind',
    location_label: 'Park Miejski',
    distance_m: 1200,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    author_id: 'seed-3',
    author_name: 'Kamil',
    title: 'Wybieg dla psów',
    text: 'Idziemy na wybieg w parku, chętnie poznamy inne psiaki.',
    tags: ['Spacery z psem'],
    category: 'hobby',
    location_label: 'Park Miejski',
    distance_m: 500,
    created_at: new Date().toISOString(),
  },
];

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      posts: initialPosts,
      setPosts: (posts) => set({ posts }),
      addPost: (post) =>
        set((state) => ({
          posts: [
            {
              ...post,
              id: post.id ?? Date.now().toString(),
              created_at: post.created_at ?? new Date().toISOString(),
            },
            ...state.posts,
          ],
        })),
    }),
    {
      name: 'wokol-ciebie-feed',
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
