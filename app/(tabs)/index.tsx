import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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

// Keep this prototype identifier synchronized with post ownership before enabling real messaging.
const otherParticipantId = 'other-user';

type FeedCategory = 'all' | 'life' | 'mind' | 'hobby';

export default function FeedScreen() {
  const user = useUserStore((state) => state.user);
  const accessPlan = useUserStore((state) => state.accessPlan);
  const accountCreatedAt = useUserStore((state) => state.accountCreatedAt);
  const conversationStarts = useUserStore((state) => state.conversationStarts);
  const posts = useFeedStore((state) => state.posts);
  const openConversation = useChatStore((state) => state.openConversation);

  const [category, setCategory] = useState<FeedCategory>('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[number] | null>(posts[0] ?? null);

  const visibleFeed = useMemo(() => {
    if (category === 'all') return posts;
    return posts.filter((item) => item.category === category);
  }, [category, posts]);

  useEffect(() => {
    useFeedStore.getState().fetchPosts();
  }, []);

  const handleOpenChat = async (post: { id: string; title: string }) => {
    const result = await openConversation(post.id, post.title, otherParticipantId);
    if (result.ok) {
      router.push({ pathname: '/chat/[id]', params: { id: result.conversationId } });
      return;
    }

    if (result.reason === 'sign_in_required') {
      Alert.alert('Zaloguj się', 'Zaloguj się, aby rozpocząć rozmowę.');
      return;
    }

    const count = accessPlan === 'free' ? 2 : 5;
    Alert.alert(
      result.reason === 'active_limit' ? 'Limit aktywnych rozmów' : 'Wykorzystany limit rozmów',
      result.reason === 'active_limit'
        ? `Masz już maksymalną liczbę aktywnych rozmów dla planu ${accessPlan}. Zakończ jedną z nich lub wybierz wyższy plan.`
        : `W tym 7-dniowym okresie wykorzystano ${count} nowych rozmów. Limit odnowi się ${new Date(accountCreatedAt ?? Date.now()).toLocaleDateString('pl-PL')}-kotwiczonego okresu.`,
      [{ text: 'Rozumiem' }, { text: 'Plany', onPress: () => router.push('/profile') }],
    );
  };

  const usedThisPeriod = useMemo(() => {
    const userId = user?.id;
    if (!userId) return 0;
    const anchor = new Date(accountCreatedAt ?? Date.now()).getTime();
    const periodMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const periodStart = anchor + Math.max(0, Math.floor((now - anchor) / periodMs)) * periodMs;
    return conversationStarts.filter((start) => {
      const created = new Date(start.createdAt).getTime();
      return start.userId === userId && created >= periodStart && created <= now;
    }).length;
  }, [accountCreatedAt, conversationStarts, user?.id]);

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

      {accessPlan === 'free' && (
        <Text style={styles.limitHint}>Plan Free · {Math.max(0, 2 - usedThisPeriod)} z 2 nowych rozmów w tym okresie</Text>
      )}

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
            <Text style={[styles.categoryText, category === item.key && styles.categoryTextActive]}>
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
              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.cardText}>{item.text}</Text>
            <View style={styles.tagRow}>
              {item.tags.map((tag) => <Text key={tag} style={styles.tagPill}>{tag}</Text>)}
            </View>
            <View style={styles.cardFooter}>
              <Pressable onPress={() => handleOpenChat({ id: item.id, title: item.title })} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{strings.feed.write}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/new-post')}>
        <Text style={styles.fabText}>{strings.home.addPost}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  location: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
  locationSub: { color: theme.colors.muted, fontSize: 13, marginTop: 4 },
  toggleButton: { backgroundColor: theme.colors.surface, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.line },
  toggleButtonText: { color: theme.colors.text, fontWeight: '700' },
  limitHint: { color: theme.colors.muted, fontSize: 12, paddingHorizontal: 20, paddingTop: 8 },
  categoryRow: { paddingHorizontal: 12, paddingVertical: 14, flexGrow: 0 },
  categoryChip: { backgroundColor: theme.colors.surface, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.line, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  categoryChipActive: { backgroundColor: theme.colors.text },
  categoryText: { color: theme.colors.text, fontWeight: '700' },
  categoryTextActive: { color: '#fff' },
  feedList: { paddingHorizontal: 16 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: theme.colors.line },
  cardMeta: { color: theme.colors.accent, fontWeight: '700', fontSize: 13, marginBottom: 10 },
  cardText: { color: theme.colors.text, fontSize: 15, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, marginBottom: 8 },
  tagPill: { backgroundColor: '#f5efe7', color: theme.colors.text, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, fontSize: 12, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  primaryButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  primaryButtonText: { color: '#fff', fontWeight: '800' },
  fab: { position: 'absolute', bottom: 86, left: 20, right: 20, backgroundColor: theme.colors.primary, borderRadius: 999, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
