import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { AskNibble } from '@/components/AskNibble';
import { CodePuzzle } from '@/components/CodePuzzle';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TreeDiagram } from '@/components/TreeDiagram';
import { getLesson } from '@/data/lessons';
import { useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

type Result = 'correct' | 'incorrect' | null;
const treeOrders: Record<string, string[]> = {
  'tree-preorder': ['A', 'B', 'D', 'E', 'C', 'F', 'G'],
  'tree-inorder': ['D', 'B', 'E', 'A', 'F', 'C', 'G'],
  'tree-postorder': ['D', 'E', 'B', 'F', 'G', 'C', 'A'],
};

export default function LessonScreen() {
  const { lesson: lessonId } = useLocalSearchParams<{ lesson?: string }>();
  const lesson = getLesson(lessonId);
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [treeSelection, setTreeSelection] = useState<string[]>([]);
  const [codeOrder, setCodeOrder] = useState<(string | null)[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [finishing, setFinishing] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { completeLesson } = useProgress();
  const question = lesson.questions[index];
  const isTree = lesson.id === 'tree-traversals';
  const isReady = isTree ? treeSelection.length === 7 : question.code
    ? question.code.solutionIds.every((_, slot) => Boolean(codeOrder[slot]))
    : Boolean(selectedId);

  function updateCode(next: (string | null)[]) {
    setCodeOrder(next);
    setResult(null);
  }

  async function advance() {
    if (result !== 'correct') {
      if (isReady) {
        const correct = isTree
          ? treeSelection.join(',') === treeOrders[question.id].join(',')
          : question.code
          ? question.code.solutionIds.every((id, slot) => codeOrder[slot] === id)
          : selectedId === question.correctId;
        setResult(correct ? 'correct' : 'incorrect');
      }
      return;
    }
    if (index < lesson.questions.length - 1) {
      setIndex(index + 1);
      setSelectedId(null);
      setTreeSelection([]);
      setCodeOrder([]);
      setResult(null);
      return;
    }
    setFinishing(true);
    let earned = 0;
    try { earned = await completeLesson(lesson.id); } catch { /* The visual flow still completes if local storage fails. */ }
    router.replace({ pathname: '/complete', params: { earned: String(earned), lesson: lesson.id } });
  }

  return (
    <Screen scrollRef={scrollRef} footer={
      <View style={styles.footer}>
        {result && <Text style={[styles.result, result === 'incorrect' && styles.incorrect]}>{result === 'correct' ? question.success : question.retry}</Text>}
        <PrimaryButton label={result === 'correct' ? (index === lesson.questions.length - 1 ? 'Finish lesson' : 'Continue') : 'Check my answer'} onPress={advance} disabled={!isReady || finishing} />
      </View>
    }>
      <View style={styles.progressHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close lesson" onPress={() => router.replace('/path')} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / lesson.questions.length) * 100}%` }]} /></View>
        <Text style={styles.progressText}>{index + 1} of {lesson.questions.length}</Text>
      </View>

      <Text style={styles.eyebrow}>LEETCODE {lesson.leetcode} · {lesson.pattern.toUpperCase()} · {lesson.difficulty.toUpperCase()}</Text>
      <Text style={styles.title}>{question.title}</Text>
      <Text style={styles.description}>{question.description}</Text>

      <View style={styles.listCard}>
        <Text style={styles.listLabel}>{lesson.title.toUpperCase()}</Text>
        <Text style={styles.problemStatement}>{lesson.intro}</Text>
        <View style={styles.example}>
          {isTree && <TreeDiagram order={treeSelection} disabled={result === 'correct' || finishing} onSelect={(node) => {
            setTreeSelection((current) => [...current, node]);
            setResult(null);
          }} />}
          <Text style={styles.exampleText}>{question.example}</Text>
        </View>
      </View>

      <Text style={styles.prompt}>{question.prompt}</Text>
      {isTree ? <View style={styles.treeAnswer}>
        <Text style={styles.treeCount}>{treeSelection.length} of 7 nodes selected</Text>
        <Text style={styles.treeSequence}>{treeSelection.length ? treeSelection.join('  →  ') : 'Tap A, B, C, D, E, F, G on the tree'}</Text>
        <View style={styles.treeControls}>
          <Pressable accessibilityRole="button" disabled={!treeSelection.length || result === 'correct'} onPress={() => { setTreeSelection((current) => current.slice(0, -1)); setResult(null); }} style={styles.treeControl}><Text style={styles.treeControlText}>Undo last</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={!treeSelection.length || result === 'correct'} onPress={() => { setTreeSelection([]); setResult(null); }} style={styles.treeControl}><Text style={styles.treeControlText}>Clear all</Text></Pressable>
        </View>
      </View> : question.code ? <CodePuzzle puzzle={question.code} value={codeOrder} onChange={updateCode} disabled={result === 'correct' || finishing} /> : question.options.map((option, optionIndex) => {
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

      <AskNibble key={question.id} question={question} selectedId={isTree ? treeSelection.join(',') : selectedId} onResize={() => scrollRef.current?.scrollToEnd({ animated: true })} />
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
  listCard: { backgroundColor: colors.warmCard, borderRadius: 22, padding: 18, marginTop: 22 },
  listLabel: { fontFamily: fonts.bold, fontSize: 10, color: colors.muted, letterSpacing: 0.3 },
  problemStatement: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.ink, marginTop: 8 },
  example: { backgroundColor: colors.white, borderRadius: 12, padding: 13, marginTop: 13 },
  exampleText: { fontFamily: 'monospace', fontSize: 13, lineHeight: 20, color: colors.ink },
  treeAnswer: { backgroundColor: colors.white, borderRadius: 15, borderWidth: 1, borderColor: colors.line, padding: 13 },
  treeCount: { fontFamily: fonts.bold, fontSize: 11, color: colors.green },
  treeSequence: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ink, marginTop: 7, minHeight: 22 },
  treeControls: { flexDirection: 'row', gap: 10, marginTop: 12 },
  treeControl: { backgroundColor: colors.paleGreen, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  treeControlText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.green },
  prompt: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink, marginTop: 25, marginBottom: 15 },
  option: { minHeight: 51, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  optionSelected: { borderWidth: 2, borderColor: colors.green, backgroundColor: colors.paleGreen, paddingHorizontal: 11 },
  letter: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.warmCard, alignItems: 'center', justifyContent: 'center' },
  letterSelected: { backgroundColor: colors.green },
  letterText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.muted },
  letterTextSelected: { color: colors.white },
  optionLabel: { flex: 1, fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 21, color: colors.ink, marginLeft: 15 },
  checkmark: { fontFamily: fonts.bold, fontSize: 16, color: colors.green, marginLeft: 'auto' },
  footer: { backgroundColor: colors.cream, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12, width: '100%' },
  result: { fontFamily: fonts.semiBold, fontSize: 13, textAlign: 'center', color: colors.green, marginBottom: 9 },
  incorrect: { color: colors.error },
});
