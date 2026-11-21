import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

const callbackUrl = typeof window === 'undefined' ? 'http://localhost:8081/' : `${window.location.origin}/`;

export function AccountCard() {
  const { error, isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  const [actionError, setActionError] = useState<string | null>(null);

  const login = async (signup = false) => {
    setActionError(null);
    try {
      await loginWithRedirect(signup ? { authorizationParams: { screen_hint: 'signup' } } : undefined);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Sign in could not start. Please try again.');
    }
  };

  const signOut = async () => {
    setActionError(null);
    try {
      await logout({ logoutParams: { returnTo: callbackUrl } });
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Sign out could not start. Please try again.');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.green} style={styles.loading} accessibilityLabel="Checking sign in" />
      ) : isAuthenticated ? (
        <>
          <Text style={styles.title}>Hi, {user?.name || user?.nickname || 'friend'}!</Text>
          {user?.email && <Text style={styles.detail}>{user.email}</Text>}
          <Pressable accessibilityRole="button" onPress={signOut} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.title}>Make it yours</Text>
          <Text style={styles.detail}>Sign in to your Nibble account.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => login(true)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign up</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => login()} style={[styles.secondaryButton, styles.secondaryInline]}>
              <Text style={styles.secondaryButtonText}>Log in</Text>
            </Pressable>
          </View>
        </>
      )}
      {(actionError || error) && <Text style={styles.error}>{actionError || error?.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 28, backgroundColor: colors.white, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.line },
  eyebrow: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.5, color: colors.green },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 8 },
  detail: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 5 },
  loading: { marginTop: 20, alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  primaryButton: { backgroundColor: colors.green, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12 },
  primaryButtonText: { fontFamily: fonts.semiBold, color: colors.white, fontSize: 13 },
  secondaryButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.green, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 18 },
  secondaryInline: { marginTop: 0 },
  secondaryButtonText: { fontFamily: fonts.semiBold, color: colors.green, fontSize: 13 },
  error: { fontFamily: fonts.regular, color: colors.error, fontSize: 12, marginTop: 12 },
});
