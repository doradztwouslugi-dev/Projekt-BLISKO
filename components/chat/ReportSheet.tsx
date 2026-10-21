import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (reason: string) => void;
};

export function ReportSheet({ visible, onClose, onSelect }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Zgłoś rozmowę</Text>

        {['Spam', 'Nękanie', 'Niewłaściwe treści', 'Inne'].map((reason) => (
          <Pressable key={reason} onPress={() => onSelect(reason)} style={styles.item}>
            <Text style={styles.itemText}>{reason}</Text>
          </Pressable>
        ))}

        <Pressable onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>Anuluj</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemText: {
    fontSize: 14,
    color: '#1F2937',
  },
  cancel: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
});
