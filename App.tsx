import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  hasCompletedLocationPrompt,
  loadRememberedSession,
  rememberLocationPrompt,
  rememberSession
} from './src/auth/localSession';
import { LocationPermissionScreen } from './src/components/LocationPermissionScreen';
import { YatriDashboardScreen } from './src/screens/YatriDashboardScreen';
import { YatriLoginScreen } from './src/screens/YatriLoginScreen';

type AppStage = 'login' | 'location' | 'dashboard';

export default function App() {
  const [stage, setStage] = useState<AppStage>(() => {
    if (!loadRememberedSession()) return 'login';
    return hasCompletedLocationPrompt() ? 'dashboard' : 'location';
  });

  function handleContinue(remember: boolean) {
    if (remember) {
      rememberSession();
    }

    setStage(hasCompletedLocationPrompt() ? 'dashboard' : 'location');
  }

  function handleLocationComplete() {
    rememberLocationPrompt();
    setStage('dashboard');
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {stage === 'login' && <YatriLoginScreen onContinue={handleContinue} />}
      {stage === 'location' && <LocationPermissionScreen onComplete={handleLocationComplete} />}
      {stage === 'dashboard' && <YatriDashboardScreen />}
    </SafeAreaProvider>
  );
}
