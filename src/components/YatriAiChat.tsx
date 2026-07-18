import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { askYatriAssistant, type AssistantMessage } from '../services/aiAssistant';
import { colors, fonts, spacing } from '../theme';

type YatriAiChatProps = {
  page: string;
};

const starterMessages: AssistantMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Namaste. Ask the Yatri Travel Desk about scams, fair prices, SOS steps, phrases, offline prep, or respectful travel in Nepal.'
  }
];

const quickPrompts = [
  'Is this taxi price fair?',
  'What should I do if I feel unsafe?',
  'How do I avoid guide scams?'
];

export function YatriAiChat({ page }: YatriAiChatProps) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>(starterMessages);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  const send = async (override?: string) => {
    const question = (override ?? draft).trim();
    if (!question || sending) return;

    const userMessage: AssistantMessage = { id: `user-${Date.now()}`, role: 'user', text: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setSending(true);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    try {
      const reply = await askYatriAssistant({ question, messages: nextMessages, page });
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: reply.text
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (open) requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length, open, sending]);

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      {open && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none" style={[styles.panelWrap, desktop && styles.panelWrapDesktop]}>
          <View style={[styles.panel, desktop && styles.panelDesktop]}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={18} color="#1a0f00" />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.title, desktop && styles.titleDesktop]}>Yatri Travel Desk</Text>
                <Text style={[styles.subtitle, desktop && styles.subtitleDesktop]}>Safety, scams, offline Nepal help</Text>
              </View>
              <Pressable accessibilityLabel="Close Yatri Travel Desk" onPress={() => setOpen(false)} style={styles.iconButton}>
                <Ionicons name="close" size={18} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView ref={scrollRef} style={[styles.messages, desktop && styles.messagesDesktop]} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
              {messages.map((message) => (
                <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  {message.role === 'assistant' && <Text style={styles.sender}>YATRI DESK</Text>}
                  <Text style={[styles.messageText, desktop && styles.messageTextDesktop, message.role === 'user' && styles.userText]}>{message.text}</Text>
                </View>
              ))}
              {sending && (
                <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
                  <ActivityIndicator color={colors.teal} size="small" />
                  <Text style={styles.loadingText}>Checking...</Text>
                </View>
              )}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickList}>
              {quickPrompts.map((prompt) => (
                <Pressable key={prompt} onPress={() => send(prompt)} style={[styles.quickChip, desktop && styles.quickChipDesktop]}>
                  <Text style={[styles.quickText, desktop && styles.quickTextDesktop]}>{prompt}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.composer}>
              <TextInput
                accessibilityLabel="Ask Yatri Travel Desk"
                onChangeText={setDraft}
                onSubmitEditing={() => send()}
                placeholder="Ask Yatri..."
                placeholderTextColor={colors.dim}
                returnKeyType="send"
                style={[styles.input, desktop && styles.inputDesktop]}
                value={draft}
              />
              <Pressable accessibilityLabel="Send message to Yatri Travel Desk" disabled={sending} onPress={() => send()} style={[styles.sendButton, sending && styles.sendButtonDisabled]}>
                <Ionicons name="send" size={17} color="#1a0f00" />
              </Pressable>
            </View>

            <Text style={styles.disclaimer}>Not for medical, legal, or emergency diagnosis. In danger, call local authorities or your embassy.</Text>
          </View>
        </KeyboardAvoidingView>
      )}

      <Pressable accessibilityLabel="Open Yatri Travel Desk" accessibilityRole="button" onPress={() => setOpen(true)} style={[styles.fab, desktop && styles.fabDesktop]}>
        <Ionicons name={open ? 'chatbubble' : 'chatbubble-ellipses'} size={24} color="#1a0f00" />
        {!open && <Text style={styles.fabText}>Help</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    bottom: 0,
    left: 0,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 50
  },
  panelWrap: {
    bottom: 88,
    left: spacing.md,
    pointerEvents: 'box-none',
    position: 'absolute',
    right: spacing.md
  },
  panelWrapDesktop: { bottom: 112, left: 'auto', right: 38, width: 560 },
  panelDesktop: { maxHeight: 760, maxWidth: 560, padding: spacing.lg },
  titleDesktop: { fontSize: 30 },
  subtitleDesktop: { fontSize: 16 },
  messagesDesktop: { maxHeight: 500 },
  messageTextDesktop: { fontSize: 18, lineHeight: 28 },
  quickChipDesktop: { paddingHorizontal: 12, paddingVertical: 9 },
  quickTextDesktop: { fontSize: 15 },
  inputDesktop: { fontSize: 18, minHeight: 54 },
  fabDesktop: { bottom: 32, right: 38, height: 72, borderRadius: 36, paddingHorizontal: 24 },
  panel: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
    borderColor: 'rgba(62,207,178,0.35)',
    borderRadius: 22,
    borderWidth: 1,
    maxHeight: 560,
    maxWidth: 420,
    overflow: 'hidden',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    width: '100%'
  },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  avatar: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 17, height: 34, justifyContent: 'center', width: 34 },
  flex: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 19, fontWeight: '700' },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  iconButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 14, borderWidth: 1, height: 34, justifyContent: 'center', width: 34 },
  messages: { maxHeight: 318 },
  messagesContent: { gap: spacing.sm, paddingVertical: spacing.sm },
  bubble: { borderRadius: 15, maxWidth: '92%', paddingHorizontal: 14, paddingVertical: 12 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.mountainBlue },
  sender: { color: colors.teal, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', marginBottom: 4 },
  messageText: { color: colors.text, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  userText: { color: colors.white },
  loadingBubble: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  loadingText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  quickList: { gap: spacing.xs, paddingBottom: spacing.sm, paddingTop: spacing.xs },
  quickChip: { backgroundColor: 'rgba(245,166,35,0.10)', borderColor: 'rgba(245,166,35,0.30)', borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  quickText: { color: colors.goldLight, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  composer: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexDirection: 'row', minHeight: 48, paddingLeft: 12, paddingRight: 5 },
  input: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 13, minHeight: 44, paddingVertical: 8 },
  sendButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  sendButtonDisabled: { opacity: 0.5 },
  disclaimer: { color: colors.dim, fontFamily: fonts.body, fontSize: 9, lineHeight: 14, marginTop: spacing.sm, textAlign: 'center' },
  fab: { alignItems: 'center', backgroundColor: colors.gold, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 28, borderWidth: 1, bottom: 22, flexDirection: 'row', gap: 5, height: 56, justifyContent: 'center', paddingHorizontal: 17, position: 'absolute', right: 18, shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 12 },
  fabText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' }
});
