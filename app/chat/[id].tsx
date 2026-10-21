import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { useChatStore } from '../../stores/chatStore';
import { theme } from '../../theme';

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversations = useChatStore((state) => state.conversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const conversation = conversations.find((item) => item.id === id);
  const messages = conversation ? getMessages(conversation.id) : [];

  const [draft, setDraft] = useState('');

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Brak rozmowy</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Wróć</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(conversation.id, 'me', draft.trim());
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <Text style={styles.title}>{conversation.title ?? 'Rozmowa'}</Text>

        <Text style={styles.infoText}>online</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {messages.length === 0 ? (
          <Text style={styles.empty}>Jeszcze nie ma wiadomości</Text>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === 'me';

            return (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  isMine ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isMine ? styles.bubbleMine : styles.bubbleOther,
                  ]}
                >
                  <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
                    {message.text}
                  </Text>

                  <Text style={[styles.time, isMine && styles.timeMine]}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Napisz wiadomość..."
          style={styles.input}
        />

        <Pressable
          onPress={handleSend}
          disabled={!draft.trim()}
          style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
        >
          <Text style={styles.sendButtonText}>Wyślij</Text>
        </Pressable>
      </View>
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
    flex: 1,
    textAlign: 'center',
  },
  infoText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  empty: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  messageText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#fff',
  },
  time: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 6,
    textAlign: 'right',
  },
  timeMine: {
    color: '#f2f2f2',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
