import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  meetingStatus: 'none' | 'mine' | 'both';
  onSharePin: () => void;
  onConfirm: () => void;
};

export function ActionBar({ meetingStatus, onSharePin, onConfirm }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onSharePin} style={styles.button}>
        <Ionicons name="location-outline" size={15} color="#1F2937" />
        <Text style={styles.buttonText}>Udostępnij pinezkę</Text>
      </Pressable>

      <Pressable
        onPress={onConfirm}
        disabled={meetingStatus === 'both'}
        style={[styles.buttonPrimary, meetingStatus === 'both' && styles.buttonPrimaryDisabled]}
      >
        <Ionicons name="checkmark-circle-outline" size={15} color="#fff" />
        <Text style={styles.buttonPrimaryText}>
          {meetingStatus === 'both' ? 'Potwierdzone' : 'Potwierdź spotkanie'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonPrimaryDisabled: {
    backgroundColor: '#A5B4FC',
  },
  buttonPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
