import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useFeedStore, type FeedCategory } from '../stores/feedStore';
import { useUserStore } from '../stores/userStore';
import { theme } from '../theme';

export default function NewPostScreen() {
  const user = useUserStore((state) => state.user);
  const addPost = useFeedStore((state) => state.addPost);

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<FeedCategory>('life');
  const [tagsInput, setTagsInput] = useState('');

  const handlePublish = () => {
    const cleanTitle = title.trim();
    const cleanText = text.trim();
    const parsedTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!cleanTitle || !cleanText) return;

    addPost({
      author_id: user?.id ?? 'guest-user',
      author_name: user?.first_name ?? 'Ty',
      title: cleanTitle,
      text: cleanText,
      tags: parsedTags.length > 0 ? parsedTags : ['Nowy post'],
      category,
      location_label: 'Oleśnica',
      distance_m: 300,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.title}>Nowy post</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Tytuł</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="np. Szukam towarzysza do spaceru"
          style={styles.input}
          maxLength={80}
        />

        <Text style={styles.label}>Kategoria</Text>

        <View style={styles.categoryRow}>
          {(['life', 'mind', 'hobby'] as FeedCategory[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryChip,
                category === item && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === item && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Treść</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Napisz, czego szukasz lub z kim chcesz się spotkać..."
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Tagi</Text>
        <TextInput
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder="np. spacery, mamusie, park"
          style={styles.input}
        />

        <Pressable
          onPress={handlePublish}
          disabled={!title.trim() || !text.trim()}
          style={[
            styles.publishButton,
            (!title.trim() || !text.trim()) && styles.publishButtonDisabled,
          ]}
        >
          <Text style={styles.publishButtonText}>Opublikuj</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  backText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 140,
    paddingTop: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.text,
  },
  categoryChipText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  publishButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
