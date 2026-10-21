import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import { theme } from '../theme';

export default function AuthScreen() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setSession = useUserStore((state) => state.setSession);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Uzupełnij dane', 'Email i hasło są wymagane.');
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName || 'Użytkownik',
            },
          },
        });

        if (error) throw error;

        const user = data.user;
        const session = data.session;

        if (user) {
          setUser({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name ?? firstName || 'Użytkownik',
            onboarding_completed: false,
          });
        }

        if (session) {
          setSession(session);
        }

        Alert.alert('Sukces', 'Konto utworzone. Teraz przejdź do konfiguracji profilu.');
        router.replace('/onboarding');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const user = data.user;
        const session = data.session;

        if (user) {
          setUser({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name ?? 'Użytkownik',
            onboarding_completed: false,
          });
        }

        if (session) {
          setSession(session);
        }

        router.replace('/onboarding');
      }
    } catch (error: any) {
      Alert.alert('Błąd', error?.message ?? 'Nie udało się zalogować.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
        </Text>

        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Witaj z powrotem'
            : 'Dołącz do społeczności wokół Ciebie'}
        </Text>

        {mode === 'signup' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Imię</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Twoje imię"
              autoCapitalize="words"
              style={styles.input}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hasło</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={handleAuth}>
          <Text style={styles.primaryButtonText}>
            {mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === 'login' ? 'Nie masz konta? Zarejestruj się' : 'Masz konto? Zaloguj się'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
