import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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

type AppStage = 'loading' | 'login' | 'preferences' | 'location' | 'dashboard';
type LoginIntent = 'sign-in' | 'sign-up';

function getSignedInStage(): AppStage {
  if (!hasCompletedTravelPreferences()) return 'preferences';
  return hasCompletedLocationPrompt() ? 'dashboard' : 'location';
}

export default function App() {
  const [stage, setStage] = useState<AppStage>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        <YatriLoginScreen onAuthenticated={handleAuthenticated} onGuestContinue={proceedAfterPreferences} />
      )}
      {stage === 'preferences' && <TravelPreferenceScreen onComplete={handlePreferencesComplete} />}
      {stage === 'location' && <LocationPermissionScreen onComplete={handleLocationComplete} />}
      {stage === 'dashboard' && <YatriDashboardScreen onSignOut={handleSignOut} userEmail={userEmail} />}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#07060f',
    flex: 1,
    justifyContent: 'center'
  }
});
