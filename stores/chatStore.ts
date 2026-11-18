import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getConversationLimitStatus } from './accessPlans';
import { useUserStore } from './userStore';
import { supabase } from '../lib/supabase';

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  post_id: string;
  participant_ids: string[];
  last_message_at?: string;
  created_at: string;
  title?: string;
};

type OpenConversationResult =
  | { ok: true; conversationId: string }
  | { ok: false; reason: 'weekly_limit' | 'active_limit' | 'sign_in_required' };

type ChatState = {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  openConversation: (postId: string, postTitle: string, participantId: string) => Promise<OpenConversationResult>;
  sendMessage: (conversationId: string, senderId: string, text: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessagesForConversation: (conversationId: string) => Promise<void>;
  getMessages: (conversationId: string) => ChatMessage[];
};

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const seedConversations: Conversation[] = [
  {
    id: 'conv-1',
    post_id: '1',
    participant_ids: ['me', 'ania'],
    last_message_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    title: 'Spacer z wózkiem',
  },
];

const seedMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversation_id: 'conv-1',
      sender_id: 'ania',
      text: 'Hej! Chętnie pogadamy o spacerach z dzieckiem.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'm-2',
      conversation_id: 'conv-1',
      sender_id: 'me',
      text: 'Super! Mogę dołączyć po 18:00.',
      created_at: new Date().toISOString(),
    },
  ],
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: seedConversations,
      messagesByConversation: seedMessages,

      openConversation: async (postId, postTitle, participantId) => {
        const existing = get().conversations.find((conversation) => conversation.post_id === postId);
        if (existing) return { ok: true, conversationId: existing.id };

        const userState = useUserStore.getState();
        const userId = userState.user?.id;
        if (!userId) return { ok: false, reason: 'sign_in_required' };

        const accountCreatedAt = userState.accountCreatedAt ?? new Date().toISOString();
        const limitStatus = getConversationLimitStatus({
          plan: userState.accessPlan,
          userId,
          accountCreatedAt,
          starts: userState.conversationStarts,
        });
        if (!limitStatus.allowed) return { ok: false, reason: limitStatus.reason! };

        const newConversation: Conversation = {
          id: makeId('conv'),
          post_id: postId,
          participant_ids: [userId, participantId],
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          title: postTitle,
        };

        set((prev) => ({
          conversations: [newConversation, ...prev.conversations],
          messagesByConversation: {
            ...prev.messagesByConversation,
            [newConversation.id]: [],
          },
        }));
        userState.recordConversationStart(postId);

        try {
          const { error } = await supabase.from('conversations').insert({
            id: newConversation.id,
            post_id: postId,
            participant_ids: [userId, participantId],
            last_message_at: newConversation.last_message_at,
            created_at: newConversation.created_at,
            title: postTitle,
          });

          if (error) console.error('openConversation supabase error:', error);
        } catch (error) {
          console.error('openConversation exception:', error);
        }

        return { ok: true, conversationId: newConversation.id };
      },

      sendMessage: async (conversationId, senderId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const message: ChatMessage = {
          id: makeId('msg'),
          conversation_id: conversationId,
          sender_id: senderId,
          text: trimmed,
          created_at: new Date().toISOString(),
        };

        set((prev) => ({
          messagesByConversation: {
            ...prev.messagesByConversation,
            [conversationId]: [...(prev.messagesByConversation[conversationId] ?? []), message],
          },
          conversations: prev.conversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, last_message_at: message.created_at }
              : conversation,
          ),
        }));

        try {
          const { error } = await supabase.from('messages').insert({
            id: message.id,
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            text: message.text,
            created_at: message.created_at,
          });
          if (error) console.error('sendMessage supabase error:', error);
        } catch (error) {
          console.error('sendMessage exception:', error);
        }
      },

      fetchConversations: async () => {
        try {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .order('last_message_at', { ascending: false });

          if (error) {
            console.error('fetchConversations error:', error);
            return;
          }
          if (data && data.length > 0) set({ conversations: data as Conversation[] });
        } catch (error) {
          console.error('fetchConversations exception:', error);
        }
      },

      fetchMessagesForConversation: async (conversationId) => {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('fetchMessagesForConversation error:', error);
            return;
          }
          if (data) {
            set((prev) => ({
              messagesByConversation: {
                ...prev.messagesByConversation,
                [conversationId]: data as ChatMessage[],
              },
            }));
          }
        } catch (error) {
          console.error('fetchMessagesForConversation exception:', error);
        }
      },

      getMessages: (conversationId) => get().messagesByConversation[conversationId] ?? [],
    }),
    {
      name: 'wokol-ciebie-chat',
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
