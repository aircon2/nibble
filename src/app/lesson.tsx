import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Mascot } from '@/components/Mascot';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { questions } from '@/data/lesson';
import { getHint } from '@/services/hints';
import { useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

type Result = 'correct' | 'incorrect' | null;

export default function LessonScreen() {
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const { completeToday } = useProgress();
  const question = questions[index];

  async function showHint() {
    if (hint) { setHint(null); return; }
    setHintLoading(true);
    const value = await getHint(question, selectedId);
    setHint(value);
    setHintLoading(false);
  }

  async function advance() {
    if (result !== 'correct') {
      if (selectedId) setResult(selectedId === question.correctId ? 'correct' : 'incorrect');
      return;
    }
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelectedId(null);
      setResult(null);
      setHint(null);
      return;
    }
    setFinishing(true);
    let earned = false;
    try { earned = await completeToday(); } catch { /* The visual flow still completes if local storage fails. */ }
    router.replace({ pathname: '/complete', params: { earned: earned ? '20' : '0' } });
  }

  return (
    <Screen footer={
      <View style={styles.footer}>
        {result && <Text style={[styles.result, result === 'incorrect' && styles.incorrect]}>{result === 'correct' ? question.success : question.retry}</Text>}
        <PrimaryButton label={result === 'correct' ? (index === questions.length - 1 ? 'Finish lesson' : 'Continue') : 'Check my answer'} onPress={advance} disabled={!selectedId || finishing} />
      </View>
    }>
      <View style={styles.progressHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close lesson" onPress={() => router.replace('/')} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} /></View>
        <Text style={styles.progressText}>{index + 1} of {questions.length}</Text>
      </View>

      <Text style={styles.eyebrow}>ARRAYS · FIND A PAIR</Text>
      <Text style={styles.title}>{question.title}</Text>
      <Text style={styles.description}>{question.description}</Text>

      <View style={styles.listCard}>
        <View style={styles.listTop}>
          <Text style={styles.listLabel}>OUR LIST</Text>
          <Text style={styles.target}>Target: {question.target}</Text>
        </View>
        <View style={styles.numberRow}>
          {question.list.map((number, numberIndex) => <View key={`${number}-${numberIndex}`} style={styles.numberTile}><Text style={styles.numberText}>{number}</Text></View>)}
        </View>
      </View>

      <Text style={styles.prompt}>{question.prompt}</Text>
      {question.options.map((option, optionIndex) => {
        const selected = selectedId === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            aria-checked={selected}
            onPress={() => { setSelectedId(option.id); setResult(null); }}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <View style={[styles.letter, selected && styles.letterSelected]}><Text style={[styles.letterText, selected && styles.letterTextSelected]}>{String.fromCharCode(65 + optionIndex)}</Text></View>
            <Text style={styles.optionLabel}>{option.label}</Text>
            {selected && <Text style={styles.checkmark}>●</Text>}
          </Pressable>
        );
      })}

      <Pressable accessibilityRole="button" onPress={showHint} style={styles.hintRow}>
        <Mascot size={61} />
        <View style={styles.hintTextWrap}>
          {hintLoading ? <ActivityIndicator color={colors.green} size="small" /> : <Text style={styles.hintTitle}>{hint ?? 'Need a nudge? Get a hint'}</Text>}
          <Text style={styles.hintSub}>No timer. No lost lives. Take your time.</Text>
        </View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 27 },
  close: { width: 32, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: fonts.regular, fontSize: 30, color: colors.muted, lineHeight: 34 },
  progressTrack: { height: 8, flex: 1, backgroundColor: colors.line, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.green, borderRadius: 5 },
  progressText: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted, minWidth: 43, textAlign: 'right' },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, color: colors.green, letterSpacing: 0.4 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 37, letterSpacing: -0.6, color: colors.ink, marginTop: 12 },
  description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 12 },
  listCard: { backgroundColor: colors.warmCard, borderRadius: 22, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 25, marginTop: 24 },
  listTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listLabel: { fontFamily: fonts.bold, fontSize: 10, color: colors.muted, letterSpacing: 0.3 },
  target: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 15 },
  numberRow: { flexDirection: 'row', gap: 9, marginTop: 17 },
  numberTile: { flex: 1, height: 64, backgroundColor: colors.white, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: fonts.display, fontSize: 25, color: colors.ink },
  prompt: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink, marginTop: 25, marginBottom: 15 },
  option: { minHeight: 51, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 10 },
  optionSelected: { borderWidth: 2, borderColor: colors.green, backgroundColor: colors.paleGreen, paddingHorizontal: 11 },
  letter: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.warmCard, alignItems: 'center', justifyContent: 'center' },
  letterSelected: { backgroundColor: colors.green },
  letterText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.muted },
  letterTextSelected: { color: colors.white },
  optionLabel: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.ink, marginLeft: 15 },
  checkmark: { fontFamily: fonts.bold, fontSize: 16, color: colors.green, marginLeft: 'auto' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 7, paddingVertical: 5 },
  hintTextWrap: { flex: 1 },
  hintTitle: { fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18, color: colors.green },
  hintSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 5 },
  footer: { backgroundColor: colors.cream, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, width: '100%' },
  result: { fontFamily: fonts.semiBold, fontSize: 13, textAlign: 'center', color: colors.green, marginBottom: 9 },
  incorrect: { color: colors.error },
});
