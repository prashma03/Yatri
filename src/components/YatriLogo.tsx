import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type YatriLogoProps = {
  compact?: boolean;
  dark?: boolean;
};

const rainbowBands = ['#ff5d6c', '#f6b22a', '#ffd86b', '#3ecf8e', '#4fa3d9', '#8b5cf6'];

export function YatriLogo({ compact = false, dark = true }: YatriLogoProps) {
  const markSize = compact ? 44 : 56;
  const roofSide = markSize * 0.3;
  const roofHeight = markSize * 0.24;
  const textColor = dark ? colors.text : colors.bg;
  const subColor = dark ? colors.goldLight : colors.terracotta;

  return (
    <View style={styles.logoRow}>
      <View style={[styles.mark, { borderRadius: compact ? 12 : 16, height: markSize, width: markSize }]} accessibilityLabel="Yatri rainbow house logo">
        {rainbowBands.map((band, index) => (
          <View key={band} style={[styles.rainbowBand, { backgroundColor: band, top: String(index * 16.67) + '%' }]} />
        ))}
        <View
          style={[
            styles.roof,
            {
              borderBottomWidth: roofHeight,
              borderLeftWidth: roofSide,
              borderRightWidth: roofSide,
              left: markSize * 0.2,
              top: markSize * 0.12
            }
          ]}
        />
        <View style={[styles.roofLine, { left: markSize * 0.19, top: markSize * 0.36, width: markSize * 0.62 }]} />
        <View style={[styles.upperHouse, { height: markSize * 0.26, left: markSize * 0.31, top: markSize * 0.37, width: markSize * 0.38 }]}>
          <View style={styles.windowRow}>
            <View style={styles.windowPane} />
            <View style={styles.windowPane} />
          </View>
          {!compact && (
            <View style={styles.windowRow}>
              <View style={styles.windowPane} />
              <View style={styles.windowPane} />
            </View>
          )}
        </View>
        <View style={[styles.middleRoof, { left: markSize * 0.2, top: markSize * 0.63, width: markSize * 0.6 }]} />
        <View style={[styles.flagLine, { left: markSize * 0.18, top: markSize * 0.66, width: markSize * 0.64 }]} />
        <View style={[styles.flag, { left: markSize * 0.33, top: markSize * 0.66 }]} />
        <View style={[styles.flag, { left: markSize * 0.56, top: markSize * 0.66 }]} />
        <View style={[styles.lowerHouse, { height: markSize * 0.25, left: markSize * 0.32, top: markSize * 0.68, width: markSize * 0.36 }]}>
          <View style={styles.doorPane} />
          <View style={styles.doorPane} />
        </View>
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
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  rainbowBand: {
    height: '17%',
    left: 0,
    position: 'absolute',
    right: 0
  },
  roof: {
    borderBottomColor: colors.bg,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    height: 0,
    position: 'absolute',
    width: 0
  },
  roofLine: {
    backgroundColor: colors.bg,
    borderRadius: 2,
    height: 4,
    position: 'absolute'
  },
  upperHouse: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    gap: 4,
    justifyContent: 'center',
    position: 'absolute'
  },
  windowRow: {
    flexDirection: 'row',
    gap: 5
  },
  windowPane: {
    backgroundColor: colors.white,
    borderRadius: 1,
    height: 7,
    width: 7
  },
  middleRoof: {
    backgroundColor: colors.bg,
    borderRadius: 2,
    height: 5,
    position: 'absolute'
  },
  flagLine: {
    backgroundColor: colors.bg,
    borderRadius: 2,
    height: 2,
    position: 'absolute'
  },
  flag: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    borderTopColor: colors.bg,
    borderTopWidth: 8,
    height: 0,
    position: 'absolute',
    width: 0
  },
  lowerHouse: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    position: 'absolute'
  },
  doorPane: {
    backgroundColor: colors.white,
    borderRadius: 1,
    height: 15,
    width: 8
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 31
  },
  compactWordmark: {
    fontSize: 26,
    lineHeight: 29
  },
  tagline: {
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 1,
    textTransform: 'uppercase'
  }
});
