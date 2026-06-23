import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { YatriHomeScreen } from './src/screens/YatriHomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <YatriHomeScreen />
    </SafeAreaProvider>
  );
}
