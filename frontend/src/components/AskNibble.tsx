import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Question } from '@/data/lessons';
import { askNibble, type ChatMessage } from '@/services/chat';
import { colors, fonts } from '@/theme';
import { Mascot } from './Mascot';

const starters = ['Give me a hint', 'Explain the pattern', 'Why is my answer wrong?'];

export function AskNibble({ question, selectedId, onResize }: { question: Question; selectedId: string | null; onResize?: () => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(raw: string) {
    const message = raw.trim();
    if (!message || loading) return;
    setDraft('');
    setError(null);
    const previous = messages;
    setMessages([...previous, { role: 'user', text: message }]);
    setLoading(true);
    try {
      const reply = await askNibble(question, selectedId, message, previous);
      setMessages((current) => [...current, { role: 'assistant', text: reply }]);
    } catch (cause) {
      // A first hint remains available if Wi-Fi or Gemini drops during the demo.
      if (message.toLowerCase().includes('hint')) {
        setMessages((current) => [...current, { role: 'assistant', text: question.hint }]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Nibble could not reply right now. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={styles.header}>
        <Mascot size={58} />
        <View style={styles.headingWrap}>
          <Text style={styles.heading}>Ask Nibble</Text>
          <Text style={styles.subheading}>Stuck? Talk through this step together.</Text>
        </View>
        <Text style={styles.chevron}>{open ? '−' : '+'}</Text>
      </Pressable>

      {open && <View style={styles.panel} onLayout={onResize}>
        {messages.length === 0 && <>
          <Text style={styles.welcome}>Hi! I’m here to help you reason through this question. What’s confusing?</Text>
          <View style={styles.starters}>
            {starters.map((starter) => <Pressable key={starter} accessibilityRole="button" onPress={() => send(starter)} style={styles.starter}><Text style={styles.starterText}>{starter}</Text></Pressable>)}
          </View>
        </>}

        {messages.map((item, index) => <View key={`${index}-${item.role}`} style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
          {item.role === 'assistant' && <Text style={styles.speaker}>NIBBLE</Text>}
          <Text style={styles.message}>{item.text}</Text>
        </View>)}
        {loading && <View style={[styles.bubble, styles.botBubble]}><ActivityIndicator size="small" color={colors.green} /></View>}
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Message Nibble"
            placeholder="Ask about this question..."
            placeholderTextColor={colors.muted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => send(draft)}
            returnKeyType="send"
            multiline
            maxLength={500}
            style={styles.input}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!draft.trim() || loading} onPress={() => send(draft)} style={[styles.send, (!draft.trim() || loading) && styles.sendDisabled]}><Text style={styles.sendText}>↑</Text></Pressable>
        </View>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12, backgroundColor: colors.paleGreen, borderRadius: 18, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10 },
  headingWrap: { flex: 1 },
  heading: { fontFamily: fonts.bold, fontSize: 15, color: colors.green },
  subheading: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 3 },
  chevron: { fontFamily: fonts.regular, fontSize: 25, color: colors.green, marginRight: 8 },
  panel: { paddingHorizontal: 13, paddingBottom: 13, gap: 9 },
  welcome: { backgroundColor: colors.white, borderRadius: 13, padding: 12, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.ink },
  starters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  starter: { borderColor: colors.green, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  starterText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.green },
  bubble: { padding: 11, borderRadius: 13, maxWidth: '91%' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: colors.white },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.peach },
  speaker: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.5, color: colors.green, marginBottom: 4 },
  message: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.ink },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.error },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 3 },
  input: { flex: 1, minHeight: 42, maxHeight: 90, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 9, fontFamily: fonts.regular, fontSize: 13, color: colors.ink },
  send: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: colors.white, fontSize: 23, lineHeight: 26 },
});
