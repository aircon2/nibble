import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/theme';

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  label: { color: colors.white, fontFamily: fonts.semiBold, fontSize: 15 },
});
