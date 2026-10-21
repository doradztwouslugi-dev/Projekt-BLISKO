import { supabase } from './supabase';

export type ConversationRow = {
  id: string;
  conversation_id?: string;
  other_name?: string | null;
  post_snippet?: string | null;
  last_body?: string | null;
  last_at?: string | null;
  unread?: number | null;
  meeting_confirmed_both?: boolean | null;
};

export type ChatMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  kind: 'text' | 'pin' | 'system';
  body: string;
  pin_lat?: number | null;
  pin_lng?: number | null;
  created_at: string;
  sender_name?: string | null;
};

export async function startConversation(postId: string) {
  const { data, error } = await supabase.rpc('start_conversation', { p_post: postId });
  if (error) throw error;
  return data as string;
}

export async function sendMessage(conversationId: string, body: string) {
  const { data, error } = await supabase.rpc('send_message', {
    p_conv: conversationId,
    p_body: body,
  });
  if (error) throw error;
  return data as string;
}

export async function sharePin(conversationId: string, lat: number, lng: number) {
  const { data, error } = await supabase.rpc('share_pin', {
    p_conv: conversationId,
    p_lat: lat,
    p_lng: lng,
  });
  if (error) throw error;
  return data as string;
}

export async function confirmMeeting(conversationId: string) {
  const { data, error } = await supabase.rpc('confirm_meeting', {
    p_conv: conversationId,
  });
  if (error) throw error;
  return data;
}

export async function reportConversation(conversationId: string, reason: string) {
  const { error } = await supabase.rpc('report_conversation', {
    p_conv: conversationId,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function markConversationRead(conversationId: string) {
  const { error } = await supabase.rpc('mark_conversation_read', {
    p_conv: conversationId,
  });
  if (error) throw error;
}

export async function fetchConversation(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ChatMessageRow[];
}

export async function fetchMyConversations() {
  const { data, error } = await supabase.rpc('my_conversations');
  if (error) throw error;
  return data as ConversationRow[];
}
