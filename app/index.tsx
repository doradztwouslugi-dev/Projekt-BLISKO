import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';

export default function AppGate() {
  const router = useRouter();
  const session = useUserStore((state) => state.session);
  const setSession = useUserStore((state) => state.setSession);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const syncUserFromSession = (nextSession: any) => {
      if (!nextSession?.user) {
        setSession(null);
        clearUser();
        return;
      }

      const user = nextSession.user;

      setSession(nextSession);
      setUser({
        id: user.id,
        email: user.email ?? null,
        first_name: user.user_metadata?.first_name ?? 'Użytkownik',
        onboarding_completed: false,
      });
    };

    const bootstrap = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      syncUserFromSession(currentSession);
      setReady(true);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      syncUserFromSession(nextSession);
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearUser, setSession, setUser]);

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? '/(tabs)' : '/auth');
  }, [ready, session, router]);

  return null;
}
