import type { ComponentProps } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YatriLogo } from '../components/YatriLogo';
import { colors, spacing } from '../theme';
import {
  features,
  festivals,
  foodPrices,
  phrases,
  transportPrices,
  type Feature,
  type Festival,
  type Phrase,
  type PriceItem
} from '../data/yatriData';

const heroImage =
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80';

export function YatriHomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <YatriLogo compact />
          <Pressable style={styles.iconButton} accessibilityLabel="Open saved places">
            <Ionicons name="bookmark-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        <ImageBackground source={{ uri: heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
          <LinearGradient
            colors={['rgba(7,6,15,0.05)', 'rgba(7,6,15,0.45)', 'rgba(7,6,15,0.92)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Namaste Nepal</Text>
            <Text style={styles.heroTitle}>Explore Nepal like you belong there.</Text>
            <Text style={styles.heroText}>
              Phrases, prices, cultural tips, rides, and festival notes for curious travelers.
            </Text>
            <View style={styles.heroActions}>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Start guide</Text>
                <Ionicons name="arrow-forward" size={17} color="#1a0f00" />
              </Pressable>
              <Pressable style={styles.secondaryButton}>
                <Ionicons name="cloud-offline-outline" size={17} color={colors.white} />
                <Text style={styles.secondaryButtonText}>Offline ready</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.flagRow} accessibilityLabel="Prayer flag colors">
          {['#2768d8', '#ffffff', '#d92732', '#17a750', '#f5c236', '#2768d8', '#ffffff', '#d92732'].map(
            (flagColor, index) => (
              <View key={`${flagColor}-${index}`} style={[styles.flag, { backgroundColor: flagColor }]} />
            )
          )}
        </View>

        <SectionHeader label="Choose your path" title="What do you need first?" />
        <View style={styles.featureGrid}>
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </View>

        <SectionHeader label="Speak with care" title="Essential phrases" />
        <View style={styles.cardStack}>
          {phrases.map((phrase) => (
            <PhraseCard key={phrase.roman} phrase={phrase} />
          ))}
        </View>

        <View style={styles.gestureBox}>
          <Text style={styles.gestureLabel}>How to do Namaste</Text>
          <Text style={styles.gestureText}>
            Bring both palms together at chest level, bow slightly, and say “Namaste” with a calm smile.
          </Text>
        </View>

        <SectionHeader label="Do not get scammed" title="Fair price guide" />
        <PricePanel title="Food and drinks" icon="restaurant-outline" items={foodPrices} />
        <PricePanel title="Rides and transport" icon="bus-outline" items={transportPrices} />

        <SectionHeader label="Coming up" title="Festivals and culture" />
        <View style={styles.festivalGrid}>
          {festivals.map((festival) => (
            <FestivalCard key={festival.name} festival={festival} />
          ))}
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaLabel}>Free travel companion</Text>
          <Text style={styles.ctaTitle}>Nepal belongs in your pocket.</Text>
          <Text style={styles.ctaText}>
            This is the first app version of Yatri. Next up: audio pronunciation, saved places, and offline maps.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Pressable style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}22` }]}>
        <Ionicons name={feature.icon} size={22} color={feature.color} />
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureText}>{feature.description}</Text>
    </Pressable>
  );
}

function PhraseCard({ phrase }: { phrase: Phrase }) {
  return (
    <Pressable style={styles.phraseCard}>
      <Text style={styles.nepaliText}>{phrase.nepali}</Text>
      <View style={styles.phraseInfo}>
        <Text style={styles.phraseEnglish}>{phrase.english}</Text>
        <Text style={styles.phraseRoman}>{phrase.roman}</Text>
        <Text style={styles.phraseTip}>{phrase.tip}</Text>
      </View>
      <View style={styles.playButton}>
        <Ionicons name="volume-medium-outline" size={18} color={colors.gold} />
      </View>
    </Pressable>
  );
}

function PricePanel({ title, icon, items }: { title: string; icon: IoniconsName; items: PriceItem[] }) {
  return (
    <View style={styles.pricePanel}>
      <View style={styles.pricePanelHeader}>
        <Ionicons name={icon} size={18} color={colors.gold} />
        <Text style={styles.pricePanelTitle}>{title}</Text>
      </View>
      {items.map((item) => (
        <View key={item.name} style={styles.priceRow}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceName}>{item.name}</Text>
            <Text style={styles.priceNote}>{item.note}</Text>
          </View>
          <View style={styles.priceRight}>
            <Text style={styles.priceValue}>{item.price}</Text>
            <Text style={[styles.priceBadge, item.good ? styles.badgeGood : styles.badgeWarn]}>{item.badge}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

function FestivalCard({ festival }: { festival: Festival }) {
  return (
    <Pressable style={styles.festivalCard}>
      <View style={styles.festivalIcon}>
        <MaterialCommunityIcons name={festival.icon} size={24} color={colors.goldLight} />
      </View>
      <Text style={styles.festivalDate}>{festival.date}</Text>
      <Text style={styles.festivalName}>{festival.name}</Text>
      <Text style={styles.festivalText}>{festival.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg
  },
  content: {
    padding: spacing.md,
    paddingBottom: 44
  },
  nav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44
  },
  hero: {
    height: 560,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  heroImage: {
    borderRadius: 22
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22
  },
  heroCopy: {
    padding: spacing.lg
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'
  },
  heroTitle: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
    maxWidth: 340
  },
  heroText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.md,
    maxWidth: 320
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 28,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: 20,
    paddingVertical: 13
  },
  primaryButtonText: {
    color: '#1a0f00',
    fontSize: 14,
    fontWeight: '800'
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: 18,
    paddingVertical: 13
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700'
  },
  flagRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginVertical: spacing.lg
  },
  flag: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    height: 18,
    width: 26
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.xl
  },
  sectionLabel: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: spacing.xs,
    textTransform: 'uppercase'
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 32
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 162,
    padding: spacing.md,
    width: '48.5%'
  },
  featureIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 44
  },
  featureTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.xs
  },
  featureText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  cardStack: {
    gap: spacing.sm
  },
  phraseCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md
  },
  nepaliText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    minWidth: 78
  },
  phraseInfo: {
    flex: 1
  },
  phraseEnglish: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  phraseRoman: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2
  },
  phraseTip: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3
  },
  playButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36
  },
  gestureBox: {
    backgroundColor: colors.surface2,
    borderColor: 'rgba(245,166,35,0.24)',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.md
  },
  gestureLabel: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
    textTransform: 'uppercase'
  },
  gestureText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  pricePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md
  },
  pricePanelHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm
  },
  pricePanelTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase'
  },
  priceRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm
  },
  priceInfo: {
    flex: 1,
    paddingRight: spacing.md
  },
  priceName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  priceNote: {
    color: colors.dim,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2
  },
  priceRight: {
    alignItems: 'flex-end'
  },
  priceValue: {
    color: colors.teal,
    fontSize: 13,
    fontWeight: '800'
  },
  priceBadge: {
    borderRadius: 7,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  badgeGood: {
    backgroundColor: 'rgba(62,207,178,0.12)',
    color: colors.teal
  },
  badgeWarn: {
    backgroundColor: 'rgba(220,80,80,0.16)',
    color: '#f09595'
  },
  festivalGrid: {
    gap: spacing.sm
  },
  festivalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md
  },
  festivalIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,166,35,0.11)',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 46
  },
  festivalDate: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  festivalName: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 3
  },
  festivalText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs
  },
  cta: {
    backgroundColor: colors.surface2,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.lg
  },
  ctaLabel: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
    textTransform: 'uppercase'
  },
  ctaTitle: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 32
  },
  ctaText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing.sm
  }
});
