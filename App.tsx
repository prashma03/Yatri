import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { YatriDashboardScreen } from './src/screens/YatriDashboardScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <YatriDashboardScreen />
    </SafeAreaProvider>
  );
}
