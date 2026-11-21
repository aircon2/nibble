import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from '@/components/BottomNav';
import { PathMap, type PathTheme } from '@/components/PathMap';
import { Screen } from '@/components/Screen';
import { lessons } from '@/data/lessons';
import { useProgress } from '@/state/progress';
import { colors, fonts } from '@/theme';

const THEME_KEY = 'nibble-path-theme-v1';
const themes: { id: PathTheme; label: string; color: string }[] = [
  { id: 'forest', label: 'Forest', color: '#5E8A65' },
  { id: 'mountain', label: 'Mountain', color: '#819BB8' },
  { id: 'beach', label: 'Beach', color: '#E5B676' },
  { id: 'solid', label: 'Solid', color: '#D7C4A9' },
];

export default function PathScreen() {
  const { completedLessons } = useProgress();
  const [theme, setTheme] = useState<PathTheme>('forest');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (themes.some((item) => item.id === saved)) setTheme(saved as PathTheme);
    }).catch(() => {});
  }, []);

  function chooseTheme(next: PathTheme) {
    setTheme(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }

  return (
    <Screen footer={<BottomNav />}>
      <View style={styles.topline}>
        <Text style={styles.wordmark}>nibble</Text>
        <View style={styles.progressPill}><Text style={styles.progressText}>{completedLessons.length} / {lessons.length} explored</Text></View>
      </View>
      <Text style={styles.eyebrow}>YOUR LEARNING JOURNEY</Text>
      <Text style={styles.title}>Follow the trail.</Text>
      <Text style={styles.copy}>Three real interview problems. One small step at a time.</Text>

      <Text style={styles.themeLabel}>CHOOSE YOUR SCENERY</Text>
      <View style={styles.themeRow} accessibilityRole="radiogroup" accessibilityLabel="Map background">
        {themes.map((item) => <Pressable
          key={item.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: theme === item.id }}
          aria-checked={theme === item.id}
          onPress={() => chooseTheme(item.id)}
          style={[styles.themeChip, theme === item.id && styles.themeChipActive]}
        >
          <View style={[styles.swatch, { backgroundColor: item.color }]} />
          <Text style={[styles.themeText, theme === item.id && styles.themeTextActive]}>{item.label}</Text>
        </Pressable>)}
      </View>

      <PathMap theme={theme} completedLessons={completedLessons} />
      <Text style={styles.footerNote}>Tap any stop to practice. Revisit lessons whenever you like.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordmark: { fontFamily: fonts.display, fontSize: 32, letterSpacing: -1.2, color: colors.ink },
  progressPill: { borderRadius: 20, backgroundColor: colors.paleGreen, paddingHorizontal: 12, paddingVertical: 7 },
  progressText: { fontFamily: fonts.bold, fontSize: 11, color: colors.green },
  eyebrow: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.8, color: colors.green, marginTop: 28 },
  title: { fontFamily: fonts.display, fontSize: 31, lineHeight: 38, color: colors.ink, marginTop: 7 },
  copy: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 6 },
  themeLabel: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.7, color: colors.muted, marginTop: 25, marginBottom: 11 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  themeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20 },
  themeChipActive: { borderColor: colors.green, backgroundColor: colors.paleGreen },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  themeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted },
  themeTextActive: { fontFamily: fonts.bold, color: colors.green },
  footerNote: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 15, marginBottom: 10 },
});
