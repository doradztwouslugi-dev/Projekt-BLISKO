import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function PinPreview() {
  return (
    <View style={styles.container}>
      <Ionicons name="location-sharp" size={18} color="#6B7280" />
      <Text style={styles.text}>Lokalizacja przypięta do ogłoszenia</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 16,
    marginTop: 4,
  },
  text: {
    fontSize: 12,
    color: '#6B7280',
  },
});
