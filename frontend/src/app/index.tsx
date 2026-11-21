import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '@/components/BottomNav';
import { Mascot } from '@/components/Mascot';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { lessons } from '@/data/lessons';
import { currentStreak, localDateKey, useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

function weekDays() {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

const courses: { id: string; title: string; description: string; icon: string; lessonIds: string[] }[] = [
  { id: 'arrays', title: 'Arrays & Two Pointers', description: 'Lookups, merges, and water between bars', icon: '▦', lessonIds: ['two-sum', 'merge-sorted-arrays', 'three-sum', 'trapping-rain-water'] },
  { id: 'strings', title: 'Strings & Stacks', description: 'Match brackets and grow windows', icon: '{ }', lessonIds: ['valid-parentheses', 'longest-substring', 'minimum-window-substring'] },
  { id: 'trees', title: 'Trees & DFS', description: 'Explore nodes in different orders', icon: '♧', lessonIds: ['tree-traversals', 'validate-bst', 'binary-tree-max-path'] },
  { id: 'search', title: 'Search & Dynamic Programming', description: 'Halve the search and optimize a run', icon: '⌕', lessonIds: ['binary-search', 'maximum-subarray', 'edit-distance'] },
];

export default function TodayScreen() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { completedDates, completedLessons, ready } = useProgress();
  const streak = currentStreak(completedDates);
  const doneToday = completedLessons.includes(lessons[0].id);
  const nextLessonId = lessons.find((lesson) => !completedLessons.includes(lesson.id))?.id;
  const activeCourse = selectedCourse === null
    ? courses.find((course) => course.lessonIds.includes(nextLessonId ?? ''))?.id ?? courses[0].id
    : selectedCourse;
  const todayKey = localDateKey();

  return (
    <Screen footer={<BottomNav />}>
      <View style={styles.topline}>
        <Text style={styles.wordmark}>nibble</Text>
        <View style={styles.streakPill}><Text style={styles.streakText}>{streak ? `${streak}-day streak` : 'Start a streak'}</Text></View>
      </View>

      <View style={styles.intro}>
        <View style={styles.introText}>
          <Text style={styles.eyebrow}>SMALL STEPS. REAL SKILLS.</Text>
          <Text style={styles.title}>A little practice.{'\n'}A lot less scary.</Text>
        </View>
        <View style={styles.mascot}><Mascot size={112} waveOnPress /></View>
        <Text style={styles.introCopy}>No perfect starting point needed.{'\n'}Just you, five minutes, and one small win.</Text>
      </View>

      <View style={styles.week} accessibilityLabel="Your week">
        {weekDays().map((date, index) => {
          const key = localDateKey(date);
          const complete = completedDates.includes(key);
          const isToday = key === todayKey;
          return (
            <View key={key} style={styles.day}>
              <Text style={styles.dayLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
              <View style={[styles.dayCircle, complete && styles.dayComplete, isToday && !complete && styles.dayToday]}>
                <Text style={[styles.dayValue, complete && styles.dayValueComplete]}>{complete ? '✓' : date.getDate()}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.dailyCard}>
        <Text style={styles.cardEyebrow}>YOUR DAILY 5</Text>
        <Text style={styles.cardTitle}>{doneToday ? 'Two Sum, solved' : 'Solve Two Sum'}</Text>
        <Text style={styles.cardCopy}>Find the right indices, handle duplicates, and discover the one-pass solution.</Text>
        <View style={styles.meta}>
          <Text style={styles.tag}>LeetCode #1</Text>
          <Text style={styles.metaText}>Hash map · Easy · 5 min</Text>
        </View>
        <PrimaryButton label={doneToday ? 'Practice again  →' : 'Let’s do one  →'} onPress={() => router.push({ pathname: '/lesson', params: { lesson: lessons[0].id } })} />
      </View>

      <View style={styles.pathHeading}>
        <Text style={styles.pathTitle}>Choose a course</Text>
        <Text style={styles.pathCount}>{ready ? completedLessons.length : 0} of {lessons.length}</Text>
      </View>
      {courses.map((course) => <View key={course.id} style={styles.courseCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: activeCourse === course.id }}
          onPress={() => setSelectedCourse(activeCourse === course.id ? '' : course.id)}
          style={styles.courseHeader}
        >
          <View style={styles.courseIcon}><Text style={styles.courseIconText}>{course.icon}</Text></View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            <Text style={styles.courseProgress}>{course.lessonIds.filter((id) => completedLessons.includes(id)).length} of {course.lessonIds.length} completed</Text>
          </View>
          <Text style={styles.courseChevron}>{activeCourse === course.id ? '⌄' : '›'}</Text>
        </Pressable>
        {activeCourse === course.id && <View style={styles.courseLessons}>{(['Easy', 'Medium', 'Hard'] as const).map((level) => <View key={level}>
          <Text style={styles.levelHeading}>{level.toUpperCase()}</Text>
          {lessons.filter((lesson) => course.lessonIds.includes(lesson.id) && lesson.difficulty === level).map((lesson) => {
        const complete = completedLessons.includes(lesson.id);
        const next = lesson.id === nextLessonId;
        return <Pressable
          key={lesson.id}
          onPress={() => router.push({ pathname: '/lesson', params: { lesson: lesson.id } })}
          style={[styles.lessonRow, next && styles.lessonRowNext]}
          accessibilityRole="button"
          accessibilityLabel={`${lesson.title}, LeetCode ${lesson.leetcode}, ${complete ? 'completed' : next ? 'up next' : 'lesson'}`}
        >
          <View style={[styles.lessonNumber, complete && styles.lessonNumberComplete]}><Text style={[styles.lessonNumberText, complete && styles.lessonNumberTextComplete]}>{complete ? '✓' : lesson.number}</Text></View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonSub}>LeetCode {lesson.leetcode} · {lesson.pattern}</Text>
          </View>
          <Text style={[styles.difficulty, lesson.difficulty === 'Medium' && styles.difficultyMedium, lesson.difficulty === 'Hard' && styles.difficultyHard]}>{lesson.difficulty}</Text>
          <Text style={styles.chevron}>{next ? '→' : '›'}</Text>
        </Pressable>;
          })}
        </View>)}</View>}
      </View>)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontFamily: fonts.display, fontSize: 32, letterSpacing: -1.2, color: colors.ink },
  streakPill: { minWidth: 128, height: 34, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.peach, alignItems: 'center', justifyContent: 'center' },
  streakText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ink },
  intro: { marginTop: 30, minHeight: 165 },
  introText: { paddingRight: 85 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 10, color: colors.green, letterSpacing: 0.4 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 33, letterSpacing: -0.6, color: colors.ink, marginTop: 10 },
  mascot: { position: 'absolute', right: 0, top: 5 },
  introCopy: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 30 },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 },
  day: { alignItems: 'center', gap: 8, flex: 1 },
  dayLabel: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.muted },
  dayCircle: { width: 37, height: 37, borderRadius: 19, backgroundColor: colors.warmCard, alignItems: 'center', justifyContent: 'center' },
  dayToday: { borderWidth: 2, borderColor: colors.green, backgroundColor: colors.white },
  dayComplete: { backgroundColor: colors.green },
  dayValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ink },
  dayValueComplete: { color: colors.white },
  dailyCard: { marginTop: 26, backgroundColor: colors.white, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#F4EFE6' },
  cardEyebrow: { fontFamily: fonts.bold, fontSize: 10, color: colors.green, letterSpacing: 0.4 },
  cardTitle: { fontFamily: fonts.display, fontSize: 23, color: colors.ink, marginTop: 8 },
  cardCopy: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, marginBottom: 19 },
  tag: { backgroundColor: colors.paleGreen, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, color: colors.green, fontFamily: fonts.semiBold, fontSize: 12 },
  metaText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  pathHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 29, marginBottom: 11 },
  pathTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.ink },
  pathCount: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  courseCard: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: '#F4EFE6', marginBottom: 10, overflow: 'hidden' },
  courseHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 },
  courseIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  courseIconText: { fontFamily: fonts.bold, fontSize: 22, color: colors.green },
  courseInfo: { flex: 1 },
  courseTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ink },
  courseDescription: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 3 },
  courseProgress: { fontFamily: fonts.bold, fontSize: 10, color: colors.green, marginTop: 5 },
  courseChevron: { fontFamily: fonts.regular, fontSize: 25, color: colors.muted },
  courseLessons: { paddingHorizontal: 10, paddingBottom: 8 },
  levelHeading: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.6, color: colors.muted, marginTop: 8, marginBottom: 6, marginLeft: 4 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, padding: 14, borderRadius: 17, marginBottom: 9, borderWidth: 1, borderColor: '#F4EFE6' },
  lessonRowNext: { borderColor: colors.green },
  lessonInfo: { flex: 1 },
  lessonNumber: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  lessonNumberComplete: { backgroundColor: colors.green },
  lessonNumberText: { fontFamily: fonts.bold, fontSize: 14, color: colors.green },
  lessonNumberTextComplete: { color: colors.white },
  lessonTitle: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ink },
  lessonSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 3 },
  difficulty: { fontFamily: fonts.bold, fontSize: 10, color: colors.green, backgroundColor: colors.paleGreen, borderRadius: 10, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 4 },
  difficultyMedium: { color: '#8A622A', backgroundColor: '#F9EBCD' },
  difficultyHard: { color: '#9B4A42', backgroundColor: '#FBE3DC' },
  chevron: { fontFamily: fonts.regular, fontSize: 26, color: colors.muted },
});
