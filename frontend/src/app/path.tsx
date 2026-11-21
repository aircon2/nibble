import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '@/components/BottomNav';
import { Screen } from '@/components/Screen';
import { lessons } from '@/data/lessons';
import { useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

export default function PathScreen() {
  const { completedLessons } = useProgress();
  return (
    <Screen footer={<BottomNav />}>
      <Text style={styles.wordmark}>nibble</Text>
      <Text style={styles.eyebrow}>YOUR STARTING PATH</Text>
      <Text style={styles.title}>One idea at a time.</Text>
      <Text style={styles.copy}>Three real interview problems, broken into small decisions you can make on your phone.</Text>
      <View style={styles.list}>
        {lessons.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/lesson', params: { lesson: item.id } })} style={styles.row}>
            <View style={styles.number}><Text style={styles.numberText}>{item.number}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDetail}>LeetCode {item.leetcode} · {item.pattern} · {item.difficulty}</Text>
            </View>
            <Text style={styles.status}>{completedLessons.includes(item.id) ? '✓' : '→'}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wordmark: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  eyebrow: { fontFamily: fonts.bold, fontSize: 10, color: colors.green, letterSpacing: 0.5, marginTop: 34 },
  title: { fontFamily: fonts.display, fontSize: 29, color: colors.ink, marginTop: 10 },
  copy: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 10 },
  list: { gap: 12, marginTop: 28 },
  row: { minHeight: 81, borderRadius: 18, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  number: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: fonts.bold, fontSize: 14, color: colors.green },
  rowTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ink },
  rowDetail: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 5 },
  status: { fontFamily: fonts.bold, fontSize: 19, color: colors.green },
});
