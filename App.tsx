import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadRememberedSession, rememberSession } from './src/auth/localSession';
import { YatriDashboardScreen } from './src/screens/YatriDashboardScreen';
import { YatriLoginScreen } from './src/screens/YatriLoginScreen';

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(() => loadRememberedSession());

  function handleContinue(remember: boolean) {
    if (remember) {
      rememberSession();
    }

    setIsSignedIn(true);
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {isSignedIn ? <YatriDashboardScreen /> : <YatriLoginScreen onContinue={handleContinue} />}
    </SafeAreaProvider>
  );
}
