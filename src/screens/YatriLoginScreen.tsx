import { useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YatriLogo } from '../components/YatriLogo';
import { colors, fonts, spacing } from '../theme';

type YatriLoginScreenProps = {
  onContinue: (remember: boolean) => void;
};

const loginImage =
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80';

export function YatriLoginScreen({ onContinue }: YatriLoginScreenProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const isSignUp = mode === 'sign-up';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={{ uri: loginImage }} style={styles.background} imageStyle={styles.backgroundImage}>
        <LinearGradient
          colors={['rgba(7,6,15,0.45)', 'rgba(7,6,15,0.84)', colors.bg]}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <YatriLogo />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Offline Nepal companion</Text>
            <Text style={styles.title}>{isSignUp ? 'Create your Yatri account.' : 'Sign in before the trail goes quiet.'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Verify your email later to sync offline packs, saved trails, and emergency details across devices.'
                : 'Keep saved phrases, fair prices, emergency contacts, and offline packs synced for your journey.'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.modeTabs}>
              <Pressable
                style={[styles.modeTab, !isSignUp && styles.modeTabActive]}
                onPress={() => setMode('sign-in')}
              >
                <Text style={[styles.modeTabText, !isSignUp && styles.modeTabTextActive]}>Sign in</Text>
              </Pressable>
              <Pressable
                style={[styles.modeTab, isSignUp && styles.modeTabActive]}
                onPress={() => setMode('sign-up')}
              >
                <Text style={[styles.modeTabText, isSignUp && styles.modeTabTextActive]}>Sign up</Text>
              </Pressable>
            </View>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="person-outline" size={18} color={colors.dim} />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={colors.dim}
                    style={styles.input}
                    value={name}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputShell}>
                <Ionicons name="mail-outline" size={18} color={colors.dim} />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.dim}
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputShell}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.dim} />
                <TextInput
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.dim}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable onPress={() => setShowPassword((current) => !current)} accessibilityLabel="Toggle password visibility">
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
                </Pressable>
              </View>
            </View>

            <View style={styles.formRow}>
              <Pressable style={styles.remember} onPress={() => setRemember((current) => !current)}>
                <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                  {remember && <Ionicons name="checkmark" size={13} color="#1a0f00" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Text style={styles.linkText}>Forgot?</Text>
            </View>

            <Pressable style={styles.primaryButton} onPress={() => onContinue(remember)}>
              <Text style={styles.primaryText}>{isSignUp ? 'Create account' : 'Sign in'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#1a0f00" />
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={() => onContinue(false)}>
              <Ionicons name="compass-outline" size={18} color={colors.text} />
              <Text style={styles.secondaryText}>Continue as guest</Text>
            </Pressable>

            <Text style={styles.terms}>
              {isSignUp
                ? 'Real email verification will turn this into a secure account once Supabase or Firebase is connected.'
                : 'New to Yatri? Tap Sign up to create an account and verify your email.'}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg
  },
  background: {
    flex: 1
  },
  backgroundImage: {
    opacity: 0.82
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: spacing.lg
  },
  logoWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(7,6,15,0.76)',
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.md
  },
  heroCopy: {
    marginTop: 'auto',
    paddingBottom: spacing.lg
  },
  eyebrow: {
    color: colors.gold,
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'
  },
  title: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 46,
    maxWidth: 430
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.md,
    maxWidth: 430
  },
  form: {
    backgroundColor: 'rgba(17,15,30,0.92)',
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.md
  },
  modeTabs: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: 5
  },
  modeTab: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10
  },
  modeTabActive: {
    backgroundColor: 'rgba(245,166,35,0.16)',
    borderColor: 'rgba(245,166,35,0.35)'
  },
  modeTabText: {
    color: colors.muted,
    fontFamily: fonts.accent,
    fontSize: 13,
    fontWeight: '900'
  },
  modeTabTextActive: {
    color: colors.goldLight
  },
  inputGroup: {
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  label: {
    color: colors.goldLight,
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15
  },
  formRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  remember: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22
  },
  checkboxActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold
  },
  rememberText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13
  },
  linkText: {
    color: colors.gold,
    fontFamily: fonts.accent,
    fontSize: 13,
    fontWeight: '800'
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 18,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52
  },
  primaryText: {
    color: '#1a0f00',
    fontFamily: fonts.accent,
    fontSize: 15,
    fontWeight: '900'
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 50
  },
  secondaryText: {
    color: colors.text,
    fontFamily: fonts.accent,
    fontSize: 14,
    fontWeight: '800'
  },
  terms: {
    color: colors.dim,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.md,
    textAlign: 'center'
  }
});
