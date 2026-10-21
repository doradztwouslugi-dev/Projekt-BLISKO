import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { theme } from '../theme';
import { strings } from '../i18n/pl';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useUserStore } from '../stores/userStore';

const tagGroups = [
  { id: 'a', label: 'Chcę wyjść z domu', subtitle: 'Poznać sąsiadów' },
  { id: 'b', label: 'Szukam głębokich dyskusji', subtitle: 'Podobnych umysłów' },
  { id: 'c', label: 'Jestem na konkretnym etapie życiowym', subtitle: 'Rodzice, nowi w mieście…' },
];

const interestTags = [
  { id: 'noworodek', label: 'Noworodek', emoji: '👶', count: 12 },
  { id: 'niemowle', label: 'Niemowlę', emoji: '🍼', count: 18 },
  { id: 'praca-zdalna', label: 'Praca zdalna', emoji: '💻', count: 25 },
  { id: 'nowy-w-miescie', label: 'Nowy w mieście', emoji: '🏙️', count: 14 },
  { id: 'geopolityka', label: 'Geopolityka', emoji: '🌍', count: 9 },
  { id: 'redpill', label: 'Redpill', emoji: '💊', count: 6 },
  { id: 'rozwoj', label: 'Rozwój osobisty', emoji: '🌱', count: 27 },
  { id: 'psycho', label: 'Psychologia', emoji: '🧩', count: 19 },
  { id: 'szachy', label: 'Szachy', emoji: '♟️', count: 11 },
  { id: 'pies', label: 'Spacery z psem', emoji: '🐕', count: 34 },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { draft, setIntent, toggleTag, setName, setAge, setGender, reset } = useOnboardingStore();
  const [step, setStep] = useState(1);

  const canContinueStepOne = Boolean(draft.intentId);
  const canContinueStepTwo = draft.selectedTags.length > 0;
  const canContinueStepThree =
    draft.name.trim().length > 0 && draft.age.trim().length > 0 && draft.gender !== null;

  const headerText = useMemo(() => {
    if (step === 1) return strings.onboarding.title;
    if (step === 2) return strings.onboarding.interests;
    return strings.onboarding.login;
  }, [step]);

  const handleFinish = () => {
    useUserStore.getState().setOnboarding({
      first_name: draft.name.trim(),
      birth_year: Number(draft.age),
      gender: draft.gender ?? 'O',
      onboarding_completed: true,
    });

    reset();
    router.replace('/(tabs)');
  };

  const renderSelection = () => (
    <View style={styles.intentList}>
      {tagGroups.map((item) => {
        const active = draft.intentId === item.id;
        return (
          <Pressable
            key={item.id}
            style={[styles.intentCard, active && styles.intentCardActive]}
            onPress={() => setIntent(item.id)}
          >
            <View style={styles.intentBadge}>
              <Text style={styles.intentBadgeText}>☕</Text>
            </View>
            <View style={styles.intentContent}>
              <Text style={styles.intentTitle}>{item.label}</Text>
              <Text style={styles.intentSubtitle}>{item.subtitle}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderTags = () => (
    <View style={styles.tagsWrap}>
      {interestTags.map((tag) => {
        const active = draft.selectedTags.includes(tag.id);
        return (
          <Pressable
            key={tag.id}
            style={[styles.tagChip, active && styles.tagChipActive]}
            onPress={() => toggleTag(tag.id)}
          >
            <Text style={styles.tagLabel}>
              {tag.emoji} {tag.label}
            </Text>
            <Text style={[styles.tagCount, active && styles.tagCountActive]}>{`+${tag.count}`}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.step}>{strings.onboarding.step}</Text>
        <Text style={styles.heroTitle}>{headerText}</Text>
        <Text style={styles.heroSubtitle}>{strings.onboarding.subtitle}</Text>

        {step === 1 && renderSelection()}

        {step === 2 && (
          <>
            <Text style={styles.sectionTitle}>{strings.onboarding.interests}</Text>
            {renderTags()}
          </>
        )}

        {step === 3 && (
          <View style={styles.loginSection}>
            <Text style={styles.sectionTitle}>{strings.onboarding.login}</Text>
            <Text style={styles.formLabel}>{strings.onboarding.name}</Text>
            <Text style={styles.textInput}>{draft.name || 'Imię'}</Text>
            <Text style={styles.formLabel}>{strings.onboarding.age}</Text>
            <Text style={styles.textInput}>{draft.age || 'Wiek'}</Text>
            <Text style={styles.formLabel}>{strings.onboarding.gender}</Text>
            <View style={styles.genderRow}>
              {['K', 'M', 'I'].map((value) => {
                const normalized = value === 'K' ? 'F' : value === 'M' ? 'M' : 'O';
                const active = draft.gender === normalized;
                return (
                  <Pressable
                    key={value}
                    style={[styles.genderButton, active && styles.genderButtonActive]}
                    onPress={() => setGender(normalized as 'F' | 'M' | 'O')}
                  >
                    <Text style={[styles.genderText, active && styles.genderTextActive]}>
                      {value === 'K' ? 'Kobieta' : value === 'M' ? 'Mężczyzna' : 'Inna'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 1 && (
          <Pressable
            style={[styles.primaryButton, !canContinueStepOne && styles.primaryButtonDisabled]}
            disabled={!canContinueStepOne}
            onPress={() => setStep(2)}
          >
            <Text style={styles.primaryButtonText}>{strings.common.next}</Text>
          </Pressable>
        )}

        {step === 2 && (
          <Pressable
            style={[styles.primaryButton, !canContinueStepTwo && styles.primaryButtonDisabled]}
            disabled={!canContinueStepTwo}
            onPress={() => setStep(3)}
          >
            <Text style={styles.primaryButtonText}>{strings.common.next}</Text>
          </Pressable>
        )}

        {step === 3 && (
          <Pressable
            style={[styles.primaryButton, !canContinueStepThree && styles.primaryButtonDisabled]}
            disabled={!canContinueStepThree}
            onPress={handleFinish}
          >
            <Text style={styles.primaryButtonText}>{strings.onboarding.loginButton}</Text>
          </Pressable>
        )}

        {step > 1 && (
          <Pressable style={styles.secondaryLink} onPress={() => setStep((prev) => Math.max(1, prev - 1))}>
            <Text style={styles.secondaryLinkText}>{strings.common.back}</Text>
          </Pressable>
        )}

        <Link href="/(tabs)" style={styles.secondaryLink}>
          <Text style={styles.secondaryLinkText}>{strings.common.preview}</Text>
        </Link>
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 80,
  },
  step: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: theme.colors.muted,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 24,
  },
  intentList: {
    gap: 12,
    marginBottom: 20,
  },
  intentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intentCardActive: {
    borderColor: theme.colors.primary,
  },
  intentBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff1e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intentBadgeText: {
    fontSize: 20,
  },
  intentContent: {
    flex: 1,
  },
  intentTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  intentSubtitle: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  tagLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '700',
  },
  tagCount: {
    marginLeft: 8,
    backgroundColor: '#f9d36a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  tagCountActive: {
    backgroundColor: '#ffe2a6',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  loginSection: {
    marginTop: 16,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: 16,
  },
  formLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  genderButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  genderText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  genderTextActive: {
    color: '#fff',
  },
  secondaryLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  secondaryLinkText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
