import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useUserStore } from '../stores/userStore';

export default function AppGate() {
  const router = useRouter();
  const session = useUserStore((state) => state.session);

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth');
    }
  }, [session, router]);

  return null;
}
