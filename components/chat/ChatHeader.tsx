import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  category: 'parenting' | 'hobby';
  title: string;
  author: string;
  age: number;
  onBack: () => void;
  onReport: () => void;
};

export function ChatHeader({ category, title, author, age, onBack, onReport }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {category === 'parenting' ? 'Rodzicielstwo' : 'Hobby'}
          </Text>
        </View>

        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={18} color="#6B7280" />
          <Text style={styles.backText}>Wróć</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {author} ({age} l.)
        </Text>

        <Pressable onPress={onReport} style={styles.reportButton}>
          <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
          <Text style={styles.reportText}>Zgłoś</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  reportText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
});
