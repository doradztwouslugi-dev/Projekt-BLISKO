import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

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

type ChatAssistantProps = {
  item: FeedItem | null;
  visible: boolean;
  onClose: () => void;
};

type TimelineMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
  type?: 'system' | 'note';
};

const quickPills: Record<'life' | 'mind' | 'hobby', string[]> = {
  life: ['Cześć! Też jesteśmy z maluchem 👶', 'Którędy planujesz spacer?', 'Czy mogę dołączyć o tej porze?'],
  mind: ['Cześć! Jaki temat chcesz dziś poruszyć?', 'Ile masz czasu na rozmowę?', 'Chętnie pogadam o tym, co Cię interesuje.'],
  hobby: ['Hej! Wolisz spacer czy bardziej aktywnie?', 'Masz już ułożony plan?', 'Jesteśmy chętni do wspólnego wyjścia.'],
};

export function ChatAssistant({ item, visible, onClose }: ChatAssistantProps) {
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);
  const [pinShared, setPinShared] = useState(false);

  const timeline = useMemo<TimelineMessage[]>(() => {
    if (!item) return [];
    return [
      { id: 's1', author: 'System', text: 'Początek rozmowy. Spotykajcie się w miejscach publicznych. 🛡️', time: '08:42', type: 'system' },
      { id: 'm1', author: 'Ty', text: 'Cześć! Chętnie dołączę.', time: '08:43' },
      { id: 'm2', author: item.title, text: 'Super! Widzimy się przy wejściu do parku.', time: '08:44' },
    ];
  }, [item]);

  const pills = item ? quickPills[item.category] ?? quickPills.hobby : quickPills.hobby;

  if (!visible || !item) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.headerRow}>
          <Pressable onPress={onClose}>
            <Text style={styles.backText}>← Wróć</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{item.title}</Text>
          <Pressable>
            <Text style={styles.reportText}>[Zgłoś]</Text>
          </Pressable>
        </View>

        <View style={styles.topSection}>
          <View style={styles.previewCard}>
            <Text style={styles.previewMeta}>{item.emoji} {item.title} • {item.distance} m stąd • {item.when}</Text>
            <Text style={styles.previewText}>{item.text}</Text>
          </View>

          <View style={styles.mapCard}>
            <View style={styles.mapHint}>
              <View style={styles.mapPin} />
              <View style={styles.mapUser} />
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.timelineLabelRow}>
            <Text style={styles.timelineLabel}>Wiadomości</Text>
          </View>

          <View style={styles.timelineWrap}>
            {timeline.map((message) => (
              <View key={message.id} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={styles.messageBlock}>
                  <Text style={styles.messageAuthor}>{message.author}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.messageTime}>{message.time}</Text>
                </View>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {pills.map((pill) => (
              <Pressable key={pill} style={styles.pillButton}>
                <Text style={styles.pillText}>{pill}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.quickActions}>
            <Pressable
              style={[styles.quickAction, pinShared && styles.quickActionActive]}
              onPress={() => setPinShared((prev) => !prev)}
            >
              <Text style={[styles.quickActionText, pinShared && styles.quickActionTextActive]}>Udostępnij pinezkę</Text>
            </Pressable>

            <Pressable
              style={[styles.quickActionPrimary, meetingConfirmed && styles.quickActionPrimaryActive]}
              onPress={() => setMeetingConfirmed((prev) => !prev)}
            >
              <Text style={[styles.quickActionPrimaryText, meetingConfirmed && styles.quickActionPrimaryTextActive]}>
                Potwierdź spotkanie
              </Text>
            </Pressable>
          </View>

          {meetingConfirmed ? (
            <View style={styles.systemBar}>
              <Text style={styles.systemBarText}>✅ Spotkanie potwierdzone</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 16, 20, 0.35)',
  },
  sheet: {
    height: '82%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 18,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 17,
    color: theme.colors.text,
  },
  reportText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  topSection: {
    flex: 2,
    minHeight: 220,
    gap: 12,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 12,
  },
  previewMeta: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 8,
  },
  previewText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  mapCard: {
    backgroundColor: '#eaf6ee',
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#dfeae1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapHint: {
    position: 'relative',
    width: '88%',
    height: 86,
    borderRadius: 16,
    backgroundColor: '#dff0df',
    borderWidth: 1,
    borderColor: '#cfe5d2',
  },
  mapPin: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    left: '68%',
    top: '36%',
    borderWidth: 3,
    borderColor: '#fff',
  },
  mapUser: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    left: '30%',
    top: '55%',
    borderWidth: 3,
    borderColor: '#fff',
  },
  bottomSection: {
    flex: 3,
    minHeight: 330,
    marginTop: 8,
  },
  timelineLabelRow: {
    marginBottom: 8,
  },
  timelineLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timelineWrap: {
    flex: 1,
    backgroundColor: '#f7f3ee',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#efe3d4',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#e6d8c5',
    paddingLeft: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginRight: 10,
    marginTop: 8,
  },
  messageBlock: {
    flex: 1,
    gap: 4,
  },
  messageAuthor: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  messageText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    color: theme.colors.muted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 2,
  },
  pillRow: {
    marginBottom: 10,
  },
  pillButton: {
    backgroundColor: '#f3ece3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  pillText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  quickAction: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickActionActive: {
    backgroundColor: '#e9f7ef',
    borderColor: '#9fd8b5',
  },
  quickActionText: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  quickActionTextActive: {
    color: '#1a6d46',
  },
  quickActionPrimary: {
    flex: 1,
    backgroundColor: '#e7f9ee',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfe5cf',
  },
  quickActionPrimaryActive: {
    backgroundColor: '#28b56d',
    borderColor: '#28b56d',
  },
  quickActionPrimaryText: {
    color: '#1c6c45',
    fontWeight: '800',
    fontSize: 13,
  },
  quickActionPrimaryTextActive: {
    color: '#fff',
  },
  systemBar: {
    backgroundColor: '#27b46a',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  systemBarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
});






















































































































































































































































































































































































































































































































































































































