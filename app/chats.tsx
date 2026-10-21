import { useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useChatStore } from '../../stores/chatStore';
import { theme } from '../../theme';

export default function ChatsScreen() {
  const router = useRouter();
  const conversations = useChatStore((state) => state.conversations);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Rozmowy</Text>

        {conversations.length === 0 ? (
          <Text style={styles.empty}>Brak rozmów</Text>
        ) : (
          conversations.map((conversation) => (
            <Pressable
              key={conversation.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
            >
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{conversation.title?.slice(0, 1).toUpperCase() ?? '?'}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{conversation.title ?? 'Rozmowa'}</Text>
                <Text style={styles.cardPreview}>
                  {conversation.participant_ids.length > 0 ? `Uczestnicy: ${conversation.participant_ids.length}` : 'Rozmowa'}
                </Text>
                <Text style={styles.cardTime}>
                  {conversation.last_message_at
                    ? new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'now'}
                </Text>
              </View>
            </Pressable>
          ))
        )}
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 20,
  },
  empty: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 4,
  },
  cardPreview: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  cardTime: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
});
