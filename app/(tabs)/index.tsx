import { useState } from 'react';
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

type FeedItem = {
  id: string;
  emoji: string;
  title: string;
  distance: number;
  when: string;
  text: string;
  tags: string[];
  category: 'life' | 'mind' | 'hobby';
};

const feedData: FeedItem[] = [
  {
    id: '1',
    emoji: '👶',
    title: 'Spacer z wózkiem',
    distance: 300,
    when: 'Dzisiaj, 12:00',
    text: 'Ania: Spacer wokół stawów, synek 3 miesiące. Szukam pogaduszek z inną mamą, żeby nie zwariować w domu.',
    tags: ['Noworodek', 'Niemowlę'],
    category: 'life',
  },
  {
    id: '2',
    emoji: '♟️',
    title: 'Szachy + Geopolityka',
    distance: 1200,
    when: 'Dzisiaj, 17:00',
    text: 'Tomek: Szukam kogoś na 2-3 partie w parku miejskim. Chętnie pogadam o geopolitce i nowych książkach.',
    tags: ['Szachy', 'Geopolityka'],
    category: 'mind',
  },
  {
    id: '3',
    emoji: '🐕',
    title: 'Wybieg dla psów',
    distance: 500,
    when: 'Za 30 minut',
    text: 'Kamil: Mój border collie roznosi mieszkanie. Idziemy na wybieg w parku, chętnie poznamy inne psiaki.',
    tags: ['Spacery z psem'],
    category: 'hobby',
  },
];

const categories = [
  { key: 'all', label: '✨ Wszystko' },
  { key: 'life', label: '👶 Etapy życia' },
  { key: 'mind', label: '💬 Dyskusje' },
  { key: 'hobby', label: '🎲 Hobby' },
];

const chatSuggestions = {
  life: ['Cześć! Też jesteśmy z maluchem 👶', 'Którędy planujesz spacer?', 'Czy mogę dołączyć o tej porze?'],
  mind: ['Cześć! Jaki temat chcesz dziś poruszyć?', 'Ile masz czasu na rozmowę?', 'Chętnie pogadam o tym, co Cię interesuje.'],
  hobby: ['Hej! Wolisz spacer czy bardziej aktywnie?', 'Masz już ułożony plan?', 'Jesteśmy chętni do wspólnego wyjścia.'],
};

const messageBubble = (who: string, text: string, time: string) => ({ who, text, time });

export default function FeedScreen() {
  const [category, setCategory] = useState<string>('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(feedData[0]);

  const filteredFeed =
    category === 'all'
      ? feedData
      : feedData.filter((item) => item.category === category);

  const openChat = (item: FeedItem) => {
    setSelectedItem(item);
    setChatOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.location}>📍 Oleśnica</Text>
          <Text style={styles.locationSub}>{strings.home.nearby}</Text>
        </View>
        <Pressable style={styles.toggleButton} onPress={() => router.push('/new-post')}>
          <Text style={styles.toggleButtonText}>Nowy post</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setCategory(item.key)}
            style={[styles.categoryChip, category === item.key && styles.categoryChipActive]}
          >
            <Text style={[styles.categoryText, category === item.key && styles.categoryTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.feedList} contentContainerStyle={{ paddingBottom: 120 }}>
        {filteredFeed.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardMeta}>{item.emoji} {item.title} • {item.distance} m stąd • {item.when}</Text>
            <Text style={styles.cardText}>{item.text}</Text>
            <View style={styles.tagRow}>
              {item.tags.map((tag) => (
                <Text key={tag} style={styles.tagPill}>{tag}</Text>
              ))}
            </View>
            <View style={styles.cardFooter}>
              <Pressable onPress={() => openChat(item)} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Napisz</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/new-post')}>
        <Text style={styles.fabText}>＋ Dodaj co robisz / Kogo szukasz</Text>
      </Pressable>

      {chatOpen && selectedItem ? (
        <View style={styles.chatOverlay}>
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <Pressable onPress={() => setChatOpen(false)}>
                <Text style={styles.backText}>← Wróć</Text>
              </Pressable>
              <Text style={styles.chatName}>{selectedItem.title}</Text>
              <Pressable onPress={() => setChatOpen(false)}>
                <Text style={styles.reportText}>⚠️ Zgłoś</Text>
              </Pressable>
            </View>

            <View style={styles.previewBox}>
              <Text style={styles.previewMeta}>{selectedItem.emoji} {selectedItem.title} • {selectedItem.distance} m stąd • {selectedItem.when}</Text>
              <Text style={styles.previewText}>{selectedItem.text}</Text>
            </View>

            <View style={styles.timeline}>
              {[
                messageBubble('System', 'Początek rozmowy z użytkownikiem. Spotykajcie się w miejscach publicznych. 🛡️', '08:42'),
                messageBubble('Ty', 'Cześć! Chętnie dołączę.', '08:43'),
                messageBubble(selectedItem.title, 'Super! Widzimy się w parku przy wejściu.', '08:44'),
              ].map((message, index) => (
                <View key={`${message.who}-${index}`} style={styles.timelineRow}>
                  <Text style={styles.timelineBadge}>{message.who === 'Ty' ? '🙂' : message.who === 'System' ? '🛡️' : '💬'}</Text>
                  <View style={styles.timelineBubble}>
                    <Text style={styles.timelineWho}>{message.who}</Text>
                    <Text style={styles.timelineText}>{message.text}</Text>
                    <Text style={styles.timelineTime}>{message.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickPills}>
              {(chatSuggestions[selectedItem.category as keyof typeof chatSuggestions] ?? chatSuggestions.hobby).map((item) => (
                <Pressable key={item} style={styles.quickPill}>
                  <Text style={styles.quickPillText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.chatActions}>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📍 Udostępnij pinezkę</Text>
              </Pressable>
              <Pressable style={styles.actionButtonPrimary}>
                <Text style={styles.actionButtonPrimaryText}>✅ Potwierdź spotkanie</Text>
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
  quickPills: {
    marginTop: 12,
    paddingVertical: 8,
  },
  quickPill: {
    backgroundColor: '#f2ece4',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  quickPillText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 12,
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
