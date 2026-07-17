import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YatriLogo } from './YatriLogo';
import { getForegroundLocation } from '../services/location';
import { colors, fonts, spacing } from '../theme';

type LocationPermissionScreenProps = {
  onComplete: () => void;
};

const backgroundImage = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=85';

export function LocationPermissionScreen({ onComplete }: LocationPermissionScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');

  const requestLocation = async () => {
    setRequesting(true);
    setMessage('');

    try {
      const location = await getForegroundLocation(true);
      if (!location) {
        setMessage('Location access was declined. You can continue and enable it later in device settings.');
        return;
      }
      onComplete();
    } catch {
      setMessage('Yatri could not get your location. Check device location services or continue without it.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.background}>
      <LinearGradient colors={['rgba(7,6,15,0.16)', 'rgba(7,6,15,0.52)', 'rgba(7,6,15,0.94)']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={[styles.safeArea, isDesktop && styles.safeAreaDesktop]}>
        <View style={styles.topRow}>
          <YatriLogo compact />
        </View>
        <View style={[styles.shell, isDesktop && styles.shellDesktop]}>
          {isDesktop && (
            <View style={styles.desktopCopy}>
              <Text style={styles.desktopEyebrow}>Location-aware safety</Text>
              <Text style={styles.desktopTitle}>Nearby stays, district context, and SOS coordinates work better with your location.</Text>
              <Text style={styles.desktopText}>Yatri only asks for foreground access. You can keep exploring without it, then enable it later when you need safer navigation.</Text>
            </View>
          )}
        <View style={[styles.content, isDesktop && styles.contentDesktop]}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={32} color="#1a0f00" />
          </View>
          <Text style={styles.eyebrow}>ONE QUICK SETUP</Text>
          <Text style={styles.title}>Let Yatri use your location?</Text>
          <Text style={styles.body}>Your location helps Yatri find nearby stays, choose the right district guide, navigate safely, and prepare accurate SOS coordinates.</Text>

          <View style={styles.privacyRow}>
            <Ionicons name="shield-checkmark-outline" size={19} color={colors.teal} />
            <Text style={styles.privacyText}>Used only while you use Yatri. You stay in control through device settings.</Text>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={requesting}
            onPress={requestLocation}
            style={({ pressed }) => [styles.allowButton, (pressed || requesting) && styles.buttonPressed]}
          >
            <Ionicons name="navigate" size={19} color="#1a0f00" />
            <Text style={styles.allowText}>{requesting ? 'Requesting location...' : 'Allow location'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onComplete} style={styles.notNowButton}>
            <Text style={styles.notNowText}>Not now</Text>
          </Pressable>
        </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  safeAreaDesktop: { paddingHorizontal: 64, paddingVertical: 38 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  shell: { flex: 1, justifyContent: 'center' },
  shellDesktop: { alignItems: 'center', flexDirection: 'row', gap: 72, justifyContent: 'center' },
  desktopCopy: { flex: 1, maxWidth: 720 },
  desktopEyebrow: { color: colors.gold, fontFamily: fonts.label, fontSize: 14, fontWeight: '900', letterSpacing: 2.2, textTransform: 'uppercase' },
  desktopTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 64, fontWeight: '700', lineHeight: 72, marginTop: spacing.sm },
  desktopText: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.body, fontSize: 21, lineHeight: 34, marginTop: spacing.lg, maxWidth: 620 },
  content: { alignSelf: 'center', backgroundColor: 'rgba(12,10,25,0.94)', borderColor: colors.border, borderRadius: 18, borderWidth: 1, maxWidth: 560, padding: spacing.xl, width: '100%' },
  contentDesktop: { flex: 1, maxWidth: 560, padding: 38 },
  locationIcon: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 24, height: 52, justifyContent: 'center', marginBottom: spacing.lg, width: 52 },
  eyebrow: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 34, fontWeight: '700', lineHeight: 40, marginTop: spacing.xs },
  body: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, marginTop: spacing.md },
  privacyRow: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg, paddingVertical: spacing.md },
  privacyText: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  message: { color: colors.goldLight, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginBottom: spacing.sm },
  allowButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 14, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 50, paddingHorizontal: spacing.md },
  allowText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  notNowButton: { alignItems: 'center', justifyContent: 'center', minHeight: 46, marginTop: spacing.xs },
  notNowText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 12, fontWeight: '800' },
  buttonPressed: { opacity: 0.75 }
});
