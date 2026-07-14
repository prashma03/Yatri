import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  hasCompletedLocationPrompt,
  hasCompletedTravelPreferences,
  rememberLocationPrompt,
  saveTravelPreferences,
  type TravelerPreferences
} from './src/auth/localSession';
import { supabase } from './src/auth/supabase';
import { saveProfilePreferences } from './src/services/mvpRepository';
import { LocationPermissionScreen } from './src/components/LocationPermissionScreen';
import { TravelPreferenceScreen } from './src/components/TravelPreferenceScreen';
import { YatriDashboardScreen } from './src/screens/YatriDashboardScreen';
import { YatriLoginScreen } from './src/screens/YatriLoginScreen';
import { YatriAiChat } from './src/components/YatriAiChat';
import { colors, fonts, spacing } from './src/theme';

type AppStage = 'loading' | 'login' | 'preferences' | 'location' | 'dashboard';
type LoginIntent = 'sign-in' | 'sign-up';

function getSignedInStage(): AppStage {
  if (!hasCompletedTravelPreferences()) return 'preferences';
  return hasCompletedLocationPrompt() ? 'dashboard' : 'location';
}

export default function App() {
  const [stage, setStage] = useState<AppStage>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setStage('login');
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }: { data: { session: { user: { email?: string | null } } | null } }) => {
      if (!mounted) return;
      setUserEmail(data.session?.user.email ?? null);
      setStage(data.session ? getSignedInStage() : 'login');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event: string, session: { user: { email?: string | null } } | null) => {
      if (!mounted) return;
      setUserEmail(session?.user.email ?? null);
      if (event === 'SIGNED_OUT') {
        setStage('login');
      } else if (event === 'SIGNED_IN') {
        setStage((current) =>
          current === 'loading' || current === 'login' ? getSignedInStage() : current
        );
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  function proceedAfterPreferences() {
    setStage(hasCompletedLocationPrompt() ? 'dashboard' : 'location');
  }

  function handleGuestContinue() {
    setShowGuestPrompt(true);
    if (!hasCompletedTravelPreferences()) {
      setStage('preferences');
      return;
    }
    proceedAfterPreferences();
  }

  function handleAuthenticated(intent: LoginIntent) {
    if (intent === 'sign-up' && !hasCompletedTravelPreferences()) {
      setStage('preferences');
      return;
    }
    proceedAfterPreferences();
  }

  async function handlePreferencesComplete(preferences: TravelerPreferences) {
    saveTravelPreferences(preferences);
    try { await saveProfilePreferences(preferences); } catch { /* Local preferences remain available for offline use. */ }
    proceedAfterPreferences();
  }

  function handleLocationComplete() {
    rememberLocationPrompt();
    setStage('dashboard');
  }

  async function handleSignOut() {
    await supabase?.auth.signOut();
    setUserEmail(null);
    setShowGuestPrompt(false);
    setStage('login');
  }

  function openSignInFromGuestPrompt() {
    setShowGuestPrompt(false);
    setStage('login');
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {stage === 'loading' && (
        <View style={styles.loading}>
          <ActivityIndicator color="#f5a623" size="large" />
        </View>
      )}
      {stage === 'login' && (
        <YatriLoginScreen onAuthenticated={handleAuthenticated} onGuestContinue={handleGuestContinue} />
      )}
      {stage === 'preferences' && <TravelPreferenceScreen onComplete={handlePreferencesComplete} />}
      {stage === 'location' && <LocationPermissionScreen onComplete={handleLocationComplete} />}
      {stage === 'dashboard' && <YatriDashboardScreen onSignOut={handleSignOut} userEmail={userEmail} />}
      {stage === 'dashboard' && <YatriAiChat page={stage} />}
      <Modal transparent animationType="fade" visible={stage === 'dashboard' && !userEmail && showGuestPrompt}>
        <View style={styles.modalBackdrop}>
          <View style={styles.guestPrompt}>
            <Text style={styles.guestEyebrow}>Guest mode</Text>
            <Text style={styles.guestTitle}>Sign in to unlock Yatri's best features.</Text>
            <Text style={styles.guestText}>
              Keep exploring now, or sign in to sync saved districts, submit safety reports, confirm community alerts, and keep your emergency contacts with your account.
            </Text>
            <View style={styles.guestActions}>
              <Pressable accessibilityRole="button" onPress={() => setShowGuestPrompt(false)} style={styles.guestSecondaryButton}>
                <Text style={styles.guestSecondaryText}>Keep exploring</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={openSignInFromGuestPrompt} style={styles.guestPrimaryButton}>
                <Text style={styles.guestPrimaryText}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#07060f',
    flex: 1,
    justifyContent: 'center'
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(7,6,15,0.72)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg
  },
  guestPrompt: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(245,166,35,0.36)',
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 440,
    padding: spacing.lg,
    width: '100%'
  },
  guestEyebrow: {
    color: colors.gold,
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'
  },
  guestTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36
  },
  guestText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.sm
  },
  guestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  guestPrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 15,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48
  },
  guestPrimaryText: {
    color: '#1a0f00',
    fontFamily: fonts.accent,
    fontSize: 14,
    fontWeight: '900'
  },
  guestSecondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48
  },
  guestSecondaryText: {
    color: colors.text,
    fontFamily: fonts.accent,
    fontSize: 14,
    fontWeight: '800'
  }
});
