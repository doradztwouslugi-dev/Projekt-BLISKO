import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

const sampleConversations = [
  {
    id: 'conv-1',
    name: 'Ania',
    lastMessage: 'Świetnie, mogę dołączyć po 18:00.',
    time: '12:45',
    unread: 2,
    confirmed: true,
  },
  {
    id: 'conv-2',
    name: 'Michał',
    lastMessage: 'Jutro idziemy na spacer nad staw.',
    time: 'Wczoraj',
    unread: 0,
    confirmed: false,
  },
  {
    id: 'conv-3',
    name: 'Kasia',
    lastMessage: 'Masz może jeszcze miejsce na grę?',
    time: 'Poniedziałek',
    unread: 1,
    confirmed: false,
  },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Rozmowy</Text>
      </View>

      <FlatList
        data={sampleConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/chat/[conversationId]', params: { conversationId: item.id } }} asChild>
            <Pressable style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>

              <View style={styles.body}>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>

                <Text style={styles.message} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>

              <View style={styles.meta}>
                {item.unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>}
                {item.confirmed && <Text style={styles.confirmed}>✓</Text>}
              </View>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  time: {
    fontSize: 11,
    color: '#6B7280',
  },
  message: {
    fontSize: 12,
    color: '#4B5563',
  },
  meta: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  confirmed: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '700',
  },
});
