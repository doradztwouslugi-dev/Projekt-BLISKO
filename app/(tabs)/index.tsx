import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { theme } from '../../theme';
import { strings } from '../../i18n/pl';
import { useUserStore } from '../../stores/userStore';
import { useFeedStore } from '../../stores/feedStore';
import { useChatStore } from '../../stores/chatStore';

type FeedCategory = 'all' | 'life' | 'mind' | 'hobby';

export default function FeedScreen() {
  const user = useUserStore((state) => state.user);
  const posts = useFeedStore((state) => state.posts);
  const openConversation = useChatStore((state) => state.openConversation);

  const [category, setCategory] = useState<FeedCategory>('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[number] | null>(posts[0] ?? null);

  const visibleFeed = useMemo(() => {
    if (category === 'all') return posts;
    return posts.filter((item) => item.category === category);
  }, [category, posts]);

  const handleOpenChat = (post: { id: string; title: string }) => {
    openConversation(post.id, post.title, 'other-user');

    const created = useChatStore
      .getState()
      .conversations.find((conversation) => conversation.post_id === post.id);

    if (created) {
      router.push({
        pathname: '/chat/[id]',
        params: { id: created.id },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.location}>📍 Oleśnica</Text>
          <Text style={styles.locationSub}>
            {user?.first_name ? `Cześć, ${user.first_name}` : strings.home.nearby}
          </Text>
        </View>

        <Pressable style={styles.toggleButton} onPress={() => router.push('/new-post')}>
          <Text style={styles.toggleButtonText}>{strings.home.newPost}</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {[
          { key: 'all', label: strings.feed.all },
          { key: 'life', label: strings.feed.life },
          { key: 'mind', label: strings.feed.mind },
          { key: 'hobby', label: strings.feed.hobby },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setCategory(item.key as FeedCategory)}
            style={[styles.categoryChip, category === item.key && styles.categoryChipActive]}
          >
            <Text
              style={[styles.categoryText, category === item.key && styles.categoryTextActive]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.feedList} contentContainerStyle={{ paddingBottom: 120 }}>
        {visibleFeed.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardMeta}>
              {item.title} • {item.distance_m ?? 0} m stąd •{' '}
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>

            <Text style={styles.cardText}>{item.text}</Text>

            <View style={styles.tagRow}>
              {item.tags.map((tag) => (
                <Text key={tag} style={styles.tagPill}>
                  {tag}
                </Text>
              ))}
            </View>

            <View style={styles.cardFooter}>
              <Pressable
                onPress={() => handleOpenChat({ id: item.id, title: item.title })}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>{strings.feed.write}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/new-post')}>
        <Text style={styles.fabText}>{strings.home.addPost}</Text>
      </Pressable>

      {chatOpen && selectedPost ? (
        <View style={styles.chatOverlay}>
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <Pressable onPress={() => setChatOpen(false)}>
                <Text style={styles.backText}>← {strings.common.back}</Text>
              </Pressable>

              <Text style={styles.chatName}>{selectedPost.title}</Text>

              <Pressable onPress={() => setChatOpen(false)}>
                <Text style={styles.reportText}>{strings.common.report}</Text>
              </Pressable>
            </View>

            <View style={styles.previewBox}>
              <Text style={styles.previewMeta}>
                {selectedPost.title} • {selectedPost.distance_m ?? 0} m stąd
              </Text>
              <Text style={styles.previewText}>{selectedPost.text}</Text>
            </View>

            <View style={styles.timeline}>
              {[
                {
                  who: 'System',
                  text: 'Początek rozmowy z użytkownikiem. Spotykajcie się w miejscach publicznych. 🛡️',
                  time: '08:42',
                },
                { who: 'Ty', text: 'Cześć! Chętnie dołączę.', time: '08:43' },
                {
                  who: selectedPost.author_name,
                  text: 'Super! Widzimy się w parku przy wejściu.',
                  time: '08:44',
                },
              ].map((message, index) => (
                <View key={`${message.who}-${index}`} style={styles.timelineRow}>
                  <Text style={styles.timelineBadge}>
                    {message.who === 'Ty' ? '🙂' : message.who === 'System' ? '🛡️' : '💬'}
                  </Text>

                  <View style={styles.timelineBubble}>
                    <Text style={styles.timelineWho}>{message.who}</Text>
                    <Text style={styles.timelineText}>{message.text}</Text>
                    <Text style={styles.timelineTime}>{message.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.chatActions}>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{strings.common.sharePin}</Text>
              </Pressable>

              <Pressable style={styles.actionButtonPrimary}>
                <Text style={styles.actionButtonPrimaryText}>{strings.common.confirm}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  location: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
  },
  locationSub: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  toggleButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  toggleButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  categoryRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.text,
  },
  categoryText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#fff',
  },
  feedList: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  cardMeta: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 10,
  },
  cardText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: '#f5efe7',
    color: theme.colors.text,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 86,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  chatOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 14, 20, 0.35)',
    justifyContent: 'flex-end',
  },
  chatPanel: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '80%',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  chatName: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  reportText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  previewBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  previewMeta: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 8,
  },
  previewText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  timeline: {
    backgroundColor: '#f8f3ec',
    borderRadius: 18,
    padding: 12,
    minHeight: 180,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  timelineBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    textAlign: 'center',
    lineHeight: 28,
  },
  timelineBubble: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
  },
  timelineWho: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  timelineTime: {
    textAlign: 'right',
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 6,
  },
  chatActions: {
    marginTop: 12,
    gap: 10,
  },
  actionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  actionButtonText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  actionButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: '#fff',
    fontWeight: '800',
  },
});
