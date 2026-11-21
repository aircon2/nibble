import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '@/components/BottomNav';
import { Screen } from '@/components/Screen';
import { useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

const path = [
  { number: '01', title: 'Find your first match', detail: 'Arrays · Find a pair', ready: true },
  { number: '02', title: 'Move the pointers', detail: 'Two pointers · Coming next', ready: false },
  { number: '03', title: 'Grow the window', detail: 'Sliding window · Coming next', ready: false },
];

export default function PathScreen() {
  const { completedDates } = useProgress();
  const done = completedDates.length > 0;
  return (
    <Screen footer={<BottomNav />}>
      <Text style={styles.wordmark}>nibble</Text>
      <Text style={styles.eyebrow}>YOUR STARTING PATH</Text>
      <Text style={styles.title}>One idea at a time.</Text>
      <Text style={styles.copy}>You don’t need to know everything before you start. Here’s where we begin.</Text>
      <View style={styles.list}>
        {path.map((item) => (
          <Pressable key={item.number} disabled={!item.ready} onPress={() => router.push('/lesson')} style={[styles.row, !item.ready && styles.upcoming]}>
            <View style={styles.number}><Text style={styles.numberText}>{item.number}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDetail}>{item.detail}</Text>
            </View>
            <Text style={styles.status}>{item.ready ? (done ? '✓' : '→') : '○'}</Text>
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
  upcoming: { opacity: 0.57 },
  number: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.paleGreen, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: fonts.bold, fontSize: 14, color: colors.green },
  rowTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.ink },
  rowDetail: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 5 },
  status: { fontFamily: fonts.bold, fontSize: 19, color: colors.green },
});
