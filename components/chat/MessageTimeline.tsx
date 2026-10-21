import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Message = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  kind?: 'text' | 'system' | 'pin';
};

type Props = {
  messages: Message[];
  author: string;
};

export function MessageTimeline({ messages, author }: Props) {
  return (
    <View style={styles.container}>
      {messages.length === 0 && (
        <Text style={styles.emptyText}>Brak wiadomości. Rozpocznij ustalenia poniżej.</Text>
      )}

      {messages.map((msg) => {
        const isMine = msg.sender === 'me';

        if (msg.kind === 'system') {
          return (
            <View key={msg.id} style={styles.systemRow}>
              <Text style={styles.systemText}>{msg.text}</Text>
            </View>
          );
        }

        return (
          <View key={msg.id} style={styles.messageRow}>
            <View style={styles.messageLine} />
            <View style={[styles.messageCard, isMine ? styles.messageMine : styles.messageThem]}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageSender}>{isMine ? 'Ty' : author}</Text>
                <Text style={styles.messageTime}>{msg.time}</Text>
              </View>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginVertical: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  messageLine: {
    width: 2,
    minHeight: 30,
    backgroundColor: '#E5E7EB',
    marginTop: 6,
  },
  messageCard: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageMine: {
    backgroundColor: '#F9FAFB',
  },
  messageThem: {
    backgroundColor: '#F9FAFB',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 10,
    color: '#6B7280',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1F2937',
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  systemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
});
