import { createClient } from '@supabase/supabase-js';

export type ChatMessageKind = 'text' | 'pin' | 'system';

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  kind: ChatMessageKind;
  body: string;
  pin_lat?: number | null;
  pin_lng?: number | null;
  created_at: string;
  sender_name?: string | null;
};

export type ConversationItem = {
  id: string;
  other_user_id: string;
  other_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  meeting_confirmed: boolean;
};

export async function getMyConversations() {
  const { data, error } = await supabase.rpc('my_conversations');

  if (error) throw error;
  return (data ?? []) as ConversationItem[];
}

export async function startConversation(postId: string) {
  const { data, error } = await supabase.rpc('start_conversation', {
    p_post_id: postId,
  });

  if (error) throw error;
  return data as string;
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function sendMessage(conversationId: string, body: string) {
  const { data, error } = await supabase.rpc('send_message', {
    p_conversation_id: conversationId,
    p_body: body,
  });

  if (error) throw error;
  return data as string;
}

export async function sharePin(conversationId: string, lat: number, lng: number) {
  const { data, error } = await supabase.rpc('share_pin', {
    p_conversation_id: conversationId,
    p_lat: lat,
    p_lng: lng,
  });

  if (error) throw error;
  return data as string;
}

export async function confirmMeeting(conversationId: string) {
  const { data, error } = await supabase.rpc('confirm_meeting', {
    p_conversation_id: conversationId,
  });

  if (error) throw error;
  return data as string;
}

export async function reportConversation(conversationId: string, reason: string) {
  const { data, error } = await supabase.rpc('report_conversation', {
    p_conversation_id: conversationId,
    p_reason: reason,
  });

  if (error) throw error;
  return data as string;
}

export async function markConversationRead(conversationId: string) {
  const { data, error } = await supabase.rpc('mark_conversation_read', {
    p_conversation_id: conversationId,
  });

  if (error) throw error;
  return data as boolean;
}

export function subscribeToConversationMessages(
  conversationId: string,
  onInsert: (message: ChatMessage) => void,
) {
  const channel = supabase.channel(`chat:${conversationId}`);

  const subscription = channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(payload.new as ChatMessage);
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    },
  };
}

export { supabase } from './supabase';
