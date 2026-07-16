import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';

type BadgeTone = 'ok' | 'warn' | 'danger' | 'gold' | 'blue' | 'muted';

const toneStyles: Record<BadgeTone, { backgroundColor: string; borderColor: string; color: string }> = {
  ok: { backgroundColor: 'rgba(62,207,178,0.12)', borderColor: 'rgba(62,207,178,0.32)', color: colors.teal },
  warn: { backgroundColor: 'rgba(245,166,35,0.13)', borderColor: 'rgba(245,166,35,0.34)', color: colors.goldLight },
  danger: { backgroundColor: 'rgba(255,93,108,0.14)', borderColor: 'rgba(255,93,108,0.36)', color: colors.danger },
  gold: { backgroundColor: 'rgba(245,166,35,0.15)', borderColor: 'rgba(245,166,35,0.36)', color: colors.gold },
  blue: { backgroundColor: 'rgba(79,163,217,0.14)', borderColor: 'rgba(79,163,217,0.32)', color: colors.mountainBlue },
  muted: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: colors.border, color: colors.muted }
};

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: BadgeTone }) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.backgroundColor, borderColor: toneStyle.borderColor }]}>
      <Text style={[styles.badgeText, { color: toneStyle.color }]}>{children}</Text>
    </View>
  );
}

export function PrayerFlagStrip() {
  const flags = [colors.mountainBlue, colors.white, colors.red, colors.forest, colors.gold];
  return (
    <View style={styles.flagRail}>
      {[...flags, ...flags, ...flags].map((flag, index) => (
        <View key={`${flag}-${index}`} style={[styles.flag, { backgroundColor: flag }]} />
      ))}
    </View>
  );
}

export const premiumSurface = {
  backgroundColor: 'rgba(17,15,30,0.92)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.2,
  shadowRadius: 28
} as const;

export const pressableLift = (pressed: boolean) => ({
  opacity: pressed ? 0.86 : 1,
  transform: [{ scale: pressed ? 0.985 : 1 }]
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  badgeText: {
    fontFamily: fonts.label,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  flagRail: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 0,
    marginTop: spacing.md,
    overflow: 'hidden',
    paddingVertical: 10
  },
  flag: {
    height: 18,
    width: 28
  }
});
