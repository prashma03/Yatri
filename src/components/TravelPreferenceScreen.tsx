import { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TravelerPreferences } from '../auth/localSession';
import { YatriLogo } from './YatriLogo';
import { colors, fonts, spacing } from '../theme';

type TravelPreferenceScreenProps = {
  onComplete: (preferences: TravelerPreferences) => void;
};

type Choice = {
  id: string;
  title: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const travelStyles: Choice[] = [
  { id: 'luxury', title: 'Comfort and luxury', detail: 'Beautiful stays, private transfers, and polished experiences.', icon: 'diamond-outline' },
  { id: 'culture', title: 'Local people and culture', detail: 'Neighborhoods, family traditions, food, and everyday life.', icon: 'people-outline' },
  { id: 'nature', title: 'Nature and adventure', detail: 'Mountain trails, wildlife, lakes, and quiet landscapes.', icon: 'leaf-outline' },
  { id: 'balanced', title: 'A little of everything', detail: 'Mix comfort, culture, and nature as the trip unfolds.', icon: 'options-outline' }
];

const paceChoices: Choice[] = [
  { id: 'relaxed', title: 'Slow and relaxed', detail: 'Fewer stops with more time to settle into each place.', icon: 'cafe-outline' },
  { id: 'flexible', title: 'Flexible days', detail: 'A loose plan with room for local recommendations.', icon: 'git-branch-outline' },
  { id: 'active', title: 'Full and active', detail: 'Early starts, longer days, and plenty of movement.', icon: 'walk-outline' }
];

const interests: Choice[] = [
  { id: 'heritage', title: 'Heritage', detail: 'Temples and historic places', icon: 'business-outline' },
  { id: 'food', title: 'Local food', detail: 'Markets and regional dishes', icon: 'restaurant-outline' },
  { id: 'festivals', title: 'Festivals', detail: 'Ceremonies and celebrations', icon: 'sparkles-outline' },
  { id: 'trekking', title: 'Trekking', detail: 'Trails and mountain villages', icon: 'trail-sign-outline' },
  { id: 'wildlife', title: 'Wildlife', detail: 'Parks, birds, and rivers', icon: 'paw-outline' },
  { id: 'wellness', title: 'Wellness', detail: 'Rest, yoga, and retreats', icon: 'heart-outline' }
];

export function TravelPreferenceScreen({ onComplete }: TravelPreferenceScreenProps) {
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<TravelerPreferences>({ travelStyle: null, pace: null, interests: [] });
  const isLastStep = step === 2;
  const isDesktop = width >= 900;

  const finishOrAdvance = () => {
    if (isLastStep) {
      onComplete(preferences);
    } else {
      setStep((current) => current + 1);
    }
  };

  const selectInterest = (id: string) => {
    setPreferences((current) => ({
      ...current,
      interests: current.interests.includes(id)
        ? current.interests.filter((interest) => interest !== id)
        : [...current.interests, id]
    }));
  };

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?auto=format&fit=crop&w=1600&q=85' }} style={styles.background}>
      <LinearGradient colors={['rgba(7,6,15,0.54)', 'rgba(7,6,15,0.97)']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.topRow, isDesktop && styles.topRowDesktop]}>
          <YatriLogo compact />
          <Pressable accessibilityRole="button" onPress={() => onComplete({ travelStyle: null, pace: null, interests: [] })} style={styles.skipSetupButton}>
            <Text style={styles.skipSetupText}>Skip setup</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]} showsVerticalScrollIndicator={false}>
          <View style={[styles.panel, isDesktop && styles.panelDesktop]}>
            <View style={styles.progressRow}>
              {[0, 1, 2].map((index) => <View key={index} style={[styles.progressSegment, index <= step && styles.progressSegmentActive]} />)}
            </View>
            <Text style={[styles.stepLabel, isDesktop && styles.stepLabelDesktop]}>QUESTION {step + 1} OF 3</Text>
            <Text style={[styles.title, isDesktop && styles.titleDesktop]}>
              {step === 0 ? 'What kind of Nepal trip feels right?' : step === 1 ? 'What pace suits you?' : 'What would you love to experience?'}
            </Text>
            <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>
              {step === 0 ? 'Choose the travel style you want Yatri to prioritize.' : step === 1 ? 'We will tune daily suggestions around your preferred rhythm.' : 'Choose as many as you like. You can change these later.'}
            </Text>

            <View style={[styles.choiceGrid, step === 2 && styles.interestGrid]}>
              {(step === 0 ? travelStyles : step === 1 ? paceChoices : interests).map((choice) => {
                const selected = step === 0
                  ? preferences.travelStyle === choice.id
                  : step === 1
                    ? preferences.pace === choice.id
                    : preferences.interests.includes(choice.id);
                return (
                  <Pressable
                    accessibilityRole={step === 2 ? 'checkbox' : 'radio'}
                    accessibilityState={{ checked: selected }}
                    key={choice.id}
                    onPress={() => {
                      if (step === 0) setPreferences((current) => ({ ...current, travelStyle: choice.id as TravelerPreferences['travelStyle'] }));
                      else if (step === 1) setPreferences((current) => ({ ...current, pace: choice.id as TravelerPreferences['pace'] }));
                      else selectInterest(choice.id);
                    }}
                    style={[styles.choice, isDesktop && styles.choiceDesktop, step === 2 && styles.interestChoice, selected && styles.choiceSelected]}
                  >
                    <View style={[styles.choiceIcon, isDesktop && styles.choiceIconDesktop, selected && styles.choiceIconSelected]}>
                      <Ionicons name={choice.icon} size={isDesktop ? 24 : 20} color={selected ? '#1a0f00' : colors.goldLight} />
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.choiceTitle, isDesktop && styles.choiceTitleDesktop, selected && styles.choiceTitleSelected]}>{choice.title}</Text>
                      <Text style={[styles.choiceDetail, isDesktop && styles.choiceDetailDesktop]}>{choice.detail}</Text>
                    </View>
                    <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={isDesktop ? 24 : 19} color={selected ? colors.teal : colors.dim} />
                  </Pressable>
                );
              })}
            </View>

            <Pressable accessibilityRole="button" onPress={finishOrAdvance} style={[styles.continueButton, isDesktop && styles.continueButtonDesktop]}>
              <Text style={[styles.continueText, isDesktop && styles.continueTextDesktop]}>{isLastStep ? 'Build my Yatri' : 'Continue'}</Text>
              <Ionicons name="arrow-forward" size={isDesktop ? 22 : 18} color="#1a0f00" />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={finishOrAdvance} style={styles.skipQuestionButton}>
              <Text style={[styles.skipQuestionText, isDesktop && styles.skipQuestionTextDesktop]}>Skip this question</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1, padding: spacing.lg },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  topRowDesktop: { alignSelf: 'center', maxWidth: 1040, width: '100%' },
  skipSetupButton: { borderColor: colors.border, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  skipSetupText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  scrollContentDesktop: { paddingVertical: spacing.lg },
  panel: { alignSelf: 'center', backgroundColor: 'rgba(12,10,25,0.95)', borderColor: colors.border, borderRadius: 18, borderWidth: 1, maxWidth: 680, padding: spacing.xl, width: '100%' },
  panelDesktop: { borderRadius: 22, maxWidth: 800, padding: 36 },
  progressRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg },
  progressSegment: { backgroundColor: colors.border, borderRadius: 3, flex: 1, height: 5 },
  progressSegmentActive: { backgroundColor: colors.gold },
  stepLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  stepLabelDesktop: { fontSize: 13, letterSpacing: 2 },
  title: { color: colors.white, fontFamily: fonts.display, fontSize: 34, fontWeight: '700', lineHeight: 40, marginTop: spacing.xs },
  titleDesktop: { fontSize: 46, lineHeight: 52, maxWidth: 620 },
  subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: spacing.sm },
  subtitleDesktop: { fontSize: 17, lineHeight: 26, marginTop: spacing.md },
  choiceGrid: { gap: spacing.sm, marginTop: spacing.lg },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  choice: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 70, padding: spacing.sm },
  choiceDesktop: { borderRadius: 16, gap: spacing.md, minHeight: 88, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  interestChoice: { width: '48.8%' },
  choiceSelected: { backgroundColor: 'rgba(62,207,178,0.10)', borderColor: colors.teal },
  choiceIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  choiceIconDesktop: { borderRadius: 16, height: 54, width: 54 },
  choiceIconSelected: { backgroundColor: colors.gold },
  choiceTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  choiceTitleDesktop: { fontSize: 16 },
  choiceTitleSelected: { color: colors.white },
  choiceDetail: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 2 },
  choiceDetailDesktop: { fontSize: 14, lineHeight: 21, marginTop: 4 },
  continueButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 14, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.lg, minHeight: 50 },
  continueButtonDesktop: { borderRadius: 16, minHeight: 64 },
  continueText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  continueTextDesktop: { fontSize: 16 },
  skipQuestionButton: { alignItems: 'center', justifyContent: 'center', minHeight: 42, marginTop: spacing.xs },
  skipQuestionText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 11, fontWeight: '800' },
  skipQuestionTextDesktop: { fontSize: 13 },
  flex: { flex: 1 }
});
