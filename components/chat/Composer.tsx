import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function Composer({ value, onChangeText, onSend, disabled = false }: Props) {
  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Napisz wiadomość..."
        placeholderTextColor="#6B7280"
        style={styles.input}
        multiline
        maxLength={500}
      />
      <Pressable
        onPress={onSend}
        disabled={disabled || !value.trim()}
        style={[styles.sendButton, (disabled || !value.trim()) && styles.sendButtonDisabled]}
      >
        <Ionicons name="send" size={16} color={disabled || !value.trim() ? '#9CA3AF' : '#fff'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
