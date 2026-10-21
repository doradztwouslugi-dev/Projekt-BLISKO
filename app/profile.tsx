import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { theme } from '../../theme';

const tags = ['Noworodek', 'Rozwój osobisty', 'Psychologia', 'Planszówki'];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Cześć, Ania 👋</Text>

        <Pressable style={styles.statusCard}>
          <Text style={styles.statusLabel}>🟢 Szukam towarzystwa</Text>
          <Text style={styles.muted}>Dostajesz powiadomienia z okolicy</Text>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>🌙 Godziny ciszy</Text>
          <Text style={styles.switchPill}>ON</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>🤝 Dopasowanie do tej samej płci</Text>
          <Text style={styles.switchPill}>ON</Text>
        </View>

        <Text style={styles.sectionTitle}>Moje zainteresowania</Text>
        <View style={styles.tagsWrap}>
          {tags.map((tag) => (
            <Text key={tag} style={styles.tag}>#{tag}</Text>
          ))}
        </View>

        <Text style={styles.notice}>🔒 Posty ze światopoglądowymi tagami widzą tylko osoby, które same je zaznaczyły.</Text>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>🔔 Zasymuluj powiadomienie push</Text>
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
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 18,
  },
  statusCard: {
    backgroundColor: '#2bb673',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  muted: {
    color: '#e5f9ee',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  rowLabel: {
    color: theme.colors.text,
    fontWeight: '700',
    maxWidth: '75%',
  },
  switchPill: {
    backgroundColor: '#f0e4d6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '800',
    color: theme.colors.text,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 12,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.text,
    fontWeight: '700',
  },
  notice: {
    marginTop: 18,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
