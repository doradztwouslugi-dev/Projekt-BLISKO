import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';

export async function bootstrapAuth() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return;

  const sessionUser = data.session?.user;
  if (!sessionUser) {
    useUserStore.getState().clearUser();
    return;
  }

  useUserStore.getState().setUser({
    id: sessionUser.id,
    email: sessionUser.email,
    first_name: sessionUser.user_metadata?.full_name ?? null,
  });
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'exp://localhost:8081',
      skipBrowserRedirect: false,
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'exp://localhost:8081',
      skipBrowserRedirect: false,
    },
  });

  if (error) throw error;
  return data;
}

export async function completeOnboarding(payload: {
  first_name: string;
  birth_year: number;
  gender: 'F' | 'M' | 'O';
  tag_ids: string[];
  consent: boolean;
}) {
  const { error } = await supabase.rpc('complete_onboarding', {
    p_first_name: payload.first_name,
    p_birth_year: payload.birth_year,
    p_gender: payload.gender,
    p_tag_ids: payload.tag_ids,
    p_consent: payload.consent,
  });

  if (error) throw error;
}

export async function setHomeArea(lat: number, lng: number) {
  const { error } = await supabase.rpc('update_my_location', {
    p_lat: lat,
    p_lng: lng,
  });

  if (error) throw error;
}
