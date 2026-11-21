import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Mascot } from '@/components/Mascot';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { getLesson, lessons } from '@/data/lessons';
import { currentStreak, localDateKey, useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

export default function CompleteScreen() {
  const { earned, lesson: lessonId } = useLocalSearchParams<{ earned?: string; lesson?: string }>();
  const lesson = getLesson(lessonId);
  const nextLesson = lessons[lessons.findIndex((item) => item.id === lesson.id) + 1];
  const { completedDates } = useProgress();
  const streak = currentStreak(completedDates);
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  return (
    <Screen footer={<View style={styles.footer}><PrimaryButton label="Done for today" onPress={() => router.replace('/')} /></View>}>
      <View style={styles.topline}>
        <Text style={styles.wordmark}>nibble</Text>
        <Text style={styles.xp}>+{earned === '20' ? '20' : '0'} XP</Text>
      </View>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>DAILY PRACTICE, DONE.</Text>
        <Text style={styles.title}>You showed up.{'\n'}That’s a big deal.</Text>
        <Text style={styles.description}>One less “I’ll start tomorrow.”{'\n'}One more small promise kept.</Text>
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>{streak === 1 ? 'day' : 'days'} of showing up</Text>
        <View style={styles.mascot}><Mascot size={148} waveOnPress celebrate /></View>
        <View style={styles.week}>
          {Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            const complete = completedDates.includes(localDateKey(date));
            return (
              <View key={index} style={[styles.weekDay, complete && styles.weekDayDone]}>
                <Text style={[styles.weekDayText, complete && styles.weekDayTextDone]}>{complete ? '✓' : ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.ideaCard}>
        <Text style={styles.ideaEyebrow}>YOU’VE GOT THE IDEA</Text>
        <Text style={styles.ideaTitle}>{lesson.title} · LeetCode {lesson.leetcode}</Text>
        <Text style={styles.ideaCopy}>{lesson.takeaway}</Text>
      </View>
      <View style={styles.next}>
        <Text style={styles.nextTitle}>Your next tiny step</Text>
        <Text style={styles.nextCopy}>{nextLesson ? `Try ${nextLesson.title} on your path.` : 'You finished the starting path!'}</Text>
        <Text style={styles.nextSub}>Come back whenever you’re ready to practice again.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordmark: { fontFamily: fonts.display, fontSize: 32, color: colors.ink, letterSpacing: -1.2 },
  xp: { backgroundColor: colors.paleGreen, color: colors.green, overflow: 'hidden', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 6, fontFamily: fonts.semiBold, fontSize: 15 },
  intro: { alignItems: 'center', marginTop: 33 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, color: colors.green, letterSpacing: 0.5 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 37, letterSpacing: -0.6, color: colors.ink, textAlign: 'center', marginTop: 12 },
  description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 12 },
  streakCard: { backgroundColor: colors.paleGreen, borderRadius: 24, minHeight: 229, padding: 24, marginTop: 24, overflow: 'hidden' },
  streakNumber: { fontFamily: fonts.display, fontSize: 88, lineHeight: 92, color: colors.green },
  streakLabel: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink },
  mascot: { position: 'absolute', right: 7, top: 0 },
  week: { flexDirection: 'row', gap: 8, marginTop: 25 },
  weekDay: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D3DDC8', alignItems: 'center', justifyContent: 'center' },
  weekDayDone: { backgroundColor: colors.green },
  weekDayText: { fontFamily: fonts.semiBold, fontSize: 12, color: '#59654E' },
  weekDayTextDone: { color: colors.white },
  ideaCard: { marginTop: 20, backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 15 },
  ideaEyebrow: { fontFamily: fonts.bold, fontSize: 10, color: colors.green, letterSpacing: 0.3 },
  ideaTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.ink, marginTop: 5 },
  ideaCopy: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },
  next: { marginTop: 27 },
  nextTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink },
  nextCopy: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 7 },
  nextSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 7 },
  footer: { paddingHorizontal: 24, paddingTop: 9, paddingBottom: 12, backgroundColor: colors.cream },
});
