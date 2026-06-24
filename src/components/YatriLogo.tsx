import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type YatriLogoProps = {
  compact?: boolean;
  dark?: boolean;
};

export function YatriLogo({ compact = false, dark = true }: YatriLogoProps) {
  const markSize = compact ? 44 : 54;
  const lineColor = dark ? colors.gold : colors.red;
  const textColor = dark ? colors.gold : colors.text;
  const subColor = dark ? colors.muted : 'rgba(17,15,30,0.48)';

  return (
    <View style={styles.logoRow}>
      <View style={[styles.mark, { height: markSize, width: markSize }]} accessibilityLabel="Yatri mountain logo">
        <View style={[styles.summitDot, { backgroundColor: lineColor }]} />
        <View style={[styles.leftLine, { backgroundColor: lineColor }]} />
        <View style={[styles.rightLine, { backgroundColor: lineColor }]} />
        <View style={[styles.baseLine, { backgroundColor: lineColor }]} />
        {!compact && <Text style={[styles.nepaliName, { color: lineColor }]}>यात्री</Text>}
      </View>
      <View>
        <Text style={[styles.wordmark, { color: textColor }, compact && styles.compactWordmark]}>Yatri</Text>
        <Text style={[styles.tagline, { color: subColor }]}>Nepal guide</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  mark: {
    position: 'relative'
  },
  summitDot: {
    borderRadius: 5,
    height: 10,
    left: '50%',
    marginLeft: -5,
    position: 'absolute',
    top: 1,
    width: 10
  },
  leftLine: {
    borderRadius: 4,
    height: 4,
    left: 11,
    position: 'absolute',
    top: 24,
    transform: [{ rotate: '119deg' }],
    width: 39
  },
  rightLine: {
    borderRadius: 4,
    height: 4,
    position: 'absolute',
    right: 11,
    top: 24,
    transform: [{ rotate: '61deg' }],
    width: 39
  },
  baseLine: {
    borderRadius: 4,
    bottom: 14,
    height: 4,
    left: 8,
    position: 'absolute',
    width: 38
  },
  nepaliName: {
    bottom: -3,
    fontSize: 12,
    fontWeight: '800',
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center'
  },
  wordmark: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 31
  },
  compactWordmark: {
    fontSize: 26,
    lineHeight: 29
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    marginTop: 1,
    textTransform: 'uppercase'
  }
});
