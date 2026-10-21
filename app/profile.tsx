import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { strings } from '../../i18n/pl';
import { useUserStore } from '../../stores/userStore';
import { theme } from '../../theme';

const mockTags = ['Noworodek', 'Praca zdalna', 'Psychologia', 'Spacer z psem'];

export default function ProfileScreen() {
  const user = useUserStore((state) => state.user);

  const firstName = user?.first_name ?? 'Twoja osoba';
  const gender = user?.gender ?? 'O';
  const birthYear = user?.birth_year ?? 1995;
  const radius = user?.home_radius_km ?? 5;
  const onboardingCompleted = user?.onboarding_completed ?? false;

  const genderLabel =
    gender === 'F' ? 'Kobieta' : gender === 'M' ? 'Mężczyzna' : 'Inna';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 1).toUpperCase()}</Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>{strings.profile.title}</Text>
            <Text style={styles.name}>{firstName}</Text>
            <Text style={styles.subtle}>
              {onboardingCompleted ? 'Onboarding zakończony' : 'Wymaga dokończenia'}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>{strings.profile.lookingForCompany}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Płeć</Text>
              <Text style={styles.infoValue}>{genderLabel}</Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Rok urodzenia</Text>
              <Text style={styles.infoValue}>{birthYear}</Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Promień</Text>
              <Text style={styles.infoValue}>{radius} km</Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Tryb</Text>
              <Text style={styles.infoValue}>Wspólne spacery</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>{strings.profile.interests}</Text>
          <View style={styles.tagRow}>
            {mockTags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>{strings.profile.quietHours}</Text>
          <Text style={styles.valueText}>22:00–08:00</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>{strings.profile.sameGender}</Text>
          <Text style={styles.valueText}>Tak, preferuję podobne doświadczenia.</Text>
        </View>

        <Pressable style={styles.pushButton}>
          <Text style={styles.pushButtonText}>{strings.profile.pushPreview}</Text>
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
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  subtle: {
    color: theme.colors.muted,
    marginTop: 4,
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoPill: {
    backgroundColor: '#f7f1ea',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: '46%',
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f6f1ed',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  valueText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  pushButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  pushButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
