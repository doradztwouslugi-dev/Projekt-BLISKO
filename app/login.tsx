import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';

export async function bootstrapAuth() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const sessionUser = data.session?.user;
  if (!sessionUser) {
    useUserStore.getState().clearUser();
    return null;
  }

  const authUser = {
    id: sessionUser.id,
    email: sessionUser.email ?? null,
    first_name: sessionUser.user_metadata?.full_name ?? null,
    onboarding_completed: !!sessionUser.user_metadata?.onboarded,
  };

  useUserStore.getState().setUser(authUser);
  useUserStore.getState().setSession(data.session ?? null);
  return data.session;
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

  const user = useUserStore.getState().user;
  if (user) {
    useUserStore.getState().setUser({ ...user, onboarding_completed: true });
  }
}

export async function setHomeArea(lat: number, lng: number, radiusM = 2000, label?: string) {
  const { error } = await supabase.rpc('set_home_area', {
    p_lat: lat,
    p_lng: lng,
    p_radius_m: radiusM,
    p_label: label ?? null,
  });

  if (error) {
    const fallback = await supabase.rpc('update_my_location', { p_lat: lat, p_lng: lng });
    if (fallback.error) throw fallback.error;
    return;
  }
}
