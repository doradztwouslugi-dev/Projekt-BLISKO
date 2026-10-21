import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

type ChatState = {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  openConversation: (postId: string, postTitle: string, participantId: string) => void;
  sendMessage: (conversationId: string, senderId: string, text: string) => void;
  getMessages: (conversationId: string) => ChatMessage[];
};

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
      openConversation: (postId, postTitle, participantId) => {
        const state = get();
        const existing = state.conversations.find((c) => c.post_id === postId);

        if (existing) return;

        const newConversation: Conversation = {
          id: `conv-${Date.now()}`,
          post_id: postId,
          participant_ids: ['me', participantId],
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
      },
      sendMessage: (conversationId, senderId, text) => {
        const message: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: senderId,
          text,
          created_at: new Date().toISOString(),
        };

        set((prev) => ({
          messagesByConversation: {
            ...prev.messagesByConversation,
            [conversationId]: [...(prev.messagesByConversation[conversationId] ?? []), message],
          },
          conversations: prev.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, last_message_at: message.created_at }
              : conv,
          ),
        }));
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
