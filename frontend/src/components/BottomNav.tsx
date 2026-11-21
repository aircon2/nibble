import { usePathname, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

const tabs = [
  { label: 'Today', path: '/' },
  { label: 'Path', path: '/path' },
  { label: 'You', path: '/you' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <View style={styles.nav}>
      {tabs.map((tab) => {
        const active = pathname === tab.path;
        return (
          <Pressable key={tab.label} accessibilityRole="tab" accessibilityState={{ selected: active }} aria-selected={active} onPress={() => router.replace(tab.path)} style={styles.tab}>
            <Text style={[styles.label, active && styles.active]}>{tab.label}</Text>
            {active && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white, paddingTop: 8, paddingBottom: 5 },
  tab: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 5 },
  label: { fontFamily: fonts.semiBold, color: colors.muted, fontSize: 13 },
  active: { color: colors.green },
  dot: { width: 5, height: 5, backgroundColor: colors.green, borderRadius: 3 },
});
