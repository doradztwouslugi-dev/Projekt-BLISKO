import { Link } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export default function NewPostScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Co robisz? 📣</Text>
        <Text style={styles.label}>Opis</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputText}>Np. Idę na spacer nad staw, szukam towarzystwa…</Text>
        </View>

        <Text style={styles.label}>Tagi</Text>
        <View style={styles.tagsWrap}>
          {['Noworodek', 'Szachy', 'Spacery z psem'].map((tag) => (
            <Text key={tag} style={styles.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={styles.label}>Aktywne przez</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputText}>3 godziny</Text>
        </View>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Opublikuj</Text>
        </Pressable>

        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Anuluj</Text>
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
    paddingTop: 28,
    paddingBottom: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 18,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 10,
  },
  inputBox: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  inputText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  tag: {
    backgroundColor: '#efefe7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.text,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
