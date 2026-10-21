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
import { router } from 'expo-router';

import { theme } from '../theme';
import { useFeedStore, type FeedCategory } from '../stores/feedStore';
import { useUserStore } from '../stores/userStore';

const categories: Array<{ key: FeedCategory; label: string }> = [
  { key: 'life', label: 'Etapy życia' },
  { key: 'mind', label: 'Dyskusje' },
  { key: 'hobby', label: 'Hobby' },
];

const suggestedTags = [
  'Noworodek',
  'Niemowlę',
  'Praca zdalna',
  'Nowy w mieście',
  'Rozwój',
  'Psychologia',
  'Szachy',
  'Spacery z psem',
];

export default function NewPostScreen() {
  const user = useUserStore((state) => state.user);
  const addPost = useFeedStore((state) => state.addPost);

  const [category, setCategory] = useState<FeedCategory>('life');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Noworodek']);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleSave = () => {
    if (!text.trim()) return;

    addPost({
      author_id: user?.id ?? 'local-user',
      author_name: user?.first_name ?? 'Ty',
      title: title.trim() || 'Nowy wpis',
      text: text.trim(),
      tags: selectedTags,
      category,
      location_label: 'Oleśnica',
      distance_m: 400,
      created_at: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nowy post</Text>

        <Text style={styles.label}>Kategoria</Text>
        <View style={styles.categoryRow}>
          {categories.map((item) => (
            <Pressable
              key={item.key}
              style={[
                styles.categoryButton,
                category === item.key && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(item.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item.key && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Tytuł</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="np. Spacer z wózkiem"
          style={styles.input}
        />

        <Text style={styles.label}>Treść</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Opisz, czego szukasz albo co chcesz zrobić..."
          multiline
          numberOfLines={6}
          style={[styles.input, styles.textArea]}
        />

        <Text style={styles.label}>Tagi</Text>
        <View style={styles.tagWrap}>
          {suggestedTags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.tag, active && styles.tagActive]}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!text.trim()}
          style={[styles.saveButton, !text.trim() && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveText}>Opublikuj</Text>
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
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 20,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#f3eadf',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagActive: {
    backgroundColor: theme.colors.accent,
  },
  tagText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  tagTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
