import { useState } from 'react';
import { Alert, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YatriLogo } from '../components/YatriLogo';
import { colors, fonts, spacing } from '../theme';
import {
  discoverItems,
  districtBriefings,
  etiquetteCards,
  festivals,
  filterChips,
  foodCards,
  offlinePacks,
  phrases,
  priceTools,
  quickActions,
  scamAlerts,
  trailAlerts,
  trailUpdates,
  type DiscoverItem,
  type Festival,
  type IconName,
  type OfflinePack,
  type ScamAlert,
  type TravelMode
} from '../data/yatriData';

const modeConfig = {
  culture: {
    label: 'Heritage',
    title: 'Culture mode',
    accent: colors.terracotta,
    secondary: colors.marigold,
    image: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?auto=format&fit=crop&w=1400&q=80',
    summary: 'Festivals, temple etiquette, local food, and phrase help for moving respectfully.'
  },
  adventure: {
    label: 'Nature',
    title: 'Adventure mode',
    accent: colors.mountainBlue,
    secondary: colors.forest,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1400&q=80',
    summary: 'Trail alerts, weather awareness, altitude reminders, and scenic discovery.'
  }
};

const activeMode: TravelMode = 'adventure';
const active = modeConfig[activeMode];

export function YatriDashboardScreen() {
  const selectedDiscover = discoverItems.filter((item) => item.mode === activeMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <YatriLogo compact />
          <View style={styles.exchangePill}>
            <Text style={styles.exchangeLabel}>USD</Text>
            <Text style={styles.exchangeValue}>Rs. 133.4</Text>
          </View>
        </View>

        <ImageBackground source={{ uri: active.image }} style={styles.hero} imageStyle={styles.heroImage}>
          <LinearGradient
            colors={['rgba(7,6,15,0.05)', 'rgba(7,6,15,0.38)', 'rgba(7,6,15,0.94)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroTop}>
            <Text style={styles.greeting}>Namaste, traveler</Text>
            <Text style={styles.location}>Kathmandu ready - offline packs active</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.modeBadge, { color: active.secondary }]}>{active.label}</Text>
            <Text style={styles.heroTitle}>Yatri helps you move through Nepal with confidence.</Text>
            <Text style={styles.heroText}>{active.summary}</Text>
          </View>
        </ImageBackground>

        <View style={styles.modeSwitch}>
          <ModeButton mode="culture" selected={activeMode === 'culture'} />
          <ModeButton mode="adventure" selected={activeMode === 'adventure'} />
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <Pressable key={action.title} style={styles.quickAction}>
              <View style={[styles.quickIcon, { backgroundColor: `${action.accent}22` }]}>
                <Ionicons name={action.icon} size={22} color={action.accent} />
              </View>
              <Text style={styles.quickTitle}>{action.title}</Text>
              <Text style={styles.quickSub}>{action.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeader label="Know before you go" title="Choose your district" />
        <DistrictBriefingSelector />

        <SectionHeader label="Offline-first" title="Download before you lose signal" />
        <View style={styles.stack}>
          {offlinePacks.map((pack) => (
            <OfflinePackCard key={pack.title} pack={pack} />
          ))}
        </View>

        <SectionHeader label="Happening soon" title="Festivals near you" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {festivals.map((festival) => (
            <FestivalPhotoCard key={festival.name} festival={festival} />
          ))}
        </ScrollView>

        <SectionHeader label="Discover Nepal" title="Mountain trails or cultural wonders" />
        <View style={styles.filterWrap}>
          {filterChips.map((chip) => (
            <Text key={chip} style={styles.filterChip}>{chip}</Text>
          ))}
        </View>
        <View style={styles.stack}>
          {selectedDiscover.map((item) => (
            <DiscoverCard key={item.title} item={item} />
          ))}
        </View>

        <SectionHeader label="Trail safety" title="Altitude, weather, and live updates" />
        <View style={styles.stack}>
          {trailAlerts.map((alert) => (
            <AlertCard key={alert.title} alert={alert} />
          ))}
        </View>
        <SectionHeader label="Altitude safety" title="Daily symptom check-in" />
        <AltitudeTracker />

        <View style={styles.mapPanel}>
          <View>
            <Text style={styles.mapTitle}>Offline vector map preview</Text>
            <Text style={styles.mapText}>Trails, water, teahouses, checkpoints</Text>
          </View>
          <Pressable style={styles.navigateButton}>
            <Ionicons name="navigate-outline" size={16} color="#1a0f00" />
            <Text style={styles.navigateText}>Navigate</Text>
          </Pressable>
        </View>
        <View style={styles.stack}>
          {trailUpdates.map((update) => (
            <View key={update.route} style={styles.updateRow}>
              <View style={styles.updateDot} />
              <View style={styles.updateTextWrap}>
                <Text style={styles.updateRoute}>{update.route}</Text>
                <Text style={styles.updateText}>{update.update}</Text>
              </View>
              <Text style={styles.updateTime}>{update.time}</Text>
            </View>
          ))}
        </View>

        <SectionHeader label="Traveler safety" title="Live scam alert map" />
        <ScamAlertMap />

        <SectionHeader label="Local insight" title="Ask a verified local" />
        <AskALocalChat />

        <SectionHeader label="Speak and behave well" title="Phrasebook plus etiquette" />
        <View style={styles.namasteCard}>
          <View style={styles.namasteAnimation}>
            <View style={styles.palmLeft} />
            <View style={styles.palmRight} />
          </View>
          <View style={styles.namasteCopy}>
            <Text style={styles.namasteTitle}>Namaste gesture coach</Text>
            <Text style={styles.namasteText}>Palms together, slight bow, calm smile. Audio and looping motion slot are ready for the next build.</Text>
          </View>
          <View style={styles.playButton}>
            <Ionicons name="volume-medium-outline" size={18} color={colors.gold} />
          </View>
        </View>
        <View style={styles.stack}>
          {phrases.map((phrase) => (
            <View key={phrase.roman} style={styles.phraseCard}>
              <Text style={styles.phraseNepali}>{phrase.nepali}</Text>
              <View style={styles.flex}>
                <Text style={styles.phraseEnglish}>{phrase.english}</Text>
                <Text style={styles.phraseTip}>{phrase.roman} - {phrase.tip}</Text>
              </View>
            </View>
          ))}
          {etiquetteCards.map((card) => (
            <InfoCard key={card.context} icon={card.icon} title={card.context} body={`${card.rule} ${card.detail}`} />
          ))}
        </View>

        <SectionHeader label="Smart tools" title="Fair price, food decoder, and SOS" />
        <View style={styles.stack}>
          {priceTools.map((tool) => (
            <View key={tool.item} style={styles.priceTool}>
              <View>
                <Text style={styles.priceToolItem}>{tool.item}</Text>
                <Text style={styles.priceToolNote}>{tool.note}</Text>
              </View>
              <View style={styles.priceRangeBox}>
                <Text style={styles.priceRange}>{tool.range}</Text>
                <Text style={styles.pricePhrase}>{tool.phrase}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.foodGrid}>
          {foodCards.map((food) => (
            <View key={food.dish} style={styles.foodCard}>
              <Text style={styles.foodRegion}>{food.region}</Text>
              <Text style={styles.foodDish}>{food.dish}</Text>
              <Text style={styles.foodText}>{food.flavors}</Text>
              <Text style={styles.foodTip}>{food.orderTip}</Text>
            </View>
          ))}
        </View>
        <OfflineSos />
      </ScrollView>
    </SafeAreaView>
  );
}

function DistrictBriefingSelector() {
  const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
  const activeDistrict = districtBriefings.find((item) => item.district === selectedDistrict)!;
  const connectivityColor = activeDistrict.connectivity === 'Strong'
    ? colors.teal
    : activeDistrict.connectivity === 'Mixed'
      ? colors.gold
      : colors.danger;

  return (
    <View style={styles.districtFeature}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.districtTabs}>
        {districtBriefings.map((item) => {
          const selected = item.district === selectedDistrict;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.district}
              onPress={() => setSelectedDistrict(item.district)}
              style={[styles.districtTab, selected && styles.districtTabSelected]}
            >
              <Ionicons name={item.icon} size={16} color={selected ? '#1a0f00' : colors.muted} />
              <Text style={[styles.districtTabText, selected && styles.districtTabTextSelected]}>{item.district}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.districtBriefing}>
        <View style={styles.districtHeading}>
          <View style={styles.districtIcon}>
            <Ionicons name={activeDistrict.icon} size={24} color={colors.goldLight} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.districtName}>{activeDistrict.district}</Text>
            <Text style={styles.districtProvince}>{activeDistrict.province}</Text>
          </View>
          <View style={styles.districtOfflineBadge}>
            <Ionicons name="cloud-done-outline" size={14} color={colors.teal} />
            <Text style={styles.districtOfflineText}>OFFLINE</Text>
          </View>
        </View>

        <View style={styles.districtFacts}>
          <View style={styles.districtFact}>
            <Text style={styles.districtFactLabel}>BEST BASE</Text>
            <Text style={styles.districtFactValue}>{activeDistrict.base}</Text>
          </View>
          <View style={styles.districtFact}>
            <Text style={styles.districtFactLabel}>ELEVATION</Text>
            <Text style={styles.districtFactValue}>{activeDistrict.elevation}</Text>
          </View>
          <View style={styles.districtFact}>
            <Text style={styles.districtFactLabel}>SIGNAL</Text>
            <Text style={[styles.districtFactValue, { color: connectivityColor }]}>{activeDistrict.connectivity}</Text>
          </View>
        </View>

        <View style={styles.districtBestFor}>
          <Ionicons name="sparkles-outline" size={16} color={colors.gold} />
          <Text style={styles.districtBestForText}>{activeDistrict.bestFor}</Text>
        </View>

        <DistrictInfoRow icon="bus-outline" label="Getting around" text={activeDistrict.transport} />
        <DistrictInfoRow icon="people-outline" label="Local respect" text={activeDistrict.etiquette} />
        <DistrictInfoRow icon="shield-checkmark-outline" label="Safety note" text={activeDistrict.safety} last />
      </View>
    </View>
  );
}

function DistrictInfoRow({ icon, label, text, last = false }: { icon: IconName; label: string; text: string; last?: boolean }) {
  return (
    <View style={[styles.districtInfoRow, last && styles.districtInfoRowLast]}>
      <Ionicons name={icon} size={18} color={colors.mountainBlue} />
      <View style={styles.flex}>
        <Text style={styles.districtInfoLabel}>{label}</Text>
        <Text style={styles.districtInfoText}>{text}</Text>
      </View>
    </View>
  );
}

function ModeButton({ mode, selected }: { mode: TravelMode; selected: boolean }) {
  const config = modeConfig[mode];
  return (
    <Pressable style={[styles.modeButton, selected && { backgroundColor: `${config.accent}24`, borderColor: config.accent }]}>
      <Text style={[styles.modeButtonText, selected && { color: config.secondary }]}>{config.title}</Text>
    </Pressable>
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

function OfflinePackCard({ pack }: { pack: OfflinePack }) {
  return (
    <View style={styles.offlineCard}>
      <View style={styles.offlineIcon}><Ionicons name={pack.icon} size={22} color={colors.gold} /></View>
      <View style={styles.flex}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{pack.title}</Text>
          <Text style={styles.packSize}>{pack.size}</Text>
        </View>
        <Text style={styles.cardText}>{pack.description}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pack.progress * 100}%` }]} />
        </View>
        <Text style={styles.packStatus}>{pack.status}</Text>
      </View>
    </View>
  );
}

function FestivalPhotoCard({ festival }: { festival: Festival }) {
  return (
    <ImageBackground source={{ uri: festival.image }} style={styles.festivalPhoto} imageStyle={styles.festivalImage}>
      <LinearGradient colors={['rgba(7,6,15,0.08)', 'rgba(7,6,15,0.86)']} style={styles.photoGradient} />
      <Text style={[styles.countdown, { backgroundColor: festival.accent }]}>{festival.countdown}</Text>
      <View style={styles.festivalCopy}>
        <Text style={styles.festivalCrowd}>{festival.crowd}</Text>
        <Text style={styles.festivalName}>{festival.name}</Text>
        <Text style={styles.festivalWhy}>{festival.why}</Text>
      </View>
    </ImageBackground>
  );
}

function DiscoverCard({ item }: { item: DiscoverItem }) {
  return (
    <ImageBackground source={{ uri: item.image }} style={styles.discoverCard} imageStyle={styles.discoverImage}>
      <LinearGradient colors={['rgba(7,6,15,0.10)', 'rgba(7,6,15,0.90)']} style={styles.photoGradient} />
      <View style={styles.discoverCopy}>
        <Text style={styles.discoverTag}>{item.tag}</Text>
        <Text style={styles.discoverTitle}>{item.title}</Text>
        <Text style={styles.discoverLocation}>{item.location}</Text>
        <Text style={styles.discoverSummary}>{item.summary}</Text>
        <Text style={styles.discoverMeta}>{item.meta}</Text>
      </View>
    </ImageBackground>
  );
}

function AlertCard({ alert }: { alert: { title: string; location: string; status: string; detail: string; icon: IconName; urgent?: boolean } }) {
  return (
    <View style={[styles.alertCard, alert.urgent && styles.alertUrgent]}>
      <View style={[styles.alertIcon, alert.urgent && { backgroundColor: 'rgba(255,93,108,0.18)' }]}>
        <Ionicons name={alert.icon} size={22} color={alert.urgent ? colors.danger : colors.mountainBlue} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.alertStatus}>{alert.status}</Text>
        <Text style={styles.cardTitle}>{alert.title} - {alert.location}</Text>
        <Text style={styles.cardText}>{alert.detail}</Text>
      </View>
    </View>
  );
}

function scamRiskColor(risk: ScamAlert['risk']) {
  if (risk === 'High') return colors.danger;
  if (risk === 'Medium') return colors.gold;
  return colors.teal;
}

function ScamAlertMap() {
  const totalReports = scamAlerts.reduce((total, alert) => total + alert.reportCount, 0);

  return (
    <>
      <View style={styles.scamMap}>
        <View style={styles.mapLiveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>LIVE COMMUNITY REPORTS</Text>
          <Text style={styles.liveCount}>{totalReports} nearby</Text>
        </View>
        <View style={[styles.mapRoad, styles.mapRoadOne]} />
        <View style={[styles.mapRoad, styles.mapRoadTwo]} />
        <View style={[styles.mapRoad, styles.mapRoadThree]} />
        <Text style={[styles.mapPlace, styles.mapPlaceThamel]}>Thamel</Text>
        <Text style={[styles.mapPlace, styles.mapPlaceDurbar]}>Durbar Square</Text>
        <Text style={[styles.mapPlace, styles.mapPlaceAirport]}>Airport</Text>
        {scamAlerts.map((alert) => {
          const riskColor = scamRiskColor(alert.risk);
          return (
            <View
              key={alert.title}
              style={[styles.scamPin, { backgroundColor: riskColor, borderColor: colors.white, left: alert.left, top: alert.top }]}
            >
              <Text style={styles.scamPinCount}>{alert.reportCount}</Text>
            </View>
          );
        })}
        <View style={styles.currentLocation}>
          <Ionicons name="navigate" size={13} color={colors.white} />
        </View>
      </View>

      <View style={styles.scamLegend}>
        {(['High', 'Medium', 'Low'] as ScamAlert['risk'][]).map((risk) => (
          <View key={risk} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: scamRiskColor(risk) }]} />
            <Text style={styles.legendText}>{risk} activity</Text>
          </View>
        ))}
      </View>

      <View style={styles.stack}>
        {scamAlerts.map((alert) => (
          <View key={alert.location} style={styles.scamAlertRow}>
            <View style={[styles.scamAlertIcon, { backgroundColor: `${scamRiskColor(alert.risk)}1f` }]}>
              <Ionicons name="warning-outline" size={19} color={scamRiskColor(alert.risk)} />
            </View>
            <View style={styles.flex}>
              <View style={styles.rowBetween}>
                <Text style={styles.scamAlertTitle}>{alert.title}</Text>
                <Text style={styles.scamAlertTime}>{alert.time}</Text>
              </View>
              <Text style={styles.scamAlertLocation}>{alert.location} · {alert.reportCount} reports</Text>
              <Text style={styles.cardText}>{alert.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.reportScamButton}>
        <Ionicons name="add-circle-outline" size={19} color="#1a0f00" />
        <Text style={styles.reportScamText}>Report suspicious activity</Text>
      </Pressable>
    </>
  );
}

type LocalMessage = {
  id: number;
  sender: 'traveler' | 'guide';
  text: string;
};

function AskALocalChat() {
  const [draft, setDraft] = useState('');
  const [selectedTip, setSelectedTip] = useState(100);
  const [messages, setMessages] = useState<LocalMessage[]>([
    { id: 1, sender: 'traveler', text: 'Is Rs. 900 fair for a taxi from Thamel to Boudha?' },
    { id: 2, sender: 'guide', text: 'That is high for normal traffic. Ask for the meter or compare Pathao before agreeing.' }
  ]);
  const quickQuestions = ['Is this taxi price fair?', 'Can I enter this temple?', 'Is this guide licensed?'];

  const sendQuestion = () => {
    const question = draft.trim();
    if (!question) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: 'traveler', text: question },
      {
        id: Date.now() + 1,
        sender: 'guide',
        text: 'I have your question. For this prototype, a verified local reply appears here when the guide responds.'
      }
    ]);
    setDraft('');
  };

  return (
    <View style={styles.localChat}>
      <View style={styles.guideHeader}>
        <View style={styles.guideAvatar}>
          <Text style={styles.guideInitials}>AS</Text>
          <View style={styles.guideOnlineDot} />
        </View>
        <View style={styles.flex}>
          <View style={styles.guideNameRow}>
            <Text style={styles.guideName}>Asha Shrestha</Text>
            <Ionicons name="checkmark-circle" size={16} color={colors.teal} />
          </View>
          <Text style={styles.guideMeta}>Verified Kathmandu guide · Nepali / English</Text>
        </View>
        <View style={styles.liveGuideBadge}>
          <View style={styles.liveGuideDot} />
          <Text style={styles.liveGuideText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.chatMessages}>
        {messages.slice(-4).map((message) => (
          <View
            key={message.id}
            style={[
              styles.chatBubble,
              message.sender === 'traveler' ? styles.travelerBubble : styles.guideBubble
            ]}
          >
            {message.sender === 'guide' && (
              <Text style={styles.messageSender}>ASHA · VERIFIED LOCAL</Text>
            )}
            <Text style={styles.chatText}>{message.text}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickQuestionList}>
        {quickQuestions.map((question) => (
          <Pressable key={question} onPress={() => setDraft(question)} style={styles.quickQuestion}>
            <Text style={styles.quickQuestionText}>{question}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.chatComposer}>
        <TextInput
          accessibilityLabel="Question for a local guide"
          onChangeText={setDraft}
          onSubmitEditing={sendQuestion}
          placeholder="Ask a quick question..."
          placeholderTextColor={colors.dim}
          returnKeyType="send"
          style={styles.chatInput}
          value={draft}
        />
        <Pressable
          accessibilityLabel="Send question"
          accessibilityRole="button"
          onPress={sendQuestion}
          style={styles.chatSendButton}
        >
          <Ionicons name="send" size={18} color="#1a0f00" />
        </Pressable>
      </View>

      <View style={styles.tipRow}>
        <View style={styles.tipLabelWrap}>
          <Ionicons name="heart-outline" size={17} color={colors.gold} />
          <Text style={styles.tipLabel}>Thank your guide</Text>
        </View>
        {[50, 100, 200].map((tip) => (
          <Pressable
            key={tip}
            onPress={() => setSelectedTip(tip)}
            style={[styles.tipChip, selectedTip === tip && styles.tipChipSelected]}
          >
            <Text style={[styles.tipChipText, selectedTip === tip && styles.tipChipTextSelected]}>Rs. {tip}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AltitudeTracker() {
  const symptoms = [
    { id: 'headache', label: 'Headache', icon: 'flash-outline' as IconName, weight: 1 },
    { id: 'nausea', label: 'Nausea', icon: 'water-outline' as IconName, weight: 1 },
    { id: 'dizziness', label: 'Dizziness', icon: 'sync-outline' as IconName, weight: 1 },
    { id: 'fatigue', label: 'Unusual fatigue', icon: 'battery-half-outline' as IconName, weight: 1 },
    { id: 'breathlessness', label: 'Breathless at rest', icon: 'pulse-outline' as IconName, weight: 3 },
    { id: 'coordination', label: 'Confused or unsteady', icon: 'warning-outline' as IconName, weight: 3 }
  ];
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const previousScore = 1;
  const score = symptoms.reduce((total, symptom) => total + (selected.includes(symptom.id) ? symptom.weight : 0), 0);
  const urgent = selected.includes('breathlessness') || selected.includes('coordination');
  const worsening = score > previousScore;

  const toggleSymptom = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setSubmitted(false);
  };

  const guidance = urgent
    ? { label: 'DESCEND NOW', detail: 'A serious warning sign is selected. Descend, seek medical help, and do not continue upward.', color: colors.danger, icon: 'alert-circle' as IconName }
    : score > 0
      ? { label: 'DO NOT ASCEND', detail: 'Rest at this altitude. Only continue higher after symptoms have fully resolved.', color: colors.gold, icon: 'pause-circle' as IconName }
      : { label: 'NO SYMPTOMS LOGGED', detail: 'Continue monitoring. A clear check-in does not guarantee acclimatization.', color: colors.teal, icon: 'checkmark-circle' as IconName };

  return (
    <View style={styles.altitudePanel}>
      <View style={styles.altitudeHeader}>
        <View>
          <Text style={styles.altitudeLabel}>CURRENT SLEEPING ALTITUDE</Text>
          <Text style={styles.altitudeValue}>3,440 m</Text>
          <Text style={styles.altitudePlace}>Namche Bazaar · Day 3</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>TODAY'S SCORE</Text>
        </View>
      </View>

      <Text style={styles.symptomPrompt}>How do you feel right now?</Text>
      <View style={styles.symptomGrid}>
        {symptoms.map((symptom) => {
          const active = selected.includes(symptom.id);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              key={symptom.id}
              onPress={() => toggleSymptom(symptom.id)}
              style={[styles.symptomButton, active && styles.symptomButtonActive]}
            >
              <Ionicons name={symptom.icon} size={18} color={active ? colors.white : colors.muted} />
              <Text style={[styles.symptomText, active && styles.symptomTextActive]}>{symptom.label}</Text>
              <Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={17} color={active ? colors.danger : colors.dim} />
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.altitudeGuidance, { borderColor: `${guidance.color}55` }]}>
        <Ionicons name={guidance.icon} size={24} color={guidance.color} />
        <View style={styles.flex}>
          <Text style={[styles.guidanceLabel, { color: guidance.color }]}>{guidance.label}</Text>
          <Text style={styles.guidanceText}>{guidance.detail}</Text>
        </View>
      </View>

      {submitted && (
        <View style={styles.checkInSaved}>
          <Ionicons name="cloud-done-outline" size={17} color={colors.teal} />
          <Text style={styles.checkInSavedText}>
            Saved offline · {worsening ? `Score worsened by ${score - previousScore} since yesterday` : 'No worsening since yesterday'}
          </Text>
        </View>
      )}

      <Pressable onPress={() => setSubmitted(true)} style={styles.checkInButton}>
        <Ionicons name="save-outline" size={18} color="#1a0f00" />
        <Text style={styles.checkInButtonText}>Save today's check-in</Text>
      </Pressable>
      <Text style={styles.medicalDisclaimer}>This tracker cannot diagnose altitude illness. When in doubt, stop ascending and seek medical help.</Text>
    </View>
  );
}

function OfflineSos() {
  const coordinates = '27.7172 N, 85.3240 E';
  const message = `SOS: I need help. My last saved GPS location is ${coordinates}. Map: https://maps.google.com/?q=27.7172,85.3240`;

  const prepareSms = () => {
    Alert.alert(
      'Prepare emergency SMS?',
      'Your location will open in Messages. Choose your saved embassy or trusted contact, then send.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Messages',
          onPress: () => {
            Linking.openURL(`sms:?body=${encodeURIComponent(message)}`).catch(() => {
              Alert.alert('Messages unavailable', 'Copy the GPS coordinates shown here and send them by SMS.');
            });
          }
        }
      ]
    );
  };

  const callTouristPolice = () => {
    Linking.openURL('tel:1144').catch(() => {
      Alert.alert('Calling unavailable', 'Dial 1144 for Nepal Tourist Police.');
    });
  };

  return (
    <View style={styles.sosPanel}>
      <View style={styles.sosHeader}>
        <View style={styles.sosIcon}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.white} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.sosTitle}>Offline GPS SOS</Text>
          <Text style={styles.sosText}>Uses your last saved location and the phone network. Mobile data is not required.</Text>
        </View>
        <View style={styles.offlineBadge}>
          <View style={styles.offlineStatusDot} />
          <Text style={styles.offlineBadgeText}>READY</Text>
        </View>
      </View>

      <View style={styles.gpsFix}>
        <Ionicons name="location" size={20} color={colors.danger} />
        <View style={styles.flex}>
          <Text style={styles.gpsLabel}>LAST GPS FIX · 2 MIN AGO</Text>
          <Text style={styles.gpsCoordinates}>{coordinates}</Text>
          <Text style={styles.gpsArea}>Kathmandu, Bagmati Province</Text>
        </View>
      </View>

      <View style={styles.sosRecipients}>
        <View style={styles.recipientRow}>
          <Ionicons name="business-outline" size={17} color={colors.goldLight} />
          <Text style={styles.recipientText}>Embassy contact</Text>
          <Text style={styles.recipientStatus}>Choose in Messages</Text>
        </View>
        <View style={styles.recipientRow}>
          <Ionicons name="person-outline" size={17} color={colors.teal} />
          <Text style={styles.recipientText}>Trusted contact</Text>
          <Text style={styles.recipientStatus}>Choose in Messages</Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel="Prepare emergency location SMS"
        accessibilityRole="button"
        onPress={prepareSms}
        style={({ pressed }) => [styles.sosButton, pressed && styles.buttonPressed]}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.white} />
        <Text style={styles.sosButtonText}>Prepare location SMS</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="Call Nepal Tourist Police at 1144"
        accessibilityRole="button"
        onPress={callTouristPolice}
        style={styles.policeCallButton}
      >
        <Ionicons name="call-outline" size={17} color={colors.danger} />
        <Text style={styles.policeCallText}>Call Tourist Police · 1144</Text>
      </Pressable>
    </View>
  );
}

