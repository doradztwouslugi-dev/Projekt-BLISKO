import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../theme';
import { bootstrapAuth, signInWithApple, signInWithGoogle } from '../lib/auth';

export default function LoginScreen() {
  const [status, setStatus] = useState('Przygotowanie połączenia Supabase…');

  useEffect(() => {
    bootstrapAuth().finally(() => {
      setStatus('Gotowe do logowania');
    });
  }, []);

  const handleGoogle = async () => {
    setStatus('Logowanie Google…');
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (error) {
      setStatus('Nie udało się zalogować z Google. Sprawdź klucze Supabase.');
    }
  };

  const handleApple = async () => {
    setStatus('Logowanie Apple…');
    try {
      await signInWithApple();
      router.replace('/');
    } catch (error) {
      setStatus('Nie udało się zalogować z Apple. Sprawdź konfigurację auth.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Supabase</Text>
        <Text style={styles.title}>Zaloguj się do Wokół Ciebie</Text>
        <Text style={styles.body}>Połączenie z Supabase jest przygotowane. W kolejnym kroku podłączysz klucze w .env i aktywujesz auth.</Text>

        <Pressable style={styles.primaryButton} onPress={handleGoogle}>
          <Text style={styles.primaryButtonText}>Kontynuuj z Google</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleApple}>
          <Text style={styles.secondaryButtonText}>Kontynuuj z Apple</Text>
        </Pressable>

        <Text style={styles.status}>{status}</Text>
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
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  eyebrow: {
    color: theme.colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#000',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  status: {
    marginTop: 20,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
