import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ActionBar } from '../../components/chat/ActionBar';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { Composer } from '../../components/chat/Composer';
import { MessageTimeline } from '../../components/chat/MessageTimeline';
import { PinPreview } from '../../components/chat/PinPreview';
import { QuickPills } from '../../components/chat/QuickPills';
import { ReportSheet } from '../../components/chat/ReportSheet';

type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  kind?: 'text' | 'system' | 'pin';
};

export default function ChatDetailScreen() {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showPills, setShowPills] = useState(true);
  const [meetingStatus, setMeetingStatus] = useState<'none' | 'mine' | 'both'>('none');
  const [reportOpen, setReportOpen] = useState(false);

  const addMessage = (text: string, sender: 'me' | 'them', kind?: 'text' | 'system' | 'pin') => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        kind,
      },
    ]);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    addMessage(text, 'me');
    setInputValue('');
    setShowPills(false);
  };

  const handleSelectPill = (text: string) => {
    setInputValue(text);
    setShowPills(false);
  };

  const handleSharePin = () => {
    addMessage('📍 Udostępniono pinezkę lokalizacji spotkania.', 'me', 'pin');
  };

  const handleConfirm = () => {
    setMeetingStatus((prev) => (prev === 'none' ? 'mine' : 'both'));
    addMessage('✅ Potwierdzono chęć spotkania.', 'me', 'system');
  };

  const handleReport = (reason: string) => {
    console.log('report reason:', reason);
    setReportOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <ChatHeader
          category="parenting"
          title="Spacer z dziećmi po parku"
          author="Ania"
          age={31}
          onBack={() => router.back()}
          onReport={() => setReportOpen(true)}
        />
        <PinPreview />
      </View>

      <View style={styles.bottom}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <MessageTimeline messages={messages} author="Ania" />
          {meetingStatus === 'both' && (
            <View style={styles.successBar}>
              <Text style={styles.successText}>Spotkanie potwierdzone przez obie strony.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {showPills && <QuickPills category="parenting" onSelect={handleSelectPill} />}

          <Composer
            value={inputValue}
            onChangeText={setInputValue}
            onSend={handleSend}
          />

          <ActionBar
            meetingStatus={meetingStatus}
            onSharePin={handleSharePin}
            onConfirm={handleConfirm}
          />
        </View>
      </View>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSelect={handleReport}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  top: {
    flex: 0.35,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF3',
  },
  bottom: {
    flex: 0.65,
    backgroundColor: '#fff',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E7EAF3',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  successBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  successText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
});
