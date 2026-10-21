import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  category: 'parenting' | 'hobby';
  onSelect: (text: string) => void;
};

const pills: Record<'parenting' | 'hobby', string[]> = {
  parenting: [
    'Hej! Chętnie dołączę do spaceru. O której dokładnie?',
    'Cześć! Też spaceruję w okolicy. Masz ochotę na kawę?',
    'Jasne, mogę przyjść po 18:00. Gdzie dokładnie?',
  ],
  hobby: [
    'Cześć, chętnie zagram i pogadamy!',
    'Hej, mogę dołączyć od tej godziny. Gdzie się spotykamy?',
    'Jasne, jestem wolny po południu. Gdzie dokładnie?',
  ],
};

export function QuickPills({ category, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Szybki start</Text>
      {pills[category].map((pill, index) => (
        <Pressable key={`${pill}-${index}`} onPress={() => onSelect(pill)} style={styles.pill}>
          <Text style={styles.pillText}>{pill}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  pill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillText: {
    fontSize: 12,
    color: '#1F2937',
  },
});
