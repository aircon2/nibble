import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { ProgressProvider } from '@/state/progress';
import { AuthProvider } from '@/components/AuthProvider';
import { colors } from '@/theme';

export default function RootLayout() {
  const [loaded] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold, Nunito_800ExtraBold });
  if (!loaded) return null;
  return (
    <AuthProvider>
      <ProgressProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'fade' }} />
      </ProgressProvider>
    </AuthProvider>
  );
}
