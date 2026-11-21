import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '@/components/BottomNav';
import { AccountCard } from '@/components/AccountCard';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { currentStreak, useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

export default function YouScreen() {
  const { completedDates, xp, resetProgress, syncMode, syncError } = useProgress();
  return (
    <Screen footer={<BottomNav />}>
      <Text style={styles.wordmark}>nibble</Text>
      <View style={styles.hero}>
        <Mascot size={95} waveOnPress />
        <Text style={styles.eyebrow}>YOUR SMALL WINS</Text>
        <Text style={styles.title}>Look how far you’ve come.</Text>
      </View>
      <AccountCard />
      <Text style={styles.syncNote}>{syncMode === 'cloud' ? 'Your progress is saved to your account.' : syncError ?? 'Progress is saved on this device.'}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.value}>{completedDates.length}</Text><Text style={styles.label}>{completedDates.length === 1 ? 'day practiced' : 'days practiced'}</Text></View>
        <View style={styles.stat}><Text style={styles.value}>{currentStreak(completedDates)}</Text><Text style={styles.label}>day streak</Text></View>
        <View style={styles.stat}><Text style={styles.value}>{xp}</Text><Text style={styles.label}>XP earned</Text></View>
      </View>
      <Text style={styles.note}>Every small session counts. Come back whenever you’re ready.</Text>
      <Pressable accessibilityRole="button" onPress={resetProgress} style={styles.reset}><Text style={styles.resetText}>Reset demo progress</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wordmark: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  hero: { marginTop: 34, alignItems: 'center' },
  eyebrow: { fontFamily: fonts.bold, fontSize: 10, color: colors.green, letterSpacing: 0.5, marginTop: 18 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, textAlign: 'center', marginTop: 9 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  value: { fontFamily: fonts.display, fontSize: 26, color: colors.green },
  label: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 4 },
  note: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center', marginTop: 27 },
  syncNote: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 10 },
  reset: { alignSelf: 'center', padding: 13, marginTop: 24 },
  resetText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.muted, textDecorationLine: 'underline' },
});