function InfoCard({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.infoCard}>
      <Ionicons name={icon} size={20} color={colors.gold} />
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 48 },
  nav: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  exchangePill: { alignItems: 'flex-end', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  exchangeLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  exchangeValue: { color: colors.teal, fontFamily: fonts.accent, fontSize: 13, fontWeight: '800', marginTop: 2 },
  hero: { height: 500, justifyContent: 'space-between', overflow: 'hidden' },
  heroImage: { borderRadius: 22 },
  heroGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
  heroTop: { padding: spacing.lg },
  greeting: { color: colors.white, fontFamily: fonts.display, fontSize: 21, fontWeight: '700' },
  location: { color: 'rgba(255,255,255,0.68)', fontFamily: fonts.label, fontSize: 11, marginTop: 4 },
  heroCopy: { padding: spacing.lg },
  modeBadge: { fontFamily: fonts.label, fontSize: 11, fontWeight: '900', letterSpacing: 2.2, marginBottom: spacing.sm, textTransform: 'uppercase' },
  heroTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 42, fontWeight: '700', lineHeight: 46, maxWidth: 410 },
  heroText: { color: 'rgba(255,255,255,0.74)', fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: spacing.md, maxWidth: 380 },
  modeSwitch: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, padding: 6 },
  modeButton: { alignItems: 'center', borderColor: 'transparent', borderRadius: 13, borderWidth: 1, flex: 1, paddingVertical: 11 },
  modeButtonText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  quickAction: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, minHeight: 126, padding: spacing.md, width: '48.5%' },
  quickIcon: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', marginBottom: spacing.sm, width: 44 },
  quickTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  quickSub: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 4, textAlign: 'center' },
  districtFeature: { gap: spacing.sm },
  districtTabs: { gap: spacing.xs, paddingRight: spacing.md },
  districtTab: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 40, paddingHorizontal: 12 },
  districtTabSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  districtTabText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  districtTabTextSelected: { color: '#1a0f00' },
  districtBriefing: { backgroundColor: colors.surface, borderColor: 'rgba(245,166,35,0.28)', borderRadius: 18, borderWidth: 1, overflow: 'hidden', padding: spacing.md },
  districtHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  districtIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 16, height: 46, justifyContent: 'center', width: 46 },
  districtName: { color: colors.text, fontFamily: fonts.display, fontSize: 22, fontWeight: '700' },
  districtProvince: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  districtOfflineBadge: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.10)', borderRadius: 10, flexDirection: 'row', gap: 4, paddingHorizontal: 7, paddingVertical: 5 },
  districtOfflineText: { color: colors.teal, fontFamily: fonts.label, fontSize: 8, fontWeight: '900' },
  districtFacts: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', paddingVertical: spacing.md },
  districtFact: { flex: 1, paddingRight: spacing.xs },
  districtFactLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 8, fontWeight: '900' },
  districtFactValue: { color: colors.text, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900', lineHeight: 15, marginTop: 4 },
  districtBestFor: { alignItems: 'center', flexDirection: 'row', gap: 7, paddingVertical: spacing.md },
  districtBestForText: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 12, fontWeight: '800' },
  districtInfoRow: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  districtInfoRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  districtInfoLabel: { color: colors.text, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  districtInfoText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginTop: 3 },
  sectionHeader: { marginBottom: spacing.md, marginTop: spacing.xl },
  sectionLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginBottom: spacing.xs, textTransform: 'uppercase' },
  sectionTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 30, fontWeight: '700', lineHeight: 35 },
  stack: { gap: spacing.sm },
  flex: { flex: 1 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  offlineCard: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  offlineIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 15, height: 46, justifyContent: 'center', width: 46 },
  cardTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 14, fontWeight: '900' },
  cardText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  packSize: { color: colors.dim, fontFamily: fonts.label, fontSize: 11, fontWeight: '800' },
  progressTrack: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 7, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.gold, borderRadius: 99, height: 7 },
  packStatus: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 11, fontWeight: '800', marginTop: 6 },
  horizontalList: { gap: spacing.md, paddingRight: spacing.md },
  festivalPhoto: { height: 286, overflow: 'hidden', width: 256 },
  festivalImage: { borderRadius: 18 },
  photoGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 18 },
  countdown: { alignSelf: 'flex-start', borderRadius: 12, color: colors.white, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', margin: spacing.md, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  festivalCopy: { bottom: 0, left: 0, padding: spacing.md, position: 'absolute', right: 0 },
  festivalCrowd: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  festivalName: { color: colors.white, fontFamily: fonts.display, fontSize: 27, fontWeight: '700', marginTop: 4 },
  festivalWhy: { color: 'rgba(255,255,255,0.72)', fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  filterChip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, color: colors.muted, fontFamily: fonts.accent, fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 8 },
  discoverCard: { height: 260, justifyContent: 'flex-end', overflow: 'hidden' },
  discoverImage: { borderRadius: 18 },
  discoverCopy: { padding: spacing.md },
  discoverTag: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  discoverTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 30, fontWeight: '700', marginTop: 4 },
  discoverLocation: { color: 'rgba(255,255,255,0.66)', fontFamily: fonts.label, fontSize: 12, marginTop: 2 },
  discoverSummary: { color: 'rgba(255,255,255,0.74)', fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 8 },
  discoverMeta: { color: colors.teal, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900', marginTop: 8 },
  alertCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  alertUrgent: { borderColor: 'rgba(255,93,108,0.35)' },
  alertIcon: { alignItems: 'center', backgroundColor: 'rgba(79,163,217,0.16)', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  alertStatus: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  mapPanel: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: 'rgba(79,163,217,0.30)', borderRadius: 18, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.sm, padding: spacing.md },
  mapTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  mapText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  navigateButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 18, flexDirection: 'row', gap: 5, paddingHorizontal: 12, paddingVertical: 9 },
  navigateText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  updateRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  updateDot: { backgroundColor: colors.forest, borderRadius: 5, height: 10, width: 10 },
  updateTextWrap: { flex: 1 },
  updateRoute: { color: colors.text, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  updateText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 3 },
  updateTime: { color: colors.dim, fontFamily: fonts.label, fontSize: 11, fontWeight: '800' },
  scamMap: { backgroundColor: '#151a24', borderColor: 'rgba(62,207,178,0.28)', borderRadius: 18, borderWidth: 1, height: 300, overflow: 'hidden', position: 'relative' },
  mapLiveRow: { alignItems: 'center', backgroundColor: 'rgba(7,6,15,0.76)', flexDirection: 'row', left: 12, paddingHorizontal: 10, paddingVertical: 7, position: 'absolute', right: 12, top: 12, zIndex: 3 },
  liveDot: { backgroundColor: colors.danger, borderRadius: 5, height: 9, marginRight: 7, width: 9 },
  liveLabel: { color: colors.text, flex: 1, fontFamily: fonts.label, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  liveCount: { color: colors.teal, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  mapRoad: { backgroundColor: 'rgba(255,255,255,0.10)', height: 9, position: 'absolute', width: '115%' },
  mapRoadOne: { left: -20, top: 142, transform: [{ rotate: '-10deg' }] },
  mapRoadTwo: { left: -28, top: 212, transform: [{ rotate: '19deg' }] },
  mapRoadThree: { left: 74, top: 176, transform: [{ rotate: '70deg' }] },
  mapPlace: { color: 'rgba(240,238,248,0.44)', fontFamily: fonts.label, fontSize: 10, fontWeight: '800', position: 'absolute' },
  mapPlaceThamel: { left: '17%', top: '25%' },
  mapPlaceDurbar: { left: '38%', top: '69%' },
  mapPlaceAirport: { right: '9%', top: '62%' },
  scamPin: { alignItems: 'center', borderRadius: 18, borderWidth: 2, height: 36, justifyContent: 'center', marginLeft: -18, marginTop: -18, position: 'absolute', width: 36, zIndex: 2 },
  scamPinCount: { color: colors.white, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  currentLocation: { alignItems: 'center', backgroundColor: colors.mountainBlue, borderColor: colors.white, borderRadius: 15, borderWidth: 2, bottom: 28, height: 30, justifyContent: 'center', left: '53%', position: 'absolute', width: 30 },
  scamLegend: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.sm, marginTop: spacing.sm },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  legendDot: { borderRadius: 4, height: 8, width: 8 },
  legendText: { color: colors.muted, fontFamily: fonts.label, fontSize: 10, fontWeight: '800' },
  scamAlertRow: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  scamAlertIcon: { alignItems: 'center', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  scamAlertTitle: { color: colors.text, flex: 1, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900', paddingRight: spacing.sm },
  scamAlertTime: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '800' },
  scamAlertLocation: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 10, fontWeight: '800', marginTop: 3 },
  reportScamButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.gold, borderRadius: 18, flexDirection: 'row', gap: 7, marginTop: spacing.sm, paddingHorizontal: 14, paddingVertical: 10 },
  reportScamText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  namasteCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm, padding: spacing.md },
  namasteAnimation: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.10)', borderRadius: 28, flexDirection: 'row', height: 56, justifyContent: 'center', width: 56 },
  palmLeft: { backgroundColor: colors.gold, borderRadius: 6, height: 34, transform: [{ rotate: '-24deg' }], width: 10 },
  palmRight: { backgroundColor: colors.goldLight, borderRadius: 6, height: 34, marginLeft: -2, transform: [{ rotate: '24deg' }], width: 10 },
  namasteCopy: { flex: 1 },
  namasteTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 16, fontWeight: '700' },
  namasteText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  playButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 },
  phraseCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  phraseNepali: { color: colors.goldLight, fontFamily: fonts.display, fontSize: 18, fontWeight: '700', minWidth: 86 },
  phraseEnglish: { color: colors.text, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  phraseTip: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 2 },
  infoCard: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  priceTool: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', padding: spacing.md },
  priceToolItem: { color: colors.text, fontFamily: fonts.accent, fontSize: 14, fontWeight: '900' },
  priceToolNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4, maxWidth: 280 },
  priceRangeBox: { alignItems: 'flex-end' },
  priceRange: { color: colors.teal, fontFamily: fonts.label, fontSize: 14, fontWeight: '900' },
  pricePhrase: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 11, fontWeight: '800', marginTop: 4 },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  foodCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, padding: spacing.md, width: '48.5%' },
  foodRegion: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  foodDish: { color: colors.text, fontFamily: fonts.display, fontSize: 21, fontWeight: '700', marginTop: 4 },
  foodText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 6 },
  foodTip: { color: colors.dim, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 8 },
  localChat: { backgroundColor: colors.surface, borderColor: 'rgba(62,207,178,0.28)', borderRadius: 18, borderWidth: 1, gap: spacing.md, overflow: 'hidden', padding: spacing.md },
  guideHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  guideAvatar: { alignItems: 'center', backgroundColor: colors.terracotta, borderRadius: 21, height: 42, justifyContent: 'center', position: 'relative', width: 42 },
  guideInitials: { color: colors.white, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  guideOnlineDot: { backgroundColor: colors.teal, borderColor: colors.surface, borderRadius: 6, borderWidth: 2, bottom: -1, height: 12, position: 'absolute', right: -1, width: 12 },
  guideNameRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  guideName: { color: colors.text, fontFamily: fonts.accent, fontSize: 14, fontWeight: '900' },
  guideMeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  liveGuideBadge: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.12)', borderRadius: 10, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  liveGuideDot: { backgroundColor: colors.teal, borderRadius: 4, height: 7, width: 7 },
  liveGuideText: { color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  chatMessages: { gap: spacing.sm },
  chatBubble: { borderRadius: 14, maxWidth: '88%', paddingHorizontal: 12, paddingVertical: 10 },
  travelerBubble: { alignSelf: 'flex-end', backgroundColor: colors.mountainBlue },
  guideBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface2, borderColor: colors.border, borderWidth: 1 },
  messageSender: { color: colors.teal, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', marginBottom: 4 },
  chatText: { color: colors.white, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  quickQuestionList: { gap: spacing.xs, paddingRight: spacing.sm },
  quickQuestion: { backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  quickQuestionText: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, fontWeight: '700' },
  chatComposer: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', minHeight: 48, paddingLeft: 12, paddingRight: 5 },
  chatInput: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 12, minHeight: 44, paddingVertical: 8 },
  chatSendButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  tipRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  tipLabelWrap: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 6 },
  tipLabel: { color: colors.muted, fontFamily: fonts.accent, fontSize: 11, fontWeight: '800' },
  tipChip: { borderColor: colors.border, borderRadius: 11, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 },
  tipChipSelected: { backgroundColor: 'rgba(245,166,35,0.14)', borderColor: colors.gold },
  tipChipText: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  tipChipTextSelected: { color: colors.goldLight },
  altitudePanel: { backgroundColor: colors.surface, borderColor: 'rgba(79,163,217,0.30)', borderRadius: 18, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  altitudeHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  altitudeLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  altitudeValue: { color: colors.white, fontFamily: fonts.display, fontSize: 31, fontWeight: '700', marginTop: 2 },
  altitudePlace: { color: colors.mountainBlue, fontFamily: fonts.label, fontSize: 11, fontWeight: '800', marginTop: 2 },
  scoreBox: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 14, borderWidth: 1, minWidth: 82, paddingHorizontal: 12, paddingVertical: 9 },
  scoreValue: { color: colors.goldLight, fontFamily: fonts.display, fontSize: 26, fontWeight: '700' },
  scoreLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', marginTop: 1 },
  symptomPrompt: { color: colors.text, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  symptomButton: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 7, minHeight: 45, paddingHorizontal: 10, width: '48.5%' },
  symptomButtonActive: { backgroundColor: 'rgba(255,93,108,0.14)', borderColor: 'rgba(255,93,108,0.50)' },
  symptomText: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 11, fontWeight: '700' },
  symptomTextActive: { color: colors.white },
  altitudeGuidance: { alignItems: 'flex-start', backgroundColor: 'rgba(7,6,15,0.44)', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  guidanceLabel: { fontFamily: fonts.label, fontSize: 10, fontWeight: '900' },
  guidanceText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 3 },
  checkInSaved: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  checkInSavedText: { color: colors.teal, flex: 1, fontFamily: fonts.label, fontSize: 10, fontWeight: '800' },
  checkInButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 15, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 46, paddingHorizontal: 14 },
  checkInButtonText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  medicalDisclaimer: { color: colors.dim, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  sosPanel: { backgroundColor: 'rgba(255,93,108,0.10)', borderColor: 'rgba(255,93,108,0.35)', borderRadius: 18, borderWidth: 1, gap: spacing.md, marginTop: spacing.lg, padding: spacing.md },
  sosHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  sosIcon: { alignItems: 'center', backgroundColor: colors.danger, borderRadius: 16, height: 46, justifyContent: 'center', width: 46 },
  sosTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 21, fontWeight: '700' },
  sosText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  offlineBadge: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.12)', borderColor: 'rgba(62,207,178,0.30)', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  offlineStatusDot: { backgroundColor: colors.teal, borderRadius: 4, height: 7, width: 7 },
  offlineBadgeText: { color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  gpsFix: { alignItems: 'center', backgroundColor: 'rgba(7,6,15,0.46)', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  gpsLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  gpsCoordinates: { color: colors.white, fontFamily: fonts.accent, fontSize: 17, fontWeight: '900', marginTop: 3 },
  gpsArea: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  sosRecipients: { gap: spacing.xs },
  recipientRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minHeight: 30 },
  recipientText: { color: colors.text, flex: 1, fontFamily: fonts.accent, fontSize: 12, fontWeight: '800' },
  recipientStatus: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '800' },
  sosButton: { alignItems: 'center', backgroundColor: colors.danger, borderRadius: 16, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48, paddingHorizontal: 16, paddingVertical: 12 },
  buttonPressed: { opacity: 0.78 },
  sosButtonText: { color: colors.white, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  policeCallButton: { alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 38 },
  policeCallText: { color: colors.danger, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' }
});
