import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

const yatriMark = require('../../assets/yatri-concept-4-exact.png');

type YatriLogoProps = {
  compact?: boolean;
  dark?: boolean;
};

export function YatriLogo({ compact = false, dark = true }: YatriLogoProps) {
  const markSize = compact ? 62 : 76;
  const textColor = dark ? colors.text : colors.bg;
  const subColor = dark ? colors.goldLight : colors.terracotta;

  return (
    <View style={styles.logoRow}>
      <Image
        accessibilityLabel="Yatri rainbow house logo"
        resizeMode="contain"
        source={yatriMark}
        style={[styles.markImage, { height: markSize, width: markSize }]}
      />
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
  markImage: {
    borderRadius: 18
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 38
  },
  compactWordmark: {
    fontSize: 32,
    lineHeight: 36
  },
  tagline: {
    fontFamily: fonts.label,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 1,
    textTransform: 'uppercase'
  }
});
