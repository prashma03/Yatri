import { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as SMS from 'expo-sms';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YatriLogo } from '../components/YatriLogo';
import { Badge, PrayerFlagStrip, premiumSurface, pressableLift } from '../components/PremiumUI';
import { loadTravelPreferences, type TravelerPreferences } from '../auth/localSession';
import { formatCoordinates, formatLocationAge, getForegroundLocation, getSavedLocation, type SavedLocation } from '../services/location';
import {
  deleteCurrentAccount,
  flagSafetyReport,
  getCurrentRole,
  getSavedDistrictPacks,
  listPendingReports,
  listSafetyReports,
  listTrustedContacts,
  moderateReport,
  saveDistrictPack,
  saveTrustedContact,
  submitSafetyReport,
  subscribeToSafetyReports,
  syncPendingReports,
  voteForReport,
  type SafetyReport,
  type TrustedContact
} from '../services/mvpRepository';
import { colors, fonts, spacing } from '../theme';
import { districtSites, type DistrictSite } from '../data/districtSites';
import {
  cultureFacts,
  discoverItems,
  districtBriefings,
  districtDirectory,
  etiquetteCards,
  fairPriceCatalog,
  fairPriceSourceNote,
  festivals,
  festivalContentSource,
  foodCards,
  foodPrices,
  nearbyHotels,
  offlinePacks,
  phrases,
  priceTools,
  quickActions,
  scamAlerts,
  trailAlerts,
  trailUpdates,
  transportPrices,
  type DiscoverItem,
  type DistrictBriefing,
  type FairPriceCategory,
  type FairPriceItem,
  type Festival,
  type IconName,
  type OfflinePack,
  type PriceItem,
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

type DashboardPage = 'home' | 'explore' | 'district' | 'food' | 'safety' | 'local' | 'prices' | 'moderation';
type ConnectivityMode = 'online' | 'offline';
type ExploreFilter = 'All' | 'Nature' | 'Culture' | 'Adventure' | 'Food' | 'Spiritual' | 'Hidden gems';

const dashboardPages: { id: DashboardPage; label: string; icon: IconName; activeIcon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'explore', label: 'Explore', icon: 'compass-outline', activeIcon: 'compass' },
  { id: 'district', label: 'District', icon: 'map-outline', activeIcon: 'map' },
  { id: 'food', label: 'Food', icon: 'restaurant-outline', activeIcon: 'restaurant' },
  { id: 'safety', label: 'Safety', icon: 'shield-outline', activeIcon: 'shield' },
  { id: 'local', label: 'Local', icon: 'people-outline', activeIcon: 'people' },
  { id: 'prices', label: 'Prices', icon: 'pricetag-outline', activeIcon: 'pricetag' }
];

const foodImages = {
  momo: require('../../assets/food/momo.jpg'),
  'dal-bhat': require('../../assets/food/dal-bhat.jpg'),
  'newari-khaja': require('../../assets/food/newari-khaja.jpg'),
  yomari: require('../../assets/food/yomari.jpg'),
  'thakali-set': require('../../assets/food/thakali-set.jpg'),
  thukpa: require('../../assets/food/thukpa.jpg'),
  'sel-roti': require('../../assets/food/sel-roti.jpg'),
  'masala-chiya': require('../../assets/food/masala-chiya.jpg'),
  lassi: require('../../assets/food/lassi.jpg'),
  'juju-dhau': require('../../assets/food/juju-dhau.jpg'),
  kheer: require('../../assets/food/kheer.jpg'),
  'lal-mohan': require('../../assets/food/lal-mohan.jpg')
};

const foodInfo: Record<string, { specialty: string; ingredients: string; allergy: string }> = {
  Momo: {
    specialty: 'Nepal snack staple; best for a quick shared plate.',
    ingredients: 'Wheat wrapper, veg or minced meat filling, tomato-sesame achar',
    allergy: 'Usually wheat; ask about sesame, soy and meat broth.'
  },
  'Dal Bhat': {
    specialty: 'Everyday Nepali meal; reliable filling lunch on travel days.',
    ingredients: 'Rice, lentil soup, seasonal vegetables, greens, achar, optional curry',
    allergy: 'Ask about dairy, ghee and gluten in sides.'
  },
  'Newari Khaja Set': {
    specialty: 'Kathmandu Valley feast plate with many small textures.',
    ingredients: 'Beaten rice, potato, beans, pickles, greens, egg or choila depending on set',
    allergy: 'May include soy, sesame, egg and meat.'
  },
  Yomari: {
    specialty: 'Newari festival sweet, especially loved around Yomari Punhi.',
    ingredients: 'Rice flour shell, chaku molasses, sesame, sometimes khuwa',
    allergy: 'Often sesame; confirm dairy or khuwa filling.'
  },
  'Thakali Set': {
    specialty: 'Polished mountain-style set known for balance and sharp pickles.',
    ingredients: 'Rice, dal, tarkari, gundruk, greens, achar, optional meat curry',
    allergy: 'Ask about dairy, gluten, sesame and meat stock.'
  },
  Thukpa: {
    specialty: 'Cold-weather Himalayan comfort food for mountain towns.',
    ingredients: 'Wheat noodles, broth, vegetables, herbs, optional egg or meat',
    allergy: 'Usually wheat; may contain egg, soy or meat broth.'
  },
  'Sel Roti': {
    specialty: 'Festival ring bread common during Dashain, Tihar and family visits.',
    ingredients: 'Rice flour batter, sugar, ghee or oil, sometimes cardamom',
    allergy: 'Often rice-based; ask about dairy or shared frying oil.'
  },
  'Masala Chiya': {
    specialty: 'Roadside pause drink; great for bus stops and cold mornings.',
    ingredients: 'Black tea, milk, sugar, ginger or cardamom, warming spices',
    allergy: 'Contains milk unless you request black tea.'
  },
  Lassi: {
    specialty: 'Cooling city drink, especially refreshing in warm Terai weather.',
    ingredients: 'Yogurt, sugar, water or milk, fruit or toppings depending on shop',
    allergy: 'Contains dairy; toppings may contain nuts.'
  },
  'Juju Dhau': {
    specialty: 'Bhaktapur signature dessert known as the king of curd.',
    ingredients: 'Buffalo or cow milk, yogurt culture, sugar, clay-pot setting',
    allergy: 'Contains dairy.'
  },
  Kheer: {
    specialty: 'Celebration dessert served at festivals, family meals and rituals.',
    ingredients: 'Rice, milk, sugar, cardamom, ghee, raisins or nuts sometimes',
    allergy: 'Contains dairy; often contains tree nuts.'
  },
  'Lal Mohan': {
    specialty: 'Rich mithai-shop sweet for small portions after meals.',
    ingredients: 'Milk solids, flour, ghee or oil, sugar syrup, cardamom',
    allergy: 'Contains dairy; may contain gluten.'
  }
};

const exploreFilters: ExploreFilter[] = ['All', 'Nature', 'Culture', 'Adventure', 'Food', 'Spiritual', 'Hidden gems'];
const launchDistricts = ['Kathmandu', 'Kaski', 'Chitwan'];

const featuredDestinations = [
  {
    title: 'Kathmandu Valley',
    district: 'Kathmandu',
    region: 'Bagmati Province',
    category: 'Culture',
    tags: ['Airport taxi', 'SIM cards', 'Bills'],
    reason: 'Start here for arrival taxis, SIM purchases, food bills, and heritage-area approaches.',
    image: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Pokhara',
    district: 'Kaski',
    region: 'Gandaki Province',
    category: 'Nature',
    tags: ['Lakeside taxis', 'Boats', 'Trail starts'],
    reason: 'Check Lakeside transport, boat rates, weather shifts, and offline trekking readiness.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Chitwan',
    district: 'Chitwan',
    region: 'Bagmati Province',
    category: 'Nature',
    tags: ['Safari quotes', 'Permits', 'Local help'],
    reason: 'Compare safari inclusions, transport quotes, and safety steps before paying.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
  }
] as const;

function FoodPassportGrid({ isDesktop }: { isDesktop: boolean }) {
  const [category, setCategory] = useState<'All' | 'Food' | 'Drinks' | 'Desserts'>('All');
  const categories: Array<'All' | 'Food' | 'Drinks' | 'Desserts'> = ['All', 'Food', 'Drinks', 'Desserts'];
  const visibleCards = category === 'All' ? foodCards : foodCards.filter((item) => item.category === category);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foodCategoryList}>
        {categories.map((option) => {
          const selected = category === option;
          const count = option === 'All' ? foodCards.length : foodCards.filter((item) => item.category === option).length;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => setCategory(option)}
              style={[styles.foodCategoryChip, selected && styles.foodCategoryChipSelected]}
            >
              <Text style={[styles.foodCategoryText, selected && styles.foodCategoryTextSelected]}>{option} · {count}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={[styles.foodGrid, isDesktop && styles.foodGridDesktop]}>
      {visibleCards.map((food) => {
        const info = foodInfo[food.dish] ?? { specialty: food.specialty ?? food.description, ingredients: food.ingredients ?? food.flavors, allergy: food.allergens };
        return (
          <View
            accessibilityLabel={`${food.dish}, ${food.region}. ${food.description}. Specialty: ${info.specialty}. Ingredients: ${info.ingredients}. Allergy note: ${info.allergy}. Typical price ${food.price}.`}
            key={food.dish}
            style={styles.foodCard}
          >
            <Image accessibilityIgnoresInvertColors source={foodImages[food.image]} style={styles.foodImage} />
            <View style={styles.foodCardBody}>
              <View style={styles.foodTitleRow}>
                <View style={styles.foodTitleCopy}>
                  <Text style={styles.foodRegion}>{food.region}</Text>
                  <Text style={styles.foodDish}>{food.dish}</Text>
                </View>
                <Text style={styles.foodPrice}>{food.price}</Text>
              </View>
              <Text style={styles.foodDescription}>{food.description}</Text>
              <View style={styles.foodBadgeRow}>
                <Text style={styles.foodBadge}>{food.dietary}</Text>
                <Text style={styles.foodBadge}>{food.spice}</Text>
              </View>
              <Text style={styles.foodFlavors}>{food.flavors}</Text>
              <View style={styles.foodInfoGrid}>
                <View style={styles.foodInfoBox}>
                  <Text style={styles.foodInfoLabel}>SPECIALTY</Text>
                  <Text style={styles.foodInfoText}>{info.specialty}</Text>
                </View>
                <View style={styles.foodInfoBox}>
                  <Text style={styles.foodInfoLabel}>INGREDIENTS</Text>
                  <Text style={styles.foodInfoText}>{info.ingredients}</Text>
                </View>
                <View style={[styles.foodInfoBox, styles.foodAllergyBox]}>
                  <Text style={styles.foodInfoLabel}>ALLERGY NOTE</Text>
                  <Text style={styles.foodInfoText}>{info.allergy}</Text>
                </View>
              </View>
              <View style={styles.foodDetailRow}>
                <Ionicons name="location-outline" size={15} color={colors.teal} />
                <Text style={styles.foodDetailText}>{food.tryIn}</Text>
              </View>
              <View style={styles.foodOrderBox}>
                <Text style={styles.foodOrderLabel}>ORDER WITH CONFIDENCE</Text>
                <Text style={styles.foodTip}>{food.orderTip}</Text>
              </View>
            </View>
          </View>
        );
      })}
      </View>
    </View>
  );
}

function FoodPriceSnapshot({ onOpenPrices }: { onOpenPrices: () => void }) {
  return (
    <View style={styles.foodSnapshot}>
      <View style={styles.foodSnapshotHeader}>
        <View>
          <Text style={styles.foodSnapshotLabel}>Meal price checks</Text>
          <Text style={styles.foodSnapshotTitle}>Know local ranges before ordering</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpenPrices} style={styles.foodSnapshotButton}>
          <Text style={styles.foodSnapshotButtonText}>Open full guide</Text>
          <Ionicons name="arrow-forward" size={15} color="#1a0f00" />
        </Pressable>
      </View>
      <View style={styles.foodSnapshotGrid}>
        {foodPrices.map((item) => (
          <View key={item.name} style={styles.foodSnapshotCard}>
            <View style={styles.foodSnapshotIcon}>
              <Ionicons name={item.good ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={20} color={item.good ? colors.teal : colors.gold} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.foodSnapshotName}>{item.name}</Text>
              <Text style={styles.foodSnapshotNote}>{item.note}</Text>
            </View>
            <View style={styles.foodSnapshotPriceBox}>
              <Text style={styles.foodSnapshotPrice}>{item.price}</Text>
              <Text style={[styles.foodSnapshotBadge, !item.good && styles.foodSnapshotBadgeWarn]}>{item.badge}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function triggerTactileFeedback() {
  if (typeof navigator === 'undefined') return;
  (navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean }).vibrate?.(12);
}

type PersonalizedAction = {
  label: string;
  page: DashboardPage;
  icon: IconName;
  priceFocus?: 'fair' | 'rides';
};

type PersonalizedPlan = {
  label: string;
  title: string;
  summary: string;
  tags: string[];
  cards: { icon: IconName; title: string; body: string; accent: string }[];
  actions: PersonalizedAction[];
};

function getRecommendedMode(preferences: TravelerPreferences | null): TravelMode {
  if (
    preferences?.travelStyle === 'culture' ||
    preferences?.interests.includes('heritage') ||
    preferences?.interests.includes('festivals') ||
    preferences?.interests.includes('food')
  ) {
    return 'culture';
  }

  return 'adventure';
}

function getPersonalizedPlan(preferences: TravelerPreferences | null): PersonalizedPlan {
  const interests = preferences?.interests ?? [];
  const wantsFood = interests.includes('food');
  const wantsCulture = preferences?.travelStyle === 'culture' || interests.includes('heritage') || interests.includes('festivals');
  const wantsNature = preferences?.travelStyle === 'nature' || interests.includes('trekking') || interests.includes('wildlife');
  const wantsWellness = interests.includes('wellness');
  const paceLabel = preferences?.pace === 'relaxed' ? 'slow days' : preferences?.pace === 'active' ? 'full days' : 'flexible days';

  if (wantsFood && wantsCulture) {
    return {
      label: 'Built from your choices',
      title: 'Local culture + food path',
      summary: `Yatri will prioritize neighborhood food, respectful local encounters, phrase help, and fair prices for ${paceLabel}.`,
      tags: ['Local people', 'Local food', paceLabel],
      cards: [
        { icon: 'restaurant-outline', title: 'Eat where locals eat', body: 'Start with momo, dal bhat, milk tea, and regional dishes before tourist restaurants.', accent: colors.gold },
        { icon: 'people-outline', title: 'Meet respectfully', body: 'Use etiquette cards and simple Nepali phrases before temples, markets, and family-run places.', accent: colors.teal },
        { icon: 'pricetag-outline', title: 'Avoid tourist markup', body: 'Food and taxi price checks are moved closer so you can compare before paying.', accent: colors.mountainBlue }
      ],
      actions: [
        { label: 'Open local guide', page: 'local', icon: 'people-outline' },
        { label: 'Check food prices', page: 'prices', icon: 'restaurant-outline', priceFocus: 'fair' },
        { label: 'Find districts', page: 'explore', icon: 'compass-outline' }
      ]
    };
  }

  if (wantsFood) {
    return {
      label: 'Food-first Yatri',
      title: 'Taste Nepal with confidence',
      summary: `Yatri will surface regional food, ordering phrases, and fair meal prices for ${paceLabel}.`,
      tags: ['Local food', 'Fair prices', paceLabel],
      cards: [
        { icon: 'restaurant-outline', title: 'Regional food decoder', body: 'See what to order, what flavors to expect, and what to ask for.', accent: colors.gold },
        { icon: 'chatbubbles-outline', title: 'Ordering phrases', body: 'Keep simple Nepali phrases ready for tea shops, markets, and local restaurants.', accent: colors.teal },
        { icon: 'calculator-outline', title: 'Meal price checks', body: 'Compare momo, dal bhat, bottled water, and tea against local ranges.', accent: colors.mountainBlue }
      ],
      actions: [
        { label: 'Open food guide', page: 'food', icon: 'restaurant-outline' },
        { label: 'Check meal prices', page: 'prices', icon: 'calculator-outline', priceFocus: 'fair' }
      ]
    };
  }

  if (wantsCulture) {
    return {
      label: 'Culture-aware Yatri',
      title: 'Move through local spaces respectfully',
      summary: `Yatri will emphasize festivals, temple etiquette, heritage walks, and useful phrases for ${paceLabel}.`,
      tags: ['Heritage', 'Festivals', paceLabel],
      cards: [
        { icon: 'sparkles-outline', title: 'Festival context', body: 'Understand what is happening nearby before entering crowded celebration areas.', accent: colors.gold },
        { icon: 'footsteps-outline', title: 'Etiquette first', body: 'Know when to remove shoes, walk clockwise, and ask before photos.', accent: colors.teal },
        { icon: 'chatbubbles-outline', title: 'Phrase help', body: 'Use quick Nepali phrases to make small interactions warmer.', accent: colors.mountainBlue }
      ],
      actions: [
        { label: 'Open culture guide', page: 'local', icon: 'people-outline' },
        { label: 'Explore festivals', page: 'explore', icon: 'sparkles-outline' }
      ]
    };
  }

  if (wantsNature || wantsWellness) {
    return {
      label: 'Nature-aware Yatri',
      title: wantsWellness ? 'A calmer Nepal rhythm' : 'Adventure without guessing',
      summary: `Yatri will emphasize route conditions, safety check-ins, quiet places, and offline packs for ${paceLabel}.`,
      tags: [wantsWellness ? 'Wellness' : 'Nature', 'Safety', paceLabel],
      cards: [
        { icon: 'trail-sign-outline', title: 'Route readiness', body: 'Trail alerts and saved maps stay close before you leave town.', accent: colors.mountainBlue },
        { icon: 'pulse-outline', title: 'Health check-ins', body: 'Altitude and safety tools stay one tap away during longer travel days.', accent: colors.danger },
        { icon: 'leaf-outline', title: 'Quiet discovery', body: 'Nature picks and slower places move higher in Explore.', accent: colors.forest }
      ],
      actions: [
        { label: 'Open safety tools', page: 'safety', icon: 'shield-outline' },
        { label: 'Explore nature', page: 'explore', icon: 'leaf-outline' }
      ]
    };
  }

  return {
    label: 'Personalize Yatri',
    title: 'Tell Yatri what kind of Nepal you want',
    summary: 'Choose food, culture, nature, safety, or pace preferences so the dashboard reshapes around your trip.',
    tags: ['Food', 'Culture', 'Safety'],
    cards: [
      { icon: 'restaurant-outline', title: 'Food', body: 'Regional dishes, ordering tips, and meal price checks.', accent: colors.gold },
      { icon: 'people-outline', title: 'Culture', body: 'Etiquette, phrases, festivals, and local context.', accent: colors.teal },
      { icon: 'shield-outline', title: 'Safety', body: 'Alerts, SOS, fair prices, and scam reports.', accent: colors.danger }
    ],
    actions: [
      { label: 'Explore local tools', page: 'local', icon: 'people-outline' },
      { label: 'Open safety', page: 'safety', icon: 'shield-outline' }
    ]
  };
}

export function YatriDashboardScreen({
  onSignOut,
  userEmail
}: {
  onSignOut: () => void;
  userEmail: string | null;
}) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 720;
  const isDesktop = width >= 1024;
  const savedPreferences = loadTravelPreferences();
  const recommendedMode = getRecommendedMode(savedPreferences);
  const personalizedPlan = getPersonalizedPlan(savedPreferences);
  const [activeMode, setActiveMode] = useState<TravelMode>(recommendedMode);
  const active = modeConfig[activeMode];
  const [currentPage, setCurrentPage] = useState<DashboardPage>('home');
  const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreFilter, setExploreFilter] = useState<ExploreFilter>('All');
  const [priceFocus, setPriceFocus] = useState<'fair' | 'rides'>('fair');
  const [isModerator, setIsModerator] = useState(false);
  const [connectivity, setConnectivity] = useState<ConnectivityMode>(() =>
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online'
  );
  const normalizedExploreSearch = exploreSearch.trim().toLowerCase();
  const selectedDiscover = discoverItems.filter((item) => item.mode === activeMode);
  const visibleDestinations = featuredDestinations.filter((destination) => {
    const filterMatch = exploreFilter === 'All'
      || destination.category === exploreFilter
      || destination.tags.some((tag) => tag.toLowerCase().includes(exploreFilter.toLowerCase()));
    const searchMatch = normalizedExploreSearch.length === 0
      || [destination.title, destination.district, destination.region, destination.category, destination.reason, ...destination.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalizedExploreSearch);
    return filterMatch && searchMatch;
  });
  const visibleDiscoverItems = selectedDiscover.filter((item) => {
    if (!normalizedExploreSearch) return true;
    return [item.title, item.location, item.tag, item.summary, item.meta].join(' ').toLowerCase().includes(normalizedExploreSearch);
  });

  const confirmAccountDeletion = () => {
    Alert.alert('Delete Yatri account?', 'This permanently removes your account, profile, reports, saved districts, and contacts. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete account',
        style: 'destructive',
        onPress: async () => {
          try { await deleteCurrentAccount(); } catch (error) { Alert.alert('Account not deleted', error instanceof Error ? error.message : 'Please try again.'); }
        }
      }
    ]);
  };

  useEffect(() => {
    void getCurrentRole().then((role) => setIsModerator(role === 'moderator' || role === 'admin'));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncConnectivity = () => setConnectivity(navigator.onLine === false ? 'offline' : 'online');
    window.addEventListener('online', syncConnectivity);
    window.addEventListener('offline', syncConnectivity);
    return () => {
      window.removeEventListener('online', syncConnectivity);
      window.removeEventListener('offline', syncConnectivity);
    };
  }, []);

  const handleQuickAction = (title: string) => {
    if (title === 'SOS') {
      triggerTactileFeedback();
      setCurrentPage('safety');
      return;
    }
    if (title === 'Offline' || title === 'Offline Help') {
      setConnectivity('offline');
      setCurrentPage('home');
      return;
    }
    if (title === 'Scam Alerts') {
      setCurrentPage('safety');
      return;
    }
    if (title === 'Ride Tips') {
      setPriceFocus('rides');
      setCurrentPage('prices');
      return;
    }

    setPriceFocus('fair');
    setCurrentPage('prices');
  };

  const handlePersonalizedAction = (action: PersonalizedAction) => {
    if (action.priceFocus) setPriceFocus(action.priceFocus);
    setCurrentPage(action.page);
  };

  const openDistrictGuide = (district: string) => {
    setSelectedDistrict(district);
    setCurrentPage('district');
  };

  const openTrailNavigation = () => {
    if (connectivity === 'offline') {
      Alert.alert('Offline map selected', 'The downloaded trail map is ready for turn-by-turn navigation in the native map build.');
      return;
    }

    Linking.openURL('https://www.google.com/maps/search/?api=1&query=Annapurna+Base+Camp+Nepal').catch(() => {
      Alert.alert('Navigation unavailable', 'Unable to open maps on this device.');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.responsiveShell, isDesktop && styles.responsiveShellDesktop]}>
        {isDesktop && (
          <DesktopNavigation currentPage={currentPage} connectivity={connectivity} onChange={setCurrentPage} />
        )}
        <View style={styles.responsiveMain}>
          <View style={[styles.topBar, isDesktop && styles.topBarDesktop]}>
            {isDesktop ? (
              <View>
                <Text style={styles.desktopContext}>YATRI TRAVEL DESK</Text>
                <Text style={styles.desktopPageName}>{dashboardPages.find((page) => page.id === currentPage)?.label}</Text>
              </View>
            ) : (
              <YatriLogo compact />
            )}
            <View style={styles.topBarActions}>
              {isModerator && (
                <Pressable accessibilityLabel="Open report moderation" accessibilityRole="button" onPress={() => setCurrentPage('moderation')} style={styles.signOutButton}>
                  <Ionicons name="shield-checkmark-outline" size={19} color={colors.teal} />
                </Pressable>
              )}
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://www.nrb.org.np/forex/')} style={styles.exchangePill}>
                <Text style={styles.exchangeLabel}>OFFICIAL EXCHANGE RATE</Text>
                <Text style={styles.exchangeValue}>Check Nepal Rastra Bank</Text>
              </Pressable>
              {userEmail && (
                <Pressable accessibilityLabel="Delete account" accessibilityRole="button" onPress={confirmAccountDeletion} style={styles.signOutButton}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              )}
              {userEmail && (
                <Pressable
                  accessibilityLabel={`Sign out ${userEmail}`}
                  accessibilityRole="button"
                  onPress={onSignOut}
                  style={styles.signOutButton}
                >
                  <Ionicons name="log-out-outline" size={19} color={colors.muted} />
                </Pressable>
              )}
            </View>
      </View>

          <ScrollView
            key={currentPage}
            style={styles.screen}
            contentContainerStyle={[styles.content, isTablet && styles.contentTablet, isDesktop && styles.contentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {currentPage === 'home' && (
          isDesktop ? (
            <DesktopHomeLayout
              active={active}
              activeMode={activeMode}
              connectivity={connectivity}
              onAction={handlePersonalizedAction}
              onModeChange={setActiveMode}
              onQuickAction={handleQuickAction}
              onSelectDistrict={openDistrictGuide}
              personalizedPlan={personalizedPlan}
              selectedDistrict={selectedDistrict}
            />
          ) : (
          <>
            <ImageBackground source={{ uri: active.image }} style={styles.hero} imageStyle={styles.heroImage as any}>
              <LinearGradient
                colors={['rgba(7,6,15,0.05)', 'rgba(7,6,15,0.38)', 'rgba(7,6,15,0.94)']}
                style={styles.heroGradient}
              />
              <View style={styles.heroTop}>
                <Text style={styles.greeting}>Namaste, traveler</Text>
                <Text style={styles.location}>Kathmandu ready - offline packs active</Text>
              </View>
              <View style={styles.heroCopy}>
                <Text style={[styles.modeBadge, { color: active.secondary }]}>Kathmandu · Pokhara · Chitwan</Text>
                <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>Check prices, avoid scams, and get offline help in Nepal.</Text>
                <Text style={[styles.heroText, isDesktop && styles.heroTextDesktop]}>Built around the moments travelers actually need protection: taxis, SIM cards, restaurant bills, permits, and emergencies without signal.</Text>
              </View>
            </ImageBackground>

            <View style={styles.modeSwitch}>
              <ModeButton mode="culture" selected={activeMode === 'culture'} onPress={() => setActiveMode('culture')} />
              <ModeButton mode="adventure" selected={activeMode === 'adventure'} onPress={() => setActiveMode('adventure')} />
            </View>
            <PrayerFlagStrip />

            <ConnectivityControl mode={connectivity} onChange={setConnectivity} />

            <View style={styles.quickGrid}>
              {quickActions.map((action) => (
                <Pressable
                  accessibilityLabel={action.title}
                  accessibilityRole="button"
                  key={action.title}
                  onPress={() => handleQuickAction(action.title)}
                  style={({ pressed }) => [styles.quickAction, isTablet && styles.quickActionTablet, pressableLift(pressed)]}
                >
                  <View style={[styles.quickIcon, { backgroundColor: `${action.accent}22` }]}>
                    <Ionicons name={action.icon} size={22} color={action.accent} />
                  </View>
                  <Text style={styles.quickTitle}>{action.title}</Text>
                  <Text style={styles.quickSub}>{action.subtitle}</Text>
                </Pressable>
              ))}
            </View>

            <PersonalizedForYou plan={personalizedPlan} onAction={handlePersonalizedAction} />

            {connectivity === 'online' ? (
              <>
                <SectionHeader label="Launch corridor" title="Choose Kathmandu, Pokhara or Chitwan" />
                <DistrictBriefingSelector selectedDistrict={selectedDistrict} onSelectDistrict={openDistrictGuide} />
                <SectionHeader label="Online nearby" title={`Places to stay in ${selectedDistrict}`} />
                <NearbyHotels selectedDistrict={selectedDistrict} />
              </>
            ) : (
              <>
                <OfflineReadyBanner />
                <SectionHeader label="Saved on this device" title="Your offline district guide" />
                <DistrictBriefingSelector selectedDistrict={selectedDistrict} onSelectDistrict={openDistrictGuide} />
                <SectionHeader label="Offline-first" title="Downloaded travel packs" />
                <View style={[styles.stack, isDesktop && styles.desktopThreeColumnGrid]}>
                  {offlinePacks.map((pack) => (
                    <OfflinePackCard key={pack.title} pack={pack} />
                  ))}
                </View>
              </>
            )}
          </>
          )
        )}

        {currentPage === 'explore' && (
          <>
            <View style={[styles.exploreHero, isDesktop && styles.exploreHeroDesktop]}>
              <Text style={styles.exploreEyebrow}>Explore Nepal</Text>
              <Text style={[styles.exploreTitle, isDesktop && styles.exploreTitleDesktop]}>Find your next Nepal experience</Text>
              <Text style={[styles.exploreIntro, isDesktop && styles.exploreIntroDesktop]}>
                Discover places, festivals, food and experiences based on how you want to travel.
              </Text>
              <View style={[styles.exploreSearchBox, isDesktop && styles.exploreSearchBoxDesktop]}>
                <Ionicons name="search-outline" size={22} color={colors.goldLight} />
                <TextInput
                  accessibilityLabel="Search destinations, districts or experiences"
                  onChangeText={setExploreSearch}
                  placeholder="Search destinations, districts or experiences..."
                  placeholderTextColor="rgba(240,238,248,0.42)"
                  style={styles.exploreSearchInput}
                  value={exploreSearch}
                />
                {exploreSearch.length > 0 && (
                  <Pressable accessibilityLabel="Clear Explore search" onPress={() => setExploreSearch('')} style={styles.exploreClearButton}>
                    <Ionicons name="close" size={18} color={colors.muted} />
                  </Pressable>
                )}
              </View>
              <View style={styles.exploreFilterWrap}>
                {exploreFilters.map((filter) => {
                  const selected = exploreFilter === filter;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={filter}
                      onPress={() => setExploreFilter(filter)}
                      style={[styles.exploreFilterChip, selected && styles.exploreFilterChipSelected]}
                    >
                      <Text style={[styles.exploreFilterText, selected && styles.exploreFilterTextSelected]}>{filter}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <ExploreSectionHeading label="Featured for you" title="Places worth exploring" action="View all" />
            <View style={styles.exploreDestinationGrid}>
              {visibleDestinations.map((destination) => (
                <DestinationCard
                  destination={destination}
                  key={destination.title}
                  onPress={() => openDistrictGuide(destination.district)}
                />
              ))}
            </View>
            {visibleDestinations.length === 0 && (
              <View style={styles.exploreEmptyState}>
                <Text style={styles.exploreEmptyTitle}>No matching places yet</Text>
                <Text style={styles.exploreEmptyText}>Try another search or switch back to All.</Text>
              </View>
            )}

            <ExploreSectionHeading label="Happening soon" title="Festivals & events" action="View all" />
            <View style={styles.festivalGrid}>
              {festivals.map((festival) => (
                <FestivalPhotoCard key={festival.name} festival={festival} />
              ))}
            </View>
            <Text style={styles.contentSourceNote}>{festivalContentSource}</Text>

            {savedPreferences && (
              <>
                <ExploreSectionHeading label="Recommended for you" title="Based on your interests" />
                <View style={styles.exploreDestinationGrid}>
                  {visibleDiscoverItems.map((item) => (
                    <DiscoverCard key={item.title} item={item} />
                  ))}
                </View>
              </>
            )}

            <ExploreSectionHeading label="Trail updates" title="Routes and conditions" />
            <View style={styles.mapPanel}>
              <View style={styles.flex}>
                <Text style={styles.mapTitle}>Offline trail map</Text>
                <Text style={styles.mapText}>Trails, water, teahouses, checkpoints</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={openTrailNavigation} style={styles.navigateButton}>
                <Ionicons name="navigate-outline" size={16} color="#1a0f00" />
                <Text style={styles.navigateText}>Navigate</Text>
              </Pressable>
            </View>
            <View style={[styles.stack, isDesktop && styles.desktopThreeColumnGrid]}>
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
          </>
        )}

        {currentPage === 'safety' && (
          <>
            <PageHeading eyebrow="Safety" title="Alerts and emergency tools" />
            <SectionHeader label="Trail safety" title="Weather and altitude alerts" />
            <View style={[styles.stack, isDesktop && styles.desktopTwoColumnGrid]}>
              {trailAlerts.map((alert) => (
                <AlertCard key={alert.title} alert={alert} />
              ))}
            </View>

            <SectionHeader label="Altitude safety" title="Daily symptom check-in" />
            <View style={isDesktop && styles.desktopTwoColumnGrid}>
              <AltitudeTracker />
              <OfflineSos />
            </View>

            <SectionHeader label="Traveler safety" title="Live scam alert map" />
            <ScamAlertMap />

            {!isDesktop && (
              <>
                <SectionHeader label="Emergency" title="Offline help" />
                <OfflineSos />
              </>
            )}
          </>
        )}

        {currentPage === 'district' && (
          <DistrictGuidePage
            isDesktop={isDesktop}
            onChangeDistrict={setSelectedDistrict}
            onOpenFood={() => setCurrentPage('food')}
            onOpenPrices={() => {
              setPriceFocus('fair');
              setCurrentPage('prices');
            }}
            selectedDistrict={selectedDistrict}
          />
        )}

        {currentPage === 'food' && (
          <>
            <PageHeading eyebrow="Food" title="Taste Nepal with confidence" />
            <SectionHeader label="Taste Nepal" title="Regional food decoder" />
            <FoodPassportGrid isDesktop={isDesktop} />

            <SectionHeader label="Fair meal prices" title="Order without guessing" />
            <FoodPriceSnapshot
              onOpenPrices={() => {
                setPriceFocus('fair');
                setCurrentPage('prices');
              }}
            />

            <SectionHeader label="Useful phrases" title="Small words that help at tea shops" />
            <CultureBites initialView="phrases" />
          </>
        )}

        {currentPage === 'local' && (
          <>
            <PageHeading eyebrow="Local" title="Ask, speak, and spend confidently" />
            {savedPreferences?.interests.includes('food') && (
              <>
                <SectionHeader label="Taste Nepal" title="Regional food decoder" />
                <FoodPassportGrid isDesktop={isDesktop} />
              </>
            )}

            <SectionHeader label="Know Nepal" title={savedPreferences?.interests.includes('food') ? 'Phrases for ordering and meeting people' : 'Culture bites and useful phrases'} />
            <CultureBites initialView={savedPreferences?.interests.includes('food') ? 'phrases' : 'facts'} />

            <SectionHeader label="Verified help" title="Ask a local guide" />
            <AskALocalChat />

            <SectionHeader label="Respectful travel" title="Everyday etiquette" />
            <View style={styles.namasteCard}>
              <View style={styles.namasteAnimation}>
                <View style={styles.palmLeft} />
                <View style={styles.palmRight} />
              </View>
              <View style={styles.namasteCopy}>
                <Text style={styles.namasteTitle}>Namaste gesture</Text>
                <Text style={styles.namasteText}>Bring your palms together at chest level, make a slight bow, and offer a calm smile.</Text>
              </View>
            </View>
            <View style={[styles.stack, isDesktop && styles.desktopThreeColumnGrid]}>
              {etiquetteCards.map((card) => (
                <InfoCard key={card.context} icon={card.icon} title={card.context} body={`${card.rule} ${card.detail}`} />
              ))}
            </View>

            {!savedPreferences?.interests.includes('food') && (
              <>
                <SectionHeader label="Taste Nepal" title="Regional food decoder" />
                <FoodPassportGrid isDesktop={isDesktop} />
              </>
            )}
          </>
        )}

        {currentPage === 'moderation' && isModerator && <ModerationPanel />}

        {currentPage === 'prices' && (
          <>
            <PageHeading
              eyebrow="Fair price guide"
              title="Check before you pay"
            />
            <FairPriceChecker selectedDistrict={selectedDistrict} priceFocus={priceFocus} onPriceFocusChange={setPriceFocus} />
          </>
        )}
          </ScrollView>

          {!isDesktop && <BottomNavigation currentPage={currentPage} onChange={setCurrentPage} />}
        </View>
      </View>
    </SafeAreaView>
  );
}

function DesktopHomeLayout({
  active,
  activeMode,
  connectivity,
  onAction,
  onModeChange,
  onQuickAction,
  onSelectDistrict,
  personalizedPlan,
  selectedDistrict
}: {
  active: (typeof modeConfig)[TravelMode];
  activeMode: TravelMode;
  connectivity: ConnectivityMode;
  onAction: (action: PersonalizedAction) => void;
  onModeChange: (mode: TravelMode) => void;
  onQuickAction: (title: string) => void;
  onSelectDistrict: (district: string) => void;
  personalizedPlan: PersonalizedPlan;
  selectedDistrict: string;
}) {
  const { width } = useWindowDimensions();
  const compactDesktop = width < 1280;

  return (
    <View style={styles.desktopHome}>
      <ImageBackground source={{ uri: active.image }} style={[styles.desktopHomeHero, compactDesktop && styles.desktopHomeHeroCompact]} imageStyle={styles.desktopHomeHeroImage as any}>
        <LinearGradient
          colors={['rgba(7,6,15,0.08)', 'rgba(7,6,15,0.48)', 'rgba(7,6,15,0.92)']}
          style={styles.desktopHomeHeroGradient}
        />
        <View style={[styles.desktopHomeHeroCopy, compactDesktop && styles.desktopHomeHeroCopyCompact]}>
          <Text style={styles.desktopHomeEyebrow}>Kathmandu · Pokhara · Chitwan</Text>
          <Text style={[styles.desktopHomeTitle, compactDesktop && styles.desktopHomeTitleCompact]}>Check prices, avoid scams, and get offline help in Nepal.</Text>
          <Text style={[styles.desktopHomeText, compactDesktop && styles.desktopHomeTextCompact]}>Yatri protects the travel moments that go wrong most often: airport taxis, SIM purchases, restaurant bills, trekking permits, and emergencies without signal.</Text>
          <View style={styles.desktopHomeTags}>
            {['Price checks', 'Scam playbooks', 'Offline SOS'].map((tag, index) => (
              <View key={tag} style={styles.desktopHomeTag}>
                <Ionicons name={index === 0 ? 'calculator-outline' : index === 1 ? 'shield-checkmark-outline' : 'cloud-offline-outline'} size={14} color={colors.goldLight} />
                <Text style={styles.desktopHomeTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        {!compactDesktop && <HeroPromiseCard />}
      </ImageBackground>

      <View style={styles.desktopModeRow}>
        <ModeButton mode="culture" selected={activeMode === 'culture'} onPress={() => onModeChange('culture')} />
        <ModeButton mode="adventure" selected={activeMode === 'adventure'} onPress={() => onModeChange('adventure')} />
        <View style={styles.desktopConnectivityChip}>
          <View style={[styles.connectivityDot, { backgroundColor: connectivity === 'online' ? colors.teal : colors.gold }]} />
          <Text style={styles.desktopConnectivityText}>{connectivity === 'online' ? 'Live nearby data' : 'Offline packs ready'}</Text>
        </View>
      </View>

      <View style={styles.desktopHomeActionGrid}>
        {personalizedPlan.cards.map((card, index) => (
          <DesktopActionCard
            key={card.title}
            card={card}
            onPress={() => onAction(personalizedPlan.actions[index] ?? personalizedPlan.actions[0])}
          />
        ))}
      </View>

      <View style={styles.desktopHomeMainGrid}>
        <View style={styles.desktopHomePrimary}>
          <View style={styles.desktopSectionHeaderRow}>
            <SectionHeader label="Launch corridor" title="Choose Kathmandu, Pokhara or Chitwan" />
            <Pressable accessibilityRole="button" onPress={() => onAction({ label: 'Explore launch areas', page: 'explore', icon: 'map-outline' })} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Explore launch areas</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          </View>
          <DistrictBriefingSelector selectedDistrict={selectedDistrict} onSelectDistrict={onSelectDistrict} />
        </View>

        <HomeRightRail onQuickAction={onQuickAction} selectedDistrict={selectedDistrict} />
      </View>

      <View style={styles.desktopAdditionalSection}>
        <SectionHeader label="Online nearby" title={`Places to stay in ${selectedDistrict}`} />
        <NearbyHotels selectedDistrict={selectedDistrict} />
      </View>
    </View>
  );
}

function HeroPromiseCard({ compact = false }: { compact?: boolean }) {
  const promises = ['Dated price observations', 'Scam and safety playbooks', 'Offline help when signal drops'];
  return (
    <View style={[styles.heroPromiseCard, compact && styles.heroPromiseCardCompact]}>
      <View style={styles.heroPromiseHeader}>
        <Ionicons name="ribbon-outline" size={24} color={colors.goldLight} />
        <Text style={styles.heroPromiseTitle}>Protected Traveler Promise</Text>
      </View>
      {promises.map((promise) => (
        <View key={promise} style={styles.heroPromiseItem}>
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.teal} />
          <Text style={styles.heroPromiseText}>{promise}</Text>
        </View>
      ))}
    </View>
  );
}

function DesktopActionCard({
  card,
  onPress
}: {
  card: PersonalizedPlan['cards'][number];
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.desktopHomeActionCard, pressableLift(pressed)]}>
      <View style={[styles.desktopHomeActionIcon, { backgroundColor: `${card.accent}24` }]}>
        <Ionicons name={card.icon} size={28} color={card.accent} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.desktopHomeActionTitle}>{card.title}</Text>
        <Text style={styles.desktopHomeActionText}>{card.body}</Text>
      </View>
      <View style={[styles.desktopHomeActionArrow, { backgroundColor: `${card.accent}24` }]}>
        <Ionicons name="arrow-forward" size={20} color={card.accent} />
      </View>
    </Pressable>
  );
}

function HomeRightRail({ onQuickAction, selectedDistrict }: { onQuickAction: (title: string) => void; selectedDistrict: string }) {
  return (
    <View style={styles.desktopHomeRail}>
      <OfficialGuideCard onOpenGuide={() => onQuickAction('Offline Help')} />
      <View style={styles.quickHelpPanel}>
        <Text style={styles.railPanelLabel}>Quick help</Text>
        <View style={styles.quickHelpGrid}>
          {quickActions.map((action) => (
            <Pressable key={action.title} accessibilityRole="button" onPress={() => onQuickAction(action.title)} style={({ pressed }) => [styles.quickHelpTile, pressableLift(pressed)]}>
              <View style={[styles.quickHelpIcon, { backgroundColor: `${action.accent}22` }]}>
                <Ionicons name={action.icon} size={22} color={action.accent} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.quickHelpTitle}>{action.title}</Text>
                <Text style={styles.quickHelpText}>{action.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.railDistrictTip}>
        <Badge tone="blue">LOCAL TIP</Badge>
        <Text style={styles.railDistrictTitle}>{selectedDistrict === 'Kaski' ? 'Pokhara' : selectedDistrict} desk</Text>
        <Text style={styles.railDistrictText}>Focus on the next real decision: check the quote, read the alert, save offline help, or open SOS.</Text>
      </View>
    </View>
  );
}

function DistrictGuidePage({
  isDesktop,
  onChangeDistrict,
  onOpenFood,
  onOpenPrices,
  selectedDistrict
}: {
  isDesktop: boolean;
  onChangeDistrict: (district: string) => void;
  onOpenFood: () => void;
  onOpenPrices: () => void;
  selectedDistrict: string;
}) {
  const district = districtBriefings.find((item) => item.district === selectedDistrict);
  const directoryItem = districtDirectory.find((item) => item.district === selectedDistrict);
  const province = district?.province ?? directoryItem?.province ?? 'Nepal';
  const foodPreview = foodCards.slice(0, 3);

  return (
    <>
      <PageHeading eyebrow="District guide" title={`${selectedDistrict} District Guide`} />
      <View style={styles.districtGuideHero}>
        <View style={styles.districtGuideHeroIcon}>
          <Ionicons name={district?.icon ?? 'map-outline'} size={28} color="#1a0f00" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.districtGuideProvince}>{province}</Text>
          <Text style={styles.districtGuideTitle}>{selectedDistrict}</Text>
          <Text style={styles.districtGuideText}>
            {district
              ? `${district.bestFor}. Base yourself around ${district.base}, check ${district.connectivity.toLowerCase()} connectivity, and review local transport and safety notes before moving.`
              : 'Use this guide to choose a base town, check local transport, save offline notes, and open nearby places before you travel.'}
          </Text>
        </View>
      </View>

      <SectionHeader label="Choose district" title="Switch guide anytime" />
      <DistrictBriefingSelector selectedDistrict={selectedDistrict} onSelectDistrict={onChangeDistrict} />

      <SectionHeader label="Nearby stays" title={`Places to stay in ${selectedDistrict}`} />
      <NearbyHotels selectedDistrict={selectedDistrict} />

      <SectionHeader label="Taste nearby" title="Food to start with" />
      <View style={[styles.districtFoodPreview, isDesktop && styles.desktopThreeColumnGrid]}>
        {foodPreview.map((food) => {
          const info = foodInfo[food.dish];
          return (
            <Pressable accessibilityRole="button" key={food.dish} onPress={onOpenFood} style={({ pressed }) => [styles.districtFoodCard, pressableLift(pressed)]}>
              <Image accessibilityIgnoresInvertColors source={foodImages[food.image]} style={styles.districtFoodImage} />
              <View style={styles.districtFoodCopy}>
                <Text style={styles.foodRegion}>{food.region}</Text>
                <Text style={styles.districtFoodName}>{food.dish}</Text>
                <Text style={styles.districtFoodText}>{info?.specialty ?? food.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader label="District prices" title="Check before you pay" />
      <View style={styles.districtGuideCtaRow}>
        <InfoCard icon="restaurant-outline" title="Food guide" body="Open regional dishes, ingredients, allergy notes, and ordering tips." />
        <InfoCard icon="calculator-outline" title="Fair prices" body="Compare meal, ride, SIM, shopping, and permit ranges before agreeing." />
      </View>
      <Pressable accessibilityRole="button" onPress={onOpenPrices} style={styles.districtGuidePrimaryButton}>
        <Ionicons name="calculator-outline" size={18} color="#1a0f00" />
        <Text style={styles.districtGuidePrimaryText}>Open fair price checker</Text>
      </Pressable>
    </>
  );
}

function OfficialGuideCard({ onOpenGuide }: { onOpenGuide: () => void }) {
  return (
    <View style={styles.officialGuideCard}>
      <View style={styles.officialGuideHeader}>
        <Ionicons name="book-outline" size={19} color={colors.muted} />
        <View>
          <Text style={styles.railPanelLabel}>Official guide</Text>
          <Text style={styles.railPanelSub}>Your pocket guide to Nepal</Text>
        </View>
      </View>
      <View style={styles.officialGuideBody}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80' }}
          style={styles.officialGuideCover}
          imageStyle={styles.officialGuideCoverImage as any}
        >
          <LinearGradient colors={['rgba(7,6,15,0.05)', 'rgba(7,6,15,0.72)']} style={styles.officialGuideCoverGradient} />
          <Text style={styles.officialGuideCoverText}>Nepal Travel Guide</Text>
        </ImageBackground>
        <View style={styles.flex}>
          <Text style={styles.officialGuideTitle}>Nepal Travel Guide</Text>
          <Text style={styles.officialGuideText}>Offline maps, phrases, tips and safety info.</Text>
          <Pressable accessibilityRole="button" onPress={onOpenGuide} style={styles.officialGuideButton}>
            <Text style={styles.officialGuideButtonText}>View guide</Text>
          </Pressable>
        </View>
        <Pressable accessibilityLabel="Download guide" accessibilityRole="button" onPress={onOpenGuide} style={styles.downloadGuideButton}>
          <Ionicons name="download-outline" size={19} color={colors.goldLight} />
        </Pressable>
      </View>
    </View>
  );
}

function DesktopNavigation({
  connectivity,
  currentPage,
  onChange
}: {
  connectivity: ConnectivityMode;
  currentPage: DashboardPage;
  onChange: (page: DashboardPage) => void;
}) {
  return (
    <View style={styles.desktopSidebar}>
      <YatriLogo />
      <View style={styles.desktopNavList}>
        {dashboardPages.map((page) => {
          const selected = currentPage === page.id;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={page.id}
              onPress={() => onChange(page.id)}
              style={[styles.desktopNavItem, selected && styles.desktopNavItemSelected]}
            >
              <Ionicons name={selected ? page.activeIcon : page.icon} size={20} color={selected ? '#1a0f00' : colors.muted} />
              <Text style={[styles.desktopNavText, selected && styles.desktopNavTextSelected]}>{page.label}</Text>
              {selected && <Ionicons name="chevron-forward" size={16} color="#1a0f00" />}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.desktopSidebarStatus}>
        <View style={[styles.connectivityDot, { backgroundColor: connectivity === 'online' ? colors.teal : colors.gold }]} />
        <View>
          <Text style={styles.desktopStatusLabel}>{connectivity === 'online' ? 'CONNECTED' : 'OFFLINE READY'}</Text>
          <Text style={styles.desktopStatusText}>{connectivity === 'online' ? 'Live services available' : 'Using saved travel data'}</Text>
        </View>
      </View>
      <View style={styles.desktopWeatherCard}>
        <Ionicons name="partly-sunny" size={27} color={colors.goldLight} />
        <View>
          <Text style={styles.desktopWeatherTemp}>22 C</Text>
          <Text style={styles.desktopWeatherText}>Kathmandu, Nepal</Text>
        </View>
      </View>
    </View>
  );
}

function WebFriendlyStrip() {
  return (
    <View style={styles.webFriendlyStrip}>
      <View style={styles.webFriendlyItem}>
        <Ionicons name="resize-outline" size={18} color={colors.goldLight} />
        <Text style={styles.webFriendlyText}>Readable desktop layout</Text>
      </View>
      <View style={styles.webFriendlyItem}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.teal} />
        <Text style={styles.webFriendlyText}>Travel Desk help stays close</Text>
      </View>
      <View style={styles.webFriendlyItem}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.mountainBlue} />
        <Text style={styles.webFriendlyText}>Safety tools stay one click away</Text>
      </View>
    </View>
  );
}

function PageHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  return (
    <View style={[styles.pageHeading, desktop && styles.pageHeadingDesktop]}>
      <Text style={[styles.pageEyebrow, desktop && styles.pageEyebrowDesktop]}>{eyebrow}</Text>
      <Text style={[styles.pageTitle, desktop && styles.pageTitleDesktop]}>{title}</Text>
    </View>
  );
}

function BottomNavigation({ currentPage, onChange }: { currentPage: DashboardPage; onChange: (page: DashboardPage) => void }) {
  return (
    <View style={styles.bottomNav}>
      {dashboardPages.map((page) => {
        const selected = currentPage === page.id;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={page.id}
            onPress={() => onChange(page.id)}
            style={styles.bottomNavItem}
          >
            <View style={[styles.bottomNavIcon, selected && styles.bottomNavIconSelected]}>
              <Ionicons name={selected ? page.activeIcon : page.icon} size={20} color={selected ? '#1a0f00' : colors.muted} />
            </View>
            <Text style={[styles.bottomNavLabel, selected && styles.bottomNavLabelSelected]}>{page.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ConnectivityControl({ mode, onChange }: { mode: ConnectivityMode; onChange: (mode: ConnectivityMode) => void }) {
  return (
    <View style={styles.connectivityBar}>
      <View style={styles.connectivityCopy}>
        <View style={[styles.connectivityDot, { backgroundColor: mode === 'online' ? colors.teal : colors.gold }]} />
        <Text style={styles.connectivityLabel}>{mode === 'online' ? 'Connected' : 'Offline mode'}</Text>
      </View>
      <View style={styles.connectivitySwitch}>
        {(['online', 'offline'] as ConnectivityMode[]).map((option) => {
          const selected = mode === option;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => onChange(option)}
              style={[styles.connectivityOption, selected && styles.connectivityOptionSelected]}
            >
              <Ionicons name={option === 'online' ? 'wifi' : 'cloud-offline-outline'} size={15} color={selected ? '#1a0f00' : colors.muted} />
              <Text style={[styles.connectivityOptionText, selected && styles.connectivityOptionTextSelected]}>
                {option === 'online' ? 'Online' : 'Offline'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getDistrictLodging(selectedDistrict: string) {
  if (selectedDistrict === 'Kathmandu') {
    return {
      note: 'Distances shown from Thamel center',
      live: true,
      hotels: nearbyHotels
    };
  }

  const directoryItem = districtDirectory.find((item) => item.district === selectedDistrict);
  const detailed = districtBriefings.find((item) => item.district === selectedDistrict);
  const base = detailed?.base ?? `${selectedDistrict} main bazaar`;
  const province = directoryItem?.province ?? 'Nepal';
  const mapDistrict = `${selectedDistrict}, ${province}, Nepal`;

  return {
    note: `Showing lodging searches for ${selectedDistrict}. Open map results and verify availability before traveling.`,
    live: false,
    hotels: [
      {
        name: `Hotels in ${selectedDistrict}`,
        area: base,
        address: `hotels in ${mapDistrict}`,
        distance: province,
        phone: '',
        displayPhone: 'Search map results',
        note: `Map search for hotels and lodges around ${selectedDistrict}. Confirm price, road access, and check-in time before departure.`
      },
      {
        name: `Guesthouses in ${selectedDistrict}`,
        area: selectedDistrict,
        address: `guest house in ${mapDistrict}`,
        distance: 'Local stays',
        phone: '',
        displayPhone: 'Ask locally',
        note: 'Guesthouses are often the practical option outside major tourist hubs. Ask about hot water, meals, Wi-Fi, and cash payment.'
      },
      {
        name: `Homestays near ${selectedDistrict}`,
        area: 'Community stays',
        address: `homestay near ${mapDistrict}`,
        distance: 'Verify locally',
        phone: '',
        displayPhone: 'Confirm with host',
        note: 'For rural areas, confirm food, transport, and phone signal before arriving late in the day.'
      }
    ]
  };
}

function NearbyHotels({ selectedDistrict }: { selectedDistrict: string }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  const lodging = getDistrictLodging(selectedDistrict);
  const openNavigation = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => Alert.alert('Navigation unavailable', 'Unable to open maps on this device.'));
  };

  const callHotel = (phone: string, displayPhone: string) => {
    if (!phone) {
      Alert.alert('Call locally', `No verified phone saved yet. ${displayPhone}.`);
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Calling unavailable', `Call the hotel at ${displayPhone}.`));
  };

  return (
    <View style={[styles.hotelList, desktop && styles.hotelListDesktop]}>
      <View style={styles.hotelLocationNote}>
        <Ionicons name="location-outline" size={16} color={colors.teal} />
        <Text style={styles.hotelLocationText}>{lodging.note}</Text>
        <Badge tone={lodging.live ? 'ok' : 'blue'}>{lodging.live ? 'LIVE' : 'GUIDE'}</Badge>
      </View>
      {lodging.hotels.map((hotel) => (
        <View key={hotel.name} style={styles.hotelRow}>
          <View style={styles.hotelIcon}>
            <Ionicons name="bed-outline" size={21} color={colors.goldLight} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <Text style={styles.hotelArea}>{hotel.area} · {hotel.distance}</Text>
            <Text style={styles.hotelNote}>{hotel.note}</Text>
            <View style={styles.hotelActions}>
              <Pressable accessibilityRole="button" onPress={() => openNavigation(hotel.address)} style={styles.hotelNavigateButton}>
                <Ionicons name="navigate" size={15} color="#1a0f00" />
                <Text style={styles.hotelNavigateText}>Search map</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => callHotel(hotel.phone, hotel.displayPhone)} style={styles.hotelCallButton}>
                <Ionicons name="call-outline" size={15} color={colors.teal} />
                <Text style={styles.hotelCallText}>{hotel.phone ? 'Call' : 'Ask locally'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function OfflineReadyBanner() {
  return (
    <View style={styles.offlineReadyBanner}>
      <View style={styles.offlineReadyIcon}>
        <Ionicons name="cloud-offline-outline" size={24} color={colors.goldLight} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.offlineReadyTitle}>You are offline, but Yatri is ready</Text>
        <Text style={styles.offlineReadyText}>Saved district guidance, emergency tools, phrases, and downloaded packs remain available.</Text>
      </View>
    </View>
  );
}

function FairPriceChecker({
  selectedDistrict,
  priceFocus,
  onPriceFocusChange
}: {
  selectedDistrict: string;
  priceFocus: 'fair' | 'rides';
  onPriceFocusChange: (focus: 'fair' | 'rides') => void;
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FairPriceCategory | 'All'>(priceFocus === 'rides' ? 'Transport' : 'All');
  const [quotedPrice, setQuotedPrice] = useState('');
  const categories: (FairPriceCategory | 'All')[] = ['All', 'Food', 'Transport', 'Shopping', 'Permits', 'Connectivity'];
  const normalizedQuery = query.trim().toLowerCase();
  const districtItems = fairPriceCatalog.filter((item) => item.district === selectedDistrict || item.district === 'Kathmandu');
  const filtered = districtItems.filter((item) => {
    const categoryMatch = category === 'All' || item.category === category;
    const queryMatch = !normalizedQuery || item.item.toLowerCase().includes(normalizedQuery) || item.tip.toLowerCase().includes(normalizedQuery) || item.category.toLowerCase().includes(normalizedQuery);
    return categoryMatch && queryMatch;
  });
  const featured = filtered[0] ?? districtItems[0] ?? fairPriceCatalog[0];
  const featuredConfidence = getPriceConfidence(featured);
  const quoted = Number(quotedPrice.replace(/[^0-9.]/g, ''));
  const hasQuote = Number.isFinite(quoted) && quoted > 0;
  const verdict = !hasQuote
    ? { label: 'Enter a quoted price', color: colors.muted, tone: 'muted' as const, detail: 'Yatri will compare it with the selected fair range.' }
    : featured.high === 0
      ? { label: 'Check official price', color: colors.gold, tone: 'warn' as const, detail: 'This item needs an official counter or licensed agency check.' }
      : quoted <= featured.high
        ? { label: 'Looks within range', color: colors.teal, tone: 'ok' as const, detail: 'Still confirm what is included before paying.' }
        : quoted <= featured.high * 1.35
          ? { label: 'Slightly high', color: colors.gold, tone: 'warn' as const, detail: 'Ask politely for a lower price or compare another seller.' }
          : { label: 'Likely overcharge', color: colors.danger, tone: 'danger' as const, detail: 'Step away, compare alternatives, or use an official counter/app.' };

  const chooseCategory = (next: FairPriceCategory | 'All') => {
    setCategory(next);
    if (next === 'Transport') onPriceFocusChange('rides');
    else if (priceFocus === 'rides') onPriceFocusChange('fair');
  };

  return (
    <View style={styles.priceChecker}>
      <View style={styles.priceHeroCard}>
        <View style={styles.priceHeroIcon}>
          <Ionicons name="calculator-outline" size={24} color="#1a0f00" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.priceHeroTitle}>Fair price checker</Text>
          <Text style={styles.priceHeroText}>Compare dated Kathmandu, Pokhara, and Chitwan observations before paying for taxis, SIMs, meals, permits, and common tourist purchases.</Text>
        </View>
      </View>

      <View style={styles.priceSearchBox}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput accessibilityLabel="Search fair prices" onChangeText={setQuery} placeholder="Search taxi, momo, SIM, pashmina..." placeholderTextColor={colors.dim} style={styles.priceSearchInput} value={query} />
        {query.length > 0 && (
          <Pressable accessibilityLabel="Clear price search" onPress={() => setQuery('')} style={styles.districtClearButton}>
            <Ionicons name="close" size={16} color={colors.dim} />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priceCategoryList}>
        {categories.map((option) => {
          const selected = category === option;
          return (
            <Pressable key={option} onPress={() => chooseCategory(option)} style={[styles.priceCategoryChip, selected && styles.priceCategoryChipSelected]}>
              <Text style={[styles.priceCategoryText, selected && styles.priceCategoryTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.priceCompareCard}>
        <View style={styles.priceCompareHeader}>
          <View style={styles.flex}>
            <Text style={styles.priceCompareLabel}>COMPARE AGAINST</Text>
            <Text style={styles.priceCompareItem}>{featured.item}</Text>
            <Text style={styles.priceCompareRange}>{featured.high === 0 ? 'Official price required' : 'Rs. ' + featured.low.toLocaleString() + '-' + featured.high.toLocaleString() + ' / ' + featured.unit}</Text>
          </View>
          <View style={styles.priceBadgeStack}>
            <Badge tone={featured.risk === 'High' ? 'danger' : featured.risk === 'Medium' ? 'warn' : 'ok'}>{featured.risk} risk</Badge>
            <Badge tone={featuredConfidence.tone}>{featuredConfidence.label}</Badge>
          </View>
        </View>
        <View style={styles.priceQuoteRow}>
          <TextInput accessibilityLabel="Quoted price in rupees" keyboardType="numeric" onChangeText={setQuotedPrice} placeholder="Quoted Rs." placeholderTextColor={colors.dim} style={styles.priceQuoteInput} value={quotedPrice} />
          <View style={[styles.priceVerdict, { borderColor: `${verdict.color}66` }] }>
            <Badge tone={verdict.tone}>{verdict.label}</Badge>
            <Text style={styles.priceVerdictText}>{verdict.detail}</Text>
          </View>
        </View>
        <Text style={styles.pricePhraseLarge}>Say: “{featured.phrase}”</Text>
        <Text style={styles.priceTip}>{featured.tip}</Text>
        <Text style={styles.priceObservationSource}>{featured.source}</Text>
      </View>

      <View style={styles.priceResultsHeader}>
        <Text style={styles.priceResultsTitle}>{filtered.length} price observations</Text>
        <Text style={styles.priceResultsDistrict}>{selectedDistrict === 'Kaski' ? 'Pokhara' : selectedDistrict} launch corridor</Text>
      </View>

      <View style={[styles.stack, desktop && styles.desktopTwoColumnGrid]}>
        {filtered.map((item) => {
          const confidence = getPriceConfidence(item);
          return (
            <Pressable key={`${item.district}-${item.item}`} onPress={() => { setQuery(item.item); setCategory(item.category); setQuotedPrice(''); }} style={styles.fairPriceRow}>
              <View style={styles.fairPriceIcon}>
                <Ionicons name={item.category === 'Transport' ? 'car-outline' : item.category === 'Food' ? 'restaurant-outline' : item.category === 'Connectivity' ? 'phone-portrait-outline' : item.category === 'Permits' ? 'document-text-outline' : 'bag-outline'} size={20} color={colors.teal} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.fairPriceName}>{item.item}</Text>
                <Text style={styles.fairPriceMeta}>{item.category} · {item.district} · {item.source}</Text>
                <View style={styles.priceConfidenceRow}>
                  <Badge tone={confidence.tone}>{confidence.label}</Badge>
                  <Text style={styles.priceConfidenceText}>{confidence.detail}</Text>
                </View>
                <Text style={styles.fairPriceTip}>{item.tip}</Text>
              </View>
              <View style={styles.fairPriceRangeBox}>
                <Text style={styles.fairPriceRange}>{item.high === 0 ? 'Official' : 'Rs. ' + item.low.toLocaleString() + '-' + item.high.toLocaleString()}</Text>
                <Text style={styles.fairPriceUnit}>{item.unit}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.contentSource}>{fairPriceSourceNote}</Text>
    </View>
  );
}

function getPriceConfidence(item: FairPriceItem): { detail: string; label: string; tone: 'ok' | 'warn' | 'danger' | 'blue' | 'muted' } {
  if (item.high === 0 || item.source.toLowerCase().includes('official')) {
    return { detail: 'Confirm at an official counter before paying.', label: 'Official check', tone: 'warn' };
  }
  if (item.district === 'Kathmandu' && item.risk !== 'High') {
    return { detail: 'Dated community observation with lower-risk variance.', label: 'Higher confidence', tone: 'ok' };
  }
  if (launchDistricts.includes(item.district)) {
    return { detail: 'Launch-area observation; verify inclusions and timing.', label: 'Medium confidence', tone: 'blue' };
  }
  return { detail: 'Use as a starting point only; Yatri is collecting fresher samples.', label: 'Needs samples', tone: 'muted' };
}

function ReferencePriceList({ items, icon }: { items: PriceItem[]; icon: IconName }) {
  return (
    <View style={styles.stack}>
      {items.map((item) => (
        <View key={item.name} style={styles.referencePriceRow}>
          <View style={styles.referencePriceIcon}>
            <Ionicons name={icon} size={19} color={colors.teal} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.referencePriceName}>{item.name}</Text>
            <Text style={styles.referencePriceNote}>{item.note}</Text>
          </View>
          <View style={styles.referencePriceValueWrap}>
            <Text style={styles.referencePriceValue}>{item.price}</Text>
            <Text style={[styles.referencePriceBadge, item.good && styles.referencePriceBadgeGood]}>{item.badge}</Text>
          </View>
        </View>
      ))}
      <Text style={styles.contentSource}>Community price reference—not an official tariff · reviewed July 5, 2026 · confirm locally before paying</Text>
    </View>
  );
}

function DistrictBriefingSelector({ selectedDistrict, onSelectDistrict }: { selectedDistrict: string; onSelectDistrict: (district: string) => void }) {
  const { width } = useWindowDimensions();
  const stackSecondarySites = width < 1200;
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtPickerOpen, setDistrictPickerOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const selectedDirectoryItem = districtDirectory.find((item) => item.district === selectedDistrict) ?? districtDirectory.find((item) => item.district === 'Kathmandu')!;
  const detailedBriefing = districtBriefings.find((item) => item.district === selectedDistrict);
  const famousSites = districtSites.filter((site) => site.district === selectedDistrict);
  const activeDistrict: DistrictBriefing = detailedBriefing ?? {
    district: selectedDirectoryItem.district,
    province: selectedDirectoryItem.province,
    base: 'District headquarters or main bazaar',
    elevation: 'Varies by route',
    bestFor: 'Save this district for offline notes, emergency contacts, and scam reports as Yatri adds richer local guidance.',
    connectivity: 'Mixed',
    transport: 'Confirm road conditions, fares, and last departures locally before leaving the main town.',
    etiquette: 'Ask before photographing people, homes, ceremonies, or religious spaces; follow local signs and host guidance.',
    safety: 'Use official counters where available, keep emergency contacts saved, and report suspicious activity with location details.',
    icon: 'map-outline'
  };
  const connectivityColor = activeDistrict.connectivity === 'Strong'
    ? colors.teal
    : activeDistrict.connectivity === 'Mixed'
      ? colors.gold
      : colors.danger;
  const normalizedSearch = districtSearch.trim().toLowerCase();
  const launchDistrictDirectory = districtDirectory.filter((item) => launchDistricts.includes(item.district));
  const filteredDistricts = launchDistrictDirectory.filter((item) => {
    if (!normalizedSearch) return true;
    const searchableName = item.district === 'Kaski' ? 'kaski pokhara' : item.district.toLowerCase();
    return searchableName.includes(normalizedSearch) || item.province.toLowerCase().includes(normalizedSearch);
  });

  useEffect(() => {
    void getSavedDistrictPacks().then((packs) => setSavedAt(packs[selectedDistrict]?.savedAt ?? null));
  }, [selectedDistrict]);

  const downloadPack = async () => {
    const saved = await saveDistrictPack(selectedDistrict, { ...activeDistrict, famousSites });
    setSavedAt(saved.savedAt);
  };

  const chooseDistrict = (district: string) => {
    onSelectDistrict(district);
    setDistrictSearch('');
    setDistrictPickerOpen(false);
  };

  return (
    <View style={styles.districtFeature}>
      <View style={styles.districtSearchPanel}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: districtPickerOpen }}
          onPress={() => setDistrictPickerOpen((open) => !open)}
          style={[styles.districtPickerButton, districtPickerOpen && styles.districtPickerButtonOpen]}
        >
          <View style={styles.districtPickerIcon}>
            <Ionicons name="location-outline" size={21} color={colors.goldLight} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.districtSearchLabel}>SELECT DISTRICT</Text>
            <Text style={styles.districtPickerName}>{selectedDirectoryItem.district}</Text>
            <Text style={styles.districtSearchHint}>{selectedDirectoryItem.province}</Text>
          </View>
          <View style={styles.districtCountBadge}>
            <Text style={styles.districtCountText}>{filteredDistricts.length}/3</Text>
          </View>
          <Ionicons name={districtPickerOpen ? 'chevron-up' : 'chevron-down'} size={22} color={colors.muted} />
        </Pressable>

        {districtPickerOpen && (
          <>
        <View style={styles.districtSearchBox}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            accessibilityLabel="Search Nepal districts"
            autoCapitalize="words"
            onChangeText={setDistrictSearch}
            placeholder="Search Kathmandu, Pokhara or Chitwan..."
            placeholderTextColor={colors.dim}
            style={styles.districtSearchInput}
            value={districtSearch}
          />
          {districtSearch.length > 0 && (
            <Pressable accessibilityLabel="Clear district search" onPress={() => setDistrictSearch('')} style={styles.districtClearButton}>
              <Ionicons name="close" size={16} color={colors.dim} />
            </Pressable>
          )}
        </View>

        <ScrollView style={styles.districtList} contentContainerStyle={styles.districtListContent} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {filteredDistricts.map((item) => {
            const selected = item.district === selectedDistrict;
            const hasGuide = districtSites.some((site) => site.district === item.district);
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item.district}
                onPress={() => chooseDistrict(item.district)}
                style={[styles.districtListItem, selected && styles.districtListItemSelected]}
              >
                <View style={[styles.districtListIcon, selected && styles.districtListIconSelected]}>
                  <Text style={[styles.districtInitial, selected && styles.districtInitialSelected]}>{item.district.charAt(0)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.districtListName, selected && styles.districtListNameSelected]}>{item.district}</Text>
                  <Text style={styles.districtListProvince}>{item.province}</Text>
                </View>
                {hasGuide && <Text style={styles.districtGuideBadge}>GUIDE</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
          </>
        )}
      </View>

      <View style={styles.districtBriefing}>
        <View style={styles.districtHeading}>
          <View style={styles.districtIcon}>
            <Ionicons name={activeDistrict.icon} size={24} color={colors.goldLight} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.districtName}>{activeDistrict.district}</Text>
            <Text style={styles.districtProvince}>{activeDistrict.province}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={downloadPack} style={styles.districtOfflineBadge}>
            <Ionicons name={savedAt ? 'cloud-done-outline' : 'cloud-download-outline'} size={14} color={colors.teal} />
            <Text style={styles.districtOfflineText}>{savedAt ? 'SAVED' : 'DOWNLOAD'}</Text>
          </Pressable>
        </View>

        {!detailedBriefing && (
          <View style={styles.districtStarterNotice}>
            <Ionicons name="information-circle-outline" size={17} color={colors.goldLight} />
            <Text style={styles.districtStarterText}>Core travel notes for this district; its famous-site guide is ready below.</Text>
          </View>
        )}

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
        {famousSites.length > 0 && <View style={styles.famousSitesSection}>
          <View style={styles.famousSitesHeading}>
            <View style={styles.flex}>
              <Text style={styles.famousSitesEyebrow}>FAMOUS SITES</Text>
              <Text style={styles.famousSitesTitle}>What to see in {selectedDistrict}</Text>
            </View>
            <View style={styles.famousSitesCount}><Text style={styles.famousSitesCountText}>{famousSites.length}</Text></View>
          </View>
          <DistrictSiteCard featured key={`${famousSites[0].district}-${famousSites[0].name}`} site={famousSites[0]} />
          {famousSites.length > 1 && (
            <View style={[styles.famousSitesList, stackSecondarySites && styles.famousSitesListStacked]}>
              {famousSites.slice(1).map((site) => <DistrictSiteCard compact={stackSecondarySites} key={`${site.district}-${site.name}`} site={site} />)}
            </View>
          )}
        </View>}
        <Text style={styles.districtFreshness}>{savedAt ? `Offline copy saved ${new Date(savedAt).toLocaleDateString()} · ` : ''}Launch corridor guide · Kathmandu, Pokhara and Chitwan · reviewed July 6, 2026</Text>
      </View>
    </View>
  );
}

function DistrictSiteCard({ compact = false, featured = false, site }: { compact?: boolean; featured?: boolean; site: DistrictSite }) {
  const { width } = useWindowDimensions();
  const horizontalFeature = featured && width >= 1200;
  const openMap = () => {
    const query = encodeURIComponent(`${site.name}, ${site.district}, Nepal`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
      .catch(() => Alert.alert('Map unavailable', `Search for ${site.name} in ${site.district}.`));
  };

  return (
    <View style={[styles.famousSiteCard, compact && styles.famousSiteCardCompact, featured && styles.famousSiteCardFeatured, horizontalFeature && styles.famousSiteCardFeaturedDesktop]}>
      <ImageBackground source={{ uri: site.image }} style={[styles.famousSitePhoto, featured && styles.famousSitePhotoFeatured, horizontalFeature && styles.famousSitePhotoFeaturedDesktop]} imageStyle={styles.famousSiteImage as any}>
        <LinearGradient colors={['transparent', 'rgba(4,12,18,0.96)']} style={styles.famousSiteGradient} />
        <View style={styles.famousSitePhotoCopy}>
          <Text style={styles.famousSitePlace}>{site.place}</Text>
          <Text style={styles.famousSiteName}>{site.name}</Text>
        </View>
      </ImageBackground>
      <View style={styles.famousSiteBody}>
        <Text style={styles.famousSiteExperience}>{site.experience}</Text>
        <View style={styles.famousSiteMetaRow}>
          <Ionicons name="sunny-outline" size={17} color={colors.gold} />
          <View style={styles.flex}><Text style={styles.famousSiteMetaLabel}>BEST TIME</Text><Text style={styles.famousSiteMetaText}>{site.bestTime}</Text></View>
        </View>
        <View style={styles.famousSiteMetaRow}>
          <Ionicons name="heart-outline" size={17} color={colors.teal} />
          <View style={styles.flex}><Text style={styles.famousSiteMetaLabel}>TRAVEL RESPECTFULLY</Text><Text style={styles.famousSiteMetaText}>{site.respect}</Text></View>
        </View>
        <Pressable accessibilityRole="link" onPress={openMap} style={styles.famousSiteMapButton}>
          <Ionicons name="navigate-outline" size={17} color="#1a0f00" />
          <Text style={styles.famousSiteMapText}>View on map</Text>
        </Pressable>
        <Text style={styles.famousSiteImageNote}>{site.imageNote}</Text>
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

function ModeButton({ mode, selected, onPress }: { mode: TravelMode; selected: boolean; onPress: () => void }) {
  const config = modeConfig[mode];
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.modeButton, selected && { backgroundColor: `${config.accent}24`, borderColor: config.accent }]}>
      <Text style={[styles.modeButtonText, selected && { color: config.secondary }]}>{config.title}</Text>
    </Pressable>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  return (
    <View style={[styles.sectionHeader, desktop && styles.sectionHeaderDesktop]}>
      <Text style={[styles.sectionLabel, desktop && styles.sectionLabelDesktop]}>{label}</Text>
      <Text style={[styles.sectionTitle, desktop && styles.sectionTitleDesktop]}>{title}</Text>
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
        <Badge tone={pack.progress >= 1 ? 'ok' : 'warn'}>{pack.status}</Badge>
      </View>
    </View>
  );
}

function ExploreSectionHeading({ action, label, title }: { action?: string; label: string; title: string }) {
  return (
    <View style={styles.exploreSectionHeading}>
      <View>
        <Text style={styles.exploreSectionLabel}>{label}</Text>
        <Text style={styles.exploreSectionTitle}>{title}</Text>
      </View>
      {action && (
        <Pressable accessibilityRole="button" style={styles.exploreViewAll}>
          <Text style={styles.exploreViewAllText}>{action}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

function DestinationCard({
  destination,
  onPress
}: {
  destination: typeof featuredDestinations[number];
  onPress: () => void;
}) {
  const briefing = districtBriefings.find((item) => item.district === destination.district);
  const signal = briefing?.connectivity ? `${briefing.connectivity} signal` : destination.region;

  return (
    <Pressable
      accessibilityLabel={`Explore ${destination.title}, ${destination.region}. ${destination.reason}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.destinationCard, pressableLift(pressed)]}
    >
      <ImageBackground
        accessibilityLabel={`${destination.title} destination photograph`}
        source={{ uri: destination.image }}
        style={styles.destinationImage}
        imageStyle={styles.destinationImageRadius as any}
      >
        <LinearGradient colors={['rgba(7,6,15,0.06)', 'rgba(7,6,15,0.84)']} style={styles.destinationImageGradient} />
        <View style={styles.destinationTagPill}>
          <Ionicons name={destination.category === 'Nature' ? 'leaf-outline' : 'sparkles-outline'} size={14} color={colors.goldLight} />
          <Text style={styles.destinationTagPillText}>{destination.category}</Text>
        </View>
      </ImageBackground>
      <View style={styles.destinationBody}>
        <Text style={styles.destinationName}>{destination.title}</Text>
        <Text style={styles.destinationRegion}>{destination.region}</Text>
        <View style={styles.destinationTags}>
          {destination.tags.map((tag) => (
            <Text key={tag} style={styles.destinationTag}>{tag}</Text>
          ))}
        </View>
        <Text style={styles.destinationReason}>{destination.reason}</Text>
        <View style={styles.destinationFooter}>
          <Text style={styles.destinationSignal}>{signal}</Text>
          <View style={styles.destinationArrow}>
            <Ionicons name="arrow-forward" size={16} color="#1a0f00" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function FestivalPhotoCard({ festival }: { festival: Festival }) {
  return (
    <View style={styles.festivalPhoto}>
      <ImageBackground
        accessibilityLabel={`${festival.name} festival photograph`}
        source={{ uri: festival.image }}
        style={styles.festivalImageWrap}
        imageStyle={styles.festivalImage as any}
      >
        <LinearGradient colors={['rgba(7,6,15,0.02)', 'rgba(7,6,15,0.52)']} style={styles.festivalImageGradient} />
        <Text style={[styles.countdown, { backgroundColor: festival.accent }]}>{festival.countdown}</Text>
      </ImageBackground>
      <View style={styles.festivalCopy}>
        <Text style={styles.festivalCrowd}>{festival.crowd}</Text>
        <Text style={styles.festivalName}>{festival.name}</Text>
        <Text style={styles.festivalLocation}>{festival.date}</Text>
        <Text style={styles.festivalWhy}>{festival.description}</Text>
        <Pressable accessibilityRole="button" style={styles.festivalLink}>
          <Text style={styles.festivalLinkText}>View festival</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.goldLight} />
        </Pressable>
      </View>
    </View>
  );
}

function DiscoverCard({ item }: { item: DiscoverItem }) {
  return (
    <ImageBackground accessibilityLabel={`${item.title} experience photograph`} source={{ uri: item.image }} style={styles.discoverCard} imageStyle={styles.discoverImage as any}>
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

function PersonalizedForYou({
  onAction,
  plan
}: {
  onAction: (action: PersonalizedAction) => void;
  plan: PersonalizedPlan;
}) {
  return (
    <View style={styles.personalizedPanel}>
      <View style={styles.personalizedHeader}>
        <View style={styles.personalizedIcon}>
          <Ionicons name="sparkles-outline" size={22} color={colors.goldLight} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.personalizedLabel}>{plan.label}</Text>
          <Text style={styles.personalizedTitle}>{plan.title}</Text>
          <Text style={styles.personalizedSummary}>{plan.summary}</Text>
        </View>
      </View>

      <View style={styles.personalizedTagRow}>
        {plan.tags.map((tag) => (
          <Text key={tag} style={styles.personalizedTag}>{tag}</Text>
        ))}
      </View>

      <View style={styles.personalizedCardGrid}>
        {plan.cards.map((card) => (
          <View key={card.title} style={styles.personalizedCard}>
            <View style={[styles.personalizedCardIcon, { backgroundColor: `${card.accent}24` }]}>
              <Ionicons name={card.icon} size={20} color={card.accent} />
            </View>
            <Text style={styles.personalizedCardTitle}>{card.title}</Text>
            <Text style={styles.personalizedCardBody}>{card.body}</Text>
          </View>
        ))}
      </View>

      <View style={styles.personalizedActions}>
        {plan.actions.map((action) => (
          <Pressable accessibilityRole="button" key={action.label} onPress={() => onAction(action)} style={styles.personalizedActionButton}>
            <Ionicons name={action.icon} size={17} color="#1a0f00" />
            <Text style={styles.personalizedActionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
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
  const reportTypes = [
    { value: 'taxi_overcharge', label: 'Taxi overcharge' },
    { value: 'fake_permit', label: 'Fake permit' },
    { value: 'gem_scam', label: 'Gem scam' },
    { value: 'aggressive_seller', label: 'Aggressive seller' },
    { value: 'other', label: 'Other' }
  ];
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [reporting, setReporting] = useState(false);
  const [reportType, setReportType] = useState(reportTypes[0].value);
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [reportLocation, setReportLocation] = useState<SavedLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('Loading community reports…');

  const loadReports = async () => {
    try {
      const synced = await syncPendingReports();
      const live = await listSafetyReports();
      setReports(live);
      setStatusText(synced ? `Synced ${synced} offline report${synced === 1 ? '' : 's'}.` : live.length ? 'Live reports updated.' : 'No community reports in this area yet.');
    } catch {
      setStatusText('Offline: reports you submit will sync when a connection returns.');
    }
  };

  useEffect(() => {
    void loadReports();
    return subscribeToSafetyReports(() => { void loadReports(); });
  }, []);

  const beginReport = async () => {
    triggerTactileFeedback();
    const location = await getForegroundLocation(true);
    if (!location) {
      Alert.alert('Location required', 'Allow foreground location so the report can be placed accurately. Yatri does not request background location.');
      return;
    }
    setReportLocation(location);
    setReporting(true);
  };

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const submitReport = async () => {
    if (!reportLocation || description.trim().length < 10) {
      Alert.alert('Add a little detail', 'Describe what happened in at least 10 characters. Do not include passport, payment-card, or other sensitive information.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitSafetyReport({
        category: reportType,
        description,
        latitude: reportLocation.latitude,
        longitude: reportLocation.longitude,
        district: 'Kathmandu',
        photoUri
      });
      setReporting(false);
      setDescription('');
      setPhotoUri(null);
      setStatusText(result.queued ? 'Saved offline. It will sync after you sign in and reconnect.' : result.duplicateId ? 'Matched an existing nearby report and added your confirmation.' : 'Community report submitted for moderation.');
      await loadReports();
    } catch (error) {
      Alert.alert('Report not submitted', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmReport = async (reportId: string) => {
    try {
      await voteForReport(reportId);
      await loadReports();
    } catch (error) {
      Alert.alert('Could not confirm report', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const flagReport = async (reportId: string) => {
    try {
      await flagSafetyReport(reportId);
      Alert.alert('Report flagged', 'Thanks. A moderator will review this community report.');
    } catch (error) {
      Alert.alert('Could not flag report', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <>
      <View style={styles.scamMap}>
        <View style={styles.mapLiveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>COMMUNITY SAFETY REPORTS</Text>
          <Text style={styles.liveCount}>{reports.length} recent</Text>
        </View>
        <View style={[styles.mapRoad, styles.mapRoadOne]} />
        <View style={[styles.mapRoad, styles.mapRoadTwo]} />
        <View style={[styles.mapRoad, styles.mapRoadThree]} />
        <Text style={[styles.mapPlace, styles.mapPlaceThamel]}>Thamel</Text>
        <Text style={[styles.mapPlace, styles.mapPlaceDurbar]}>Durbar Square</Text>
        <Text style={[styles.mapPlace, styles.mapPlaceAirport]}>Airport</Text>
        {reports.slice(0, 12).map((report) => {
          const left = Math.max(7, Math.min(93, 50 + (report.longitude - 85.324) * 500));
          const top = Math.max(20, Math.min(88, 55 - (report.latitude - 27.717) * 500));
          const verified = report.verification_status === 'verified';
          return (
            <View key={report.id} style={[styles.scamPin, { backgroundColor: verified ? colors.teal : colors.gold, borderColor: colors.white, left: `${left}%`, top: `${top}%` }]}>
              <Text style={styles.scamPinCount}>{Math.max(1, report.vote_count + 1)}</Text>
            </View>
          );
        })}
        {reportLocation && (
          <View style={styles.currentLocation}>
            <Ionicons name="navigate" size={13} color={colors.white} />
          </View>
        )}
      </View>

      <Text style={styles.reportStatusText}>{statusText}</Text>

      <View style={styles.stack}>
        {reports.map((report) => {
          const verified = report.verification_status === 'verified';
          const label = reportTypes.find((type) => type.value === report.category)?.label ?? 'Safety report';
          return (
            <View key={report.id} style={styles.scamAlertRow}>
              <View style={[styles.scamAlertIcon, { backgroundColor: verified ? 'rgba(62,207,178,0.12)' : 'rgba(245,166,35,0.12)' }]}>
                <Ionicons name={verified ? 'shield-checkmark' : 'people'} size={19} color={verified ? colors.teal : colors.gold} />
              </View>
              <View style={styles.flex}>
                <View style={styles.rowBetween}>
                  <Text style={styles.scamAlertTitle}>{label}</Text>
                  <Badge tone={verified ? 'ok' : 'warn'}>{verified ? 'Verified alert' : 'Community report'}</Badge>
                </View>
                <Text style={styles.scamAlertLocation}>{report.district ?? 'Nearby'} · {formatLocationAge(new Date(report.created_at).getTime())}</Text>
                <Text style={styles.cardText}>{report.description}</Text>
                <View style={styles.reportActionRow}>
                  <Pressable accessibilityRole="button" onPress={() => confirmReport(report.id)} style={styles.confirmReportButton}>
                    <Ionicons name="checkmark-circle-outline" size={15} color={colors.teal} />
                    <Text style={styles.confirmReportText}>I saw this too · {report.vote_count}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => flagReport(report.id)} style={styles.confirmReportButton}>
                    <Ionicons name="flag-outline" size={15} color={colors.danger} />
                    <Text style={styles.flagReportText}>Flag</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {reporting && (
        <View style={styles.scamReportPanel}>
          <View style={styles.scamReportHeading}>
            <View style={styles.flex}>
              <Text style={styles.scamReportTitle}>What happened?</Text>
              <Text style={styles.scamReportSubtitle}>Community reports remain unverified until a moderator confirms them.</Text>
            </View>
            <Pressable accessibilityLabel="Close scam report" accessibilityRole="button" onPress={() => setReporting(false)} style={styles.scamReportClose}>
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>
          <View style={styles.scamReportTypes}>
            {reportTypes.map((type) => {
              const selected = reportType === type.value;
              return (
                <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} key={type.value} onPress={() => setReportType(type.value)} style={[styles.scamReportType, selected && styles.scamReportTypeSelected]}>
                  <Text style={[styles.scamReportTypeText, selected && styles.scamReportTypeTextSelected]}>{type.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            maxLength={1000}
            multiline
            onChangeText={setDescription}
            placeholder="What happened? Include landmarks, not private personal details."
            placeholderTextColor={colors.dim}
            style={styles.scamDescriptionInput}
            value={description}
          />
          <Pressable accessibilityRole="button" onPress={choosePhoto} style={styles.reportPhotoButton}>
            <Ionicons name="image-outline" size={17} color={colors.goldLight} />
            <Text style={styles.reportPhotoText}>{photoUri ? 'Photo attached' : 'Attach optional photo'}</Text>
          </Pressable>
          <Text style={styles.reportLocationText}>{reportLocation ? `GPS: ${formatCoordinates(reportLocation)} · foreground only` : 'Waiting for GPS'}</Text>
          <Pressable accessibilityRole="button" disabled={submitting} onPress={submitReport} style={[styles.scamReportSubmit, submitting && styles.buttonPressed]}>
            <Ionicons name="shield-checkmark-outline" size={17} color="#1a0f00" />
            <Text style={styles.scamReportSubmitText}>{submitting ? 'Saving…' : 'Submit community report'}</Text>
          </Pressable>
        </View>
      )}

      {!reporting && (
        <Pressable accessibilityRole="button" onPress={beginReport} style={styles.reportScamButton}>
          <Ionicons name="add-circle-outline" size={19} color="#1a0f00" />
          <Text style={styles.reportScamText}>Report suspicious activity</Text>
        </Pressable>
      )}
    </>
  );
}

function ModerationPanel() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [note, setNote] = useState('');

  const load = async () => setReports(await listPendingReports());
  useEffect(() => { void load(); }, []);

  const decide = async (reportId: string, status: 'verified' | 'rejected') => {
    try {
      await moderateReport(reportId, status, note);
      setNote('');
      await load();
    } catch (error) {
      Alert.alert('Moderation failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <>
      <PageHeading eyebrow="Admin moderation" title="Review community safety reports" />
      <Text style={styles.moderationNotice}>Verification means a moderator checked available evidence. It does not guarantee every detail.</Text>
      <TextInput maxLength={500} onChangeText={setNote} placeholder="Optional moderation note" placeholderTextColor={colors.dim} style={styles.contactInput} value={note} />
      <View style={styles.stack}>
        {reports.length ? reports.map((report) => {
          const flagCount = report.report_flags?.length ?? 0;
          return (
          <View key={report.id} style={styles.scamAlertRow}>
            <View style={styles.flex}>
              <Text style={styles.scamAlertTitle}>{report.category.replace(/_/g, ' ')}</Text>
              <Text style={styles.scamAlertLocation}>{formatCoordinates({ latitude: report.latitude, longitude: report.longitude, accuracy: null, timestamp: new Date(report.created_at).getTime() })}</Text>
              {flagCount > 0 && <Text style={styles.moderationFlagText}>{flagCount} traveler flag{flagCount === 1 ? '' : 's'} for moderator review</Text>}
              <Text style={styles.cardText}>{report.description}</Text>
              <View style={styles.moderationActions}>
                <Pressable onPress={() => decide(report.id, 'verified')} style={styles.verifyButton}><Text style={styles.verifyButtonText}>Verify</Text></Pressable>
                <Pressable onPress={() => decide(report.id, 'rejected')} style={styles.rejectButton}><Text style={styles.rejectButtonText}>Reject</Text></Pressable>
              </View>
            </View>
          </View>
        );
        }) : <Text style={styles.reportStatusText}>No reports waiting for review.</Text>}
      </View>
    </>
  );
}

function CultureBites({ initialView = 'facts' }: { initialView?: 'facts' | 'phrases' }) {
  const [view, setView] = useState<'facts' | 'phrases'>(initialView);

  return (
    <View style={styles.cultureBites}>
      <View style={styles.cultureBiteTabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: view === 'facts' }}
          onPress={() => setView('facts')}
          style={[styles.cultureBiteTab, view === 'facts' && styles.cultureBiteTabSelected]}
        >
          <Ionicons name="bulb-outline" size={17} color={view === 'facts' ? '#1a0f00' : colors.muted} />
          <Text style={[styles.cultureBiteTabText, view === 'facts' && styles.cultureBiteTabTextSelected]}>Fun facts</Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: view === 'phrases' }}
          onPress={() => setView('phrases')}
          style={[styles.cultureBiteTab, view === 'phrases' && styles.cultureBiteTabSelected]}
        >
          <Ionicons name="chatbubbles-outline" size={17} color={view === 'phrases' ? '#1a0f00' : colors.muted} />
          <Text style={[styles.cultureBiteTabText, view === 'phrases' && styles.cultureBiteTabTextSelected]}>Common phrases</Text>
        </Pressable>
      </View>

      {view === 'facts' ? (
        <View style={styles.cultureFactList}>
          {cultureFacts.map((fact) => (
            <View key={fact.title} style={styles.cultureFactRow}>
              <View style={styles.cultureFactIcon}>
                <Ionicons name={fact.icon} size={20} color={colors.goldLight} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cultureFactTag}>{fact.tag}</Text>
                <Text style={styles.cultureFactTitle}>{fact.title}</Text>
                <Text style={styles.cultureFactText}>{fact.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.stack}>
          {phrases.map((phrase) => (
            <View key={phrase.roman} style={styles.phraseCard}>
              <Text style={styles.phraseNepali}>{phrase.nepali}</Text>
              <View style={styles.flex}>
                <Text style={styles.phraseEnglish}>{phrase.english}</Text>
                <Text style={styles.phraseTip}>{phrase.roman} · {phrase.tip}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

type LocalMessage = {
  id: number;
  sender: 'traveler' | 'guide';
  text: string;
};

function getLocalGuideReply(question: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes('taxi') || normalized.includes('ride') || normalized.includes('price') || normalized.includes('fair')) {
    return 'For taxis, compare Pathao/inDrive first when available. If a driver quotes a fixed fare, agree before entering and ask “meter ma janu huncha?” For Thamel to Boudha, Rs. 500-900 is a normal reference range depending on traffic.';
  }

  if (normalized.includes('temple') || normalized.includes('stupa') || normalized.includes('enter') || normalized.includes('photo')) {
    return 'At temples and stupas, watch the entrance signs first. Remove shoes where required, walk clockwise around stupas, and ask before photographing people, rituals, monks, or cremation areas.';
  }

  if (normalized.includes('guide') || normalized.includes('licensed') || normalized.includes('license')) {
    return 'Ask to see a guide ID or license before starting. Agree on the route, time, language, and total price first. Be careful if someone pressures you away from the official ticket counter.';
  }

  if (normalized.includes('food') || normalized.includes('momo') || normalized.includes('dal bhat') || normalized.includes('eat')) {
    return 'For local food, look for busy family restaurants and clear menu prices. Momo, dal bhat, milk tea, and Newari snacks are good starts. Ask “kati parcha?” before ordering if the price is not posted.';
  }

  if (normalized.includes('unsafe') || normalized.includes('scam') || normalized.includes('help') || normalized.includes('emergency')) {
    return 'Move to a public, well-lit place and avoid arguing over money in the street. Use Yatri Safety to report suspicious activity, save your location, and prepare an SOS message if you feel at risk.';
  }

  return 'Good question. Share the place, price, or situation, and I can help you decide what is normal, what to ask politely, and what warning signs to watch for.';
}

function AskALocalChat() {
  const [draft, setDraft] = useState('');
  const [selectedTip, setSelectedTip] = useState(100);
  const [messages, setMessages] = useState<LocalMessage[]>([
    { id: 1, sender: 'traveler', text: 'Is Rs. 900 fair for a taxi from Thamel to Boudha?' },
    { id: 2, sender: 'guide', text: 'That is high for normal traffic. Ask for the meter or compare Pathao before agreeing.' }
  ]);
  const quickQuestions = ['Is this taxi price fair?', 'Can I enter this temple?', 'Is this guide licensed?'];

  const sendQuestion = (override?: string) => {
    const question = (override ?? draft).trim();
    if (!question) return;
    const now = Date.now();

    setMessages((current) => [
      ...current,
      { id: now, sender: 'traveler', text: question },
      {
        id: now + 1,
        sender: 'guide',
        text: getLocalGuideReply(question)
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
          <Pressable key={question} onPress={() => sendQuestion(question)} style={styles.quickQuestion}>
            <Text style={styles.quickQuestionText}>{question}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.chatComposer}>
        <TextInput
          accessibilityLabel="Question for a local guide"
          onChangeText={setDraft}
          onSubmitEditing={() => sendQuestion()}
          placeholder="Ask a quick question..."
          placeholderTextColor={colors.dim}
          returnKeyType="send"
          style={styles.chatInput}
          value={draft}
        />
        <Pressable
          accessibilityLabel="Send question"
          accessibilityRole="button"
          onPress={() => sendQuestion()}
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
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [editingContact, setEditingContact] = useState(false);
  const [contactKind, setContactKind] = useState<'trusted' | 'embassy'>('trusted');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void getSavedLocation().then(setLocation);
    void listTrustedContacts().then(setContacts);
  }, []);

  const refreshLocation = async () => {
    setRefreshing(true);
    try {
      const current = await getForegroundLocation(true);
      if (current) setLocation(current);
      else Alert.alert('Location unavailable', 'Enable foreground location in device settings to create an accurate SOS message.');
    } finally {
      setRefreshing(false);
    }
  };

  const prepareSms = async () => {
    triggerTactileFeedback();
    if (!location) {
      Alert.alert('No GPS fix', 'Refresh your location before preparing an SOS message.');
      return;
    }
    const available = await SMS.isAvailableAsync();
    if (!available) {
      Alert.alert('Messages unavailable', 'SMS must be tested on a physical phone. Your coordinates are shown so you can copy them manually.');
      return;
    }
    const coordinates = formatCoordinates(location);
    const message = `SOS: I need help. My last GPS fix is ${coordinates} (${formatLocationAge(location.timestamp)}). Map: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    await SMS.sendSMSAsync(contacts.map((contact) => contact.phone), message);
  };

  const saveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      Alert.alert('Contact incomplete', 'Add a name and phone number.');
      return;
    }
    await saveTrustedContact({ kind: contactKind, name: contactName.trim(), phone: contactPhone.trim() });
    setContacts(await listTrustedContacts());
    setContactName('');
    setContactPhone('');
    setEditingContact(false);
  };

  const callEmergencyService = (number: string, label: string) => {
    Linking.openURL(`tel:${number}`).catch(() => Alert.alert('Calling unavailable', `Dial ${number} for ${label}.`));
  };

  return (
    <View style={styles.sosPanel}>
      <View style={styles.sosHeader}>
        <View style={styles.sosIcon}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.white} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.sosTitle}>Offline GPS SOS</Text>
          <Text style={styles.sosText}>Uses a foreground GPS fix and the phone network. Yatri never sends the message automatically.</Text>
        </View>
        <View style={[styles.offlineBadge, !location && styles.offlineBadgeWaiting]}>
          <View style={[styles.offlineStatusDot, !location && { backgroundColor: colors.gold }]} />
          <Text style={[styles.offlineBadgeText, !location && { color: colors.gold }]}>{location ? 'READY' : 'GPS NEEDED'}</Text>
        </View>
      </View>

      <View style={styles.gpsFix}>
        <Ionicons name="location" size={20} color={colors.danger} />
        <View style={styles.flex}>
          <Text style={styles.gpsLabel}>{location ? `LAST GPS FIX · ${formatLocationAge(location.timestamp).toUpperCase()}` : 'NO SAVED GPS FIX'}</Text>
          <Text style={styles.gpsCoordinates}>{location ? formatCoordinates(location) : 'Location not available'}</Text>
          <Text style={styles.gpsArea}>{location?.accuracy ? `Accuracy approximately ${Math.round(location.accuracy)} m` : 'Refresh while outdoors for better accuracy.'}</Text>
        </View>
        <Pressable accessibilityLabel="Refresh GPS location" accessibilityRole="button" disabled={refreshing} onPress={refreshLocation} style={styles.refreshLocationButton}>
          <Ionicons name="refresh" size={18} color={colors.goldLight} />
        </Pressable>
      </View>

      <View style={styles.sosRecipients}>
        {contacts.length ? contacts.map((contact) => (
          <View key={contact.id} style={styles.recipientRow}>
            <Ionicons name={contact.kind === 'embassy' ? 'business-outline' : 'person-outline'} size={17} color={contact.kind === 'embassy' ? colors.goldLight : colors.teal} />
            <Text style={styles.recipientText}>{contact.name}</Text>
            <Text style={styles.recipientStatus}>{contact.phone}</Text>
          </View>
        )) : <Text style={styles.emptyContactsText}>Add an embassy or trusted contact before an emergency.</Text>}
      </View>

      {editingContact ? (
        <View style={styles.contactEditor}>
          <View style={styles.contactKindRow}>
            {(['trusted', 'embassy'] as const).map((kind) => (
              <Pressable key={kind} onPress={() => setContactKind(kind)} style={[styles.contactKindButton, contactKind === kind && styles.contactKindButtonActive]}>
                <Text style={styles.contactKindText}>{kind === 'trusted' ? 'Trusted contact' : 'Embassy'}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput onChangeText={setContactName} placeholder="Contact name" placeholderTextColor={colors.dim} style={styles.contactInput} value={contactName} />
          <TextInput keyboardType="phone-pad" onChangeText={setContactPhone} placeholder="Phone number" placeholderTextColor={colors.dim} style={styles.contactInput} value={contactPhone} />
          <Pressable onPress={saveContact} style={styles.saveContactButton}><Text style={styles.saveContactText}>Save contact</Text></Pressable>
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => setEditingContact(true)} style={styles.addContactButton}>
          <Ionicons name="person-add-outline" size={16} color={colors.goldLight} />
          <Text style={styles.addContactText}>Add emergency contact</Text>
        </Pressable>
      )}

      <Pressable accessibilityLabel="Prepare emergency location SMS" accessibilityRole="button" onPress={prepareSms} style={({ pressed }) => [styles.sosButton, pressed && styles.buttonPressed]}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.white} />
        <Text style={styles.sosButtonText}>Prepare location SMS</Text>
      </Pressable>

      <View style={styles.emergencyServices}>
        <Text style={styles.emergencyServicesTitle}>ONE-TAP EMERGENCY CALLS</Text>
        <EmergencyCallButton
          icon="shield-outline"
          label="Local Police"
          note="Nationwide police control"
          number="100"
          onPress={() => callEmergencyService('100', 'Nepal Police')}
        />
        <EmergencyCallButton
          icon="medkit-outline"
          label="Ambulance"
          note="Nearest available ambulance service"
          number="102"
          onPress={() => callEmergencyService('102', 'Nepal Ambulance Service')}
        />
        <EmergencyCallButton
          icon="people-outline"
          label="Tourist Police"
          note="Tourist assistance and reporting"
          number="1144"
          onPress={() => callEmergencyService('1144', 'Nepal Tourist Police')}
        />
        <Text style={styles.emergencyAvailability}>Short-code coverage can vary in remote areas. If a call fails, ask a hotel, guide, health post, or nearby resident for the closest local station or ambulance.</Text>
      </View>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://www.nepalpolice.gov.np/safety-and-security/safety-and-security-tips/')}>
        <Text style={styles.emergencySource}>Official sources: Nepal Police and Ministry of Health HEOC · verified July 6, 2026</Text>
      </Pressable>
    </View>
  );
}

function EmergencyCallButton({ icon, label, note, number, onPress }: { icon: IconName; label: string; note: string; number: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={`Call ${label} at ${number}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.emergencyCallCard, pressed && styles.buttonPressed]}>
      <View style={styles.emergencyCallIcon}><Ionicons name={icon} size={22} color={colors.white} /></View>
      <View style={styles.flex}>
        <Text style={styles.emergencyCallLabel}>{label}</Text>
        <Text style={styles.emergencyCallNote}>{note}</Text>
      </View>
      <Text style={styles.emergencyCallNumber}>{number}</Text>
      <Ionicons name="call" size={19} color={colors.danger} />
    </Pressable>
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
  responsiveShell: { flex: 1 },
  responsiveShellDesktop: { flexDirection: 'row' },
  responsiveMain: { flex: 1, minWidth: 0 },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { alignSelf: 'center', padding: spacing.md, paddingBottom: spacing.xl, width: '100%' },
  contentTablet: { padding: spacing.lg },
  contentDesktop: { maxWidth: 1440, paddingBottom: 60, paddingHorizontal: 48, paddingTop: 22 },
  webFriendlyStrip: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.035)', borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg, padding: spacing.md },
  webFriendlyItem: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minHeight: 34 },
  webFriendlyText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 17, fontWeight: '800' },
  desktopSidebar: { backgroundColor: colors.surface, borderRightColor: colors.border, borderRightWidth: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, width: 292 },
  desktopNavList: { gap: spacing.xs, marginTop: 42 },
  desktopNavItem: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: spacing.sm, minHeight: 56, paddingHorizontal: 14 },
  desktopNavItemSelected: { backgroundColor: colors.gold },
  desktopNavText: { color: colors.muted, flex: 1, fontFamily: fonts.accent, fontSize: 20, fontWeight: '900' },
  desktopNavTextSelected: { color: '#1a0f00' },
  desktopSidebarStatus: { alignItems: 'center', borderColor: colors.border, borderRadius: 13, borderWidth: 1, bottom: 118, flexDirection: 'row', gap: spacing.sm, left: spacing.md, padding: spacing.sm, position: 'absolute', right: spacing.md },
  desktopStatusLabel: { color: colors.text, fontFamily: fonts.label, fontSize: 11, fontWeight: '900' },
  desktopStatusText: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  desktopWeatherCard: { alignItems: 'center', borderColor: colors.border, borderRadius: 13, borderWidth: 1, bottom: spacing.lg, flexDirection: 'row', gap: spacing.sm, left: spacing.md, padding: spacing.md, position: 'absolute', right: spacing.md },
  desktopWeatherTemp: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  desktopWeatherText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  topBar: { alignItems: 'center', backgroundColor: colors.bg, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 68, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  topBarActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  signOutButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 16, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  topBarDesktop: { alignSelf: 'center', maxWidth: 1440, minHeight: 70, paddingHorizontal: 48, width: '100%' },
  desktopContext: { color: colors.dim, fontFamily: fonts.label, fontSize: 12, fontWeight: '900', letterSpacing: 1.6 },
  desktopPageName: { color: colors.text, fontFamily: fonts.display, fontSize: 40, fontWeight: '700', marginTop: 2 },
  pageHeading: { marginBottom: spacing.xs, paddingTop: spacing.sm },
  pageEyebrow: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, textTransform: 'uppercase' },
  pageTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 32, fontWeight: '700', lineHeight: 38, marginTop: spacing.xs },
  pageHeadingDesktop: { marginBottom: spacing.md, paddingTop: spacing.lg },
  pageEyebrowDesktop: { fontSize: 14, letterSpacing: 2.4 },
  pageTitleDesktop: { fontSize: 64, lineHeight: 72, maxWidth: 980 },
  greetingDesktop: { fontSize: 28 },
  locationDesktop: { fontSize: 13 },
  heroTitleDesktop: { fontSize: 72, lineHeight: 78, maxWidth: 760 },
  heroTextDesktop: { fontSize: 24, lineHeight: 36, maxWidth: 720 },
  sectionHeaderDesktop: { marginTop: 46 },
  sectionLabelDesktop: { fontSize: 14, letterSpacing: 2.4 },
  sectionTitleDesktop: { fontSize: 56, lineHeight: 64, maxWidth: 980 },
  exploreHero: { ...premiumSurface, borderColor: 'rgba(245,166,35,0.22)', borderRadius: 22, gap: spacing.md, marginTop: spacing.md, padding: spacing.lg },
  exploreHeroDesktop: { paddingHorizontal: 34, paddingVertical: 30 },
  exploreEyebrow: { color: colors.gold, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', letterSpacing: 2.2, textTransform: 'uppercase' },
  exploreTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 40, fontWeight: '700', lineHeight: 45, maxWidth: 850 },
  exploreTitleDesktop: { fontSize: 58, lineHeight: 64 },
  exploreIntro: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, maxWidth: 680 },
  exploreIntroDesktop: { fontSize: 18, lineHeight: 27 },
  exploreSearchBox: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 58, paddingHorizontal: spacing.md },
  exploreSearchBoxDesktop: { maxWidth: 760, minHeight: 66 },
  exploreSearchInput: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 17, minHeight: 50, minWidth: 0, paddingVertical: 8 },
  exploreClearButton: { alignItems: 'center', height: 34, justifyContent: 'center', width: 34 },
  exploreFilterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  exploreFilterChip: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.035)', borderColor: colors.border, borderRadius: 999, borderWidth: 1, minHeight: 38, paddingHorizontal: 14, paddingVertical: 8 },
  exploreFilterChipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  exploreFilterText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  exploreFilterTextSelected: { color: '#1a0f00' },
  exploreSectionHeading: { alignItems: 'flex-end', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between', marginBottom: spacing.md, marginTop: 48 },
  exploreSectionLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', letterSpacing: 2.1, textTransform: 'uppercase' },
  exploreSectionTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 34, fontWeight: '700', lineHeight: 40, marginTop: 4 },
  exploreViewAll: { alignItems: 'center', flexDirection: 'row', gap: 5, minHeight: 36, paddingHorizontal: 8 },
  exploreViewAllText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  exploreDestinationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, minWidth: 0, width: '100%' },
  destinationCard: { ...premiumSurface, borderRadius: 20, flexBasis: 360, flexGrow: 1, flexShrink: 1, minWidth: 0, overflow: 'hidden', padding: 0 },
  destinationImage: { height: 178, justifyContent: 'flex-start', overflow: 'hidden' },
  destinationImageRadius: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  destinationImageGradient: { ...StyleSheet.absoluteFillObject },
  destinationTagPill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(7,6,15,0.72)', borderColor: 'rgba(255,255,255,0.14)', borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 6, margin: spacing.md, paddingHorizontal: 11, paddingVertical: 7 },
  destinationTagPillText: { color: colors.white, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  destinationBody: { gap: 9, minHeight: 230, padding: spacing.lg },
  destinationName: { color: colors.text, fontFamily: fonts.display, fontSize: 28, fontWeight: '700', lineHeight: 32 },
  destinationRegion: { color: colors.muted, fontFamily: fonts.body, fontSize: 14 },
  destinationTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  destinationTag: { backgroundColor: 'rgba(62,207,178,0.10)', borderColor: 'rgba(62,207,178,0.24)', borderRadius: 999, borderWidth: 1, color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, textTransform: 'uppercase' },
  destinationReason: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  destinationFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  destinationSignal: { color: colors.goldLight, flex: 1, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  destinationArrow: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 16, height: 34, justifyContent: 'center', width: 34 },
  exploreEmptyState: { ...premiumSurface, borderRadius: 18, padding: spacing.lg },
  exploreEmptyTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  exploreEmptyText: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: 4 },
  festivalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, minWidth: 0, width: '100%' },
  bottomNav: { alignItems: 'center', backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', minHeight: 68, paddingHorizontal: spacing.sm, paddingTop: 7 },
  bottomNavItem: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center', minHeight: 56 },
  bottomNavIcon: { alignItems: 'center', borderRadius: 13, height: 30, justifyContent: 'center', width: 42 },
  bottomNavIconSelected: { backgroundColor: colors.gold },
  bottomNavLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  bottomNavLabelSelected: { color: colors.goldLight },
  exchangePill: { alignItems: 'flex-end', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  exchangeLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  exchangeValue: { color: colors.teal, fontFamily: fonts.accent, fontSize: 13, fontWeight: '800', marginTop: 2 },
  desktopHome: { gap: 32, minWidth: 0, width: '100%' },
  desktopHomeHero: { borderColor: colors.border, borderRadius: 22, borderWidth: 1, height: 390, justifyContent: 'flex-end', overflow: 'hidden' },
  desktopHomeHeroCompact: { height: 430 },
  desktopHomeHeroImage: { borderRadius: 22 },
  desktopHomeHeroGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
  desktopHomeHeroCopy: { bottom: 34, left: 38, maxWidth: 620, position: 'absolute' },
  desktopHomeHeroCopyCompact: { bottom: 30, left: 28, maxWidth: 780, right: 28 },
  desktopHomeEyebrow: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 13, fontWeight: '900', letterSpacing: 2.6, textTransform: 'uppercase' },
  desktopHomeTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 48, fontWeight: '700', lineHeight: 54, marginTop: 12, maxWidth: 760 },
  desktopHomeTitleCompact: { fontSize: 42, lineHeight: 47, maxWidth: 760 },
  desktopHomeText: { color: 'rgba(255,255,255,0.82)', fontFamily: fonts.body, fontSize: 19, lineHeight: 28, marginTop: 14, maxWidth: 560 },
  desktopHomeTextCompact: { fontSize: 17, lineHeight: 25, maxWidth: 680 },
  desktopHomeTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 22 },
  desktopHomeTag: { alignItems: 'center', backgroundColor: 'rgba(7,6,15,0.52)', borderColor: 'rgba(255,255,255,0.14)', borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 7, paddingHorizontal: 13, paddingVertical: 9 },
  desktopHomeTagText: { color: colors.white, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  heroPromiseCard: { backgroundColor: 'rgba(20,18,29,0.82)', borderColor: 'rgba(255,255,255,0.10)', borderRadius: 20, borderWidth: 1, gap: spacing.md, padding: spacing.lg, position: 'absolute', right: 56, top: 48, width: 278 },
  heroPromiseCardCompact: { bottom: 24, left: 28, right: 28, top: 'auto', width: 'auto' },
  heroPromiseHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: 2 },
  heroPromiseTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  heroPromiseItem: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  heroPromiseText: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  desktopModeRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  desktopConnectivityChip: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 44, paddingHorizontal: spacing.md },
  desktopConnectivityText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  desktopHomeActionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, minWidth: 0 },
  desktopHomeActionCard: { ...premiumSurface, alignItems: 'center', borderRadius: 18, flexBasis: 300, flexGrow: 1, flexShrink: 1, flexDirection: 'row', gap: spacing.md, minHeight: 118, minWidth: 0, padding: spacing.lg },
  desktopHomeActionIcon: { alignItems: 'center', borderRadius: 22, height: 58, justifyContent: 'center', width: 58 },
  desktopHomeActionTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 19, fontWeight: '900' },
  desktopHomeActionText: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: 4 },
  desktopHomeActionArrow: { alignItems: 'center', borderRadius: 18, height: 40, justifyContent: 'center', width: 40 },
  desktopHomeMainGrid: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 32, minWidth: 0, width: '100%' },
  desktopHomePrimary: { flexBasis: 720, flexGrow: 1, flexShrink: 1, minWidth: 0 },
  desktopHomeRail: { flexBasis: 320, flexGrow: 0, flexShrink: 1, gap: spacing.md, maxWidth: 380, minWidth: 320, width: '100%' },
  desktopAdditionalSection: { minWidth: 0, width: '100%' },
  desktopSectionHeaderRow: { alignItems: 'flex-end', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between', minWidth: 0 },
  viewAllButton: { alignItems: 'center', flexDirection: 'row', gap: 4, marginBottom: spacing.lg, padding: spacing.sm },
  viewAllText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  officialGuideCard: { ...premiumSurface, borderRadius: 18, padding: spacing.lg },
  officialGuideHeader: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.md },
  railPanelLabel: { color: colors.text, fontFamily: fonts.label, fontSize: 12, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  railPanelSub: { color: colors.dim, fontFamily: fonts.body, fontSize: 13, marginTop: 3 },
  officialGuideBody: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, minWidth: 0, paddingTop: spacing.md },
  officialGuideCover: { height: 96, justifyContent: 'flex-end', overflow: 'hidden', width: 96 },
  officialGuideCoverImage: { borderRadius: 12 },
  officialGuideCoverGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 12 },
  officialGuideCoverText: { color: colors.white, fontFamily: fonts.display, fontSize: 15, fontWeight: '700', lineHeight: 18, padding: 10 },
  officialGuideTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  officialGuideText: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 4 },
  officialGuideButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 11, marginTop: spacing.md, minHeight: 38, justifyContent: 'center', paddingHorizontal: spacing.lg },
  officialGuideButtonText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  downloadGuideButton: { alignItems: 'center', borderColor: 'rgba(245,166,35,0.55)', borderRadius: 11, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  quickHelpPanel: { ...premiumSurface, borderRadius: 18, padding: spacing.lg },
  quickHelpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  quickHelpTile: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.025)', borderColor: colors.border, borderRadius: 13, borderWidth: 1, flexBasis: 150, flexGrow: 1, flexShrink: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 76, minWidth: 0, padding: spacing.sm },
  quickHelpIcon: { alignItems: 'center', borderRadius: 18, height: 42, justifyContent: 'center', width: 42 },
  quickHelpTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  quickHelpText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 16, marginTop: 2 },
  railDistrictTip: { ...premiumSurface, borderColor: 'rgba(79,163,217,0.28)', borderRadius: 18, padding: spacing.lg },
  railDistrictTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 30, fontWeight: '700', marginTop: spacing.sm },
  railDistrictText: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: spacing.xs },
  districtGuideHero: { ...premiumSurface, alignItems: 'flex-start', borderColor: 'rgba(245,166,35,0.28)', borderRadius: 20, flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  districtGuideHeroIcon: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 18, height: 56, justifyContent: 'center', width: 56 },
  districtGuideProvince: { color: colors.gold, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', letterSpacing: 1.6, textTransform: 'uppercase' },
  districtGuideTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 38, fontWeight: '700', marginTop: 4 },
  districtGuideText: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, marginTop: 8 },
  districtFoodPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  districtFoodCard: { ...premiumSurface, borderRadius: 18, flexBasis: 260, flexGrow: 1, overflow: 'hidden', padding: 0 },
  districtFoodImage: { height: 150, width: '100%' },
  districtFoodCopy: { gap: 5, padding: spacing.md },
  districtFoodName: { color: colors.text, fontFamily: fonts.display, fontSize: 22, fontWeight: '700' },
  districtFoodText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  districtGuideCtaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  districtGuidePrimaryButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.gold, borderRadius: 16, flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: 16 },
  districtGuidePrimaryText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  hero: { height: 500, justifyContent: 'space-between', overflow: 'hidden' },
  heroDesktop: { height: 520 },
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
  quickAction: { ...premiumSurface, alignItems: 'center', borderRadius: 16, minHeight: 126, padding: spacing.md, width: '48.5%' },
  quickActionTablet: { width: '23.5%' },
  quickIcon: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', marginBottom: spacing.sm, width: 44 },
  quickTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  quickSub: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, marginTop: 4, textAlign: 'center' },
  personalizedPanel: { ...premiumSurface, backgroundColor: 'rgba(62,207,178,0.08)', borderColor: 'rgba(62,207,178,0.28)', borderRadius: 22, gap: spacing.md, marginTop: spacing.lg, overflow: 'hidden', padding: spacing.lg },
  personalizedHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  personalizedIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.14)', borderRadius: 18, height: 52, justifyContent: 'center', width: 52 },
  personalizedLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', letterSpacing: 1.7, textTransform: 'uppercase' },
  personalizedTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 36, fontWeight: '700', lineHeight: 42, marginTop: 4 },
  personalizedSummary: { color: colors.muted, fontFamily: fonts.body, fontSize: 17, lineHeight: 26, marginTop: spacing.xs, maxWidth: 880 },
  personalizedTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  personalizedTag: { backgroundColor: 'rgba(245,166,35,0.12)', borderColor: 'rgba(245,166,35,0.28)', borderRadius: 999, borderWidth: 1, color: colors.goldLight, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 7, textTransform: 'uppercase' },
  personalizedCardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  personalizedCard: { backgroundColor: 'rgba(7,6,15,0.42)', borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, minWidth: 220, padding: spacing.md },
  personalizedCardIcon: { alignItems: 'center', borderRadius: 14, height: 42, justifyContent: 'center', marginBottom: spacing.sm, width: 42 },
  personalizedCardTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  personalizedCardBody: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 5 },
  personalizedActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  personalizedActionButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 14, flexDirection: 'row', gap: 7, minHeight: 46, paddingHorizontal: 14 },
  personalizedActionText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  connectivityBar: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, padding: 6, paddingLeft: 12 },
  connectivityCopy: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  connectivityDot: { borderRadius: 5, height: 9, width: 9 },
  connectivityLabel: { color: colors.text, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  connectivitySwitch: { flexDirection: 'row', gap: 4 },
  connectivityOption: { alignItems: 'center', borderRadius: 11, flexDirection: 'row', gap: 5, minHeight: 34, paddingHorizontal: 9 },
  connectivityOptionSelected: { backgroundColor: colors.gold },
  connectivityOptionText: { color: colors.muted, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  connectivityOptionTextSelected: { color: '#1a0f00' },
  hotelList: { gap: spacing.sm },
  hotelListDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  hotelLocationNote: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  hotelLocationText: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 15 },
  hotelLiveText: { color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  hotelRow: { ...premiumSurface, alignItems: 'flex-start', borderRadius: 16, flexBasis: 360, flexDirection: 'row', flexGrow: 1, gap: spacing.sm, padding: spacing.md },
  hotelIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  hotelName: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  hotelArea: { color: colors.teal, fontFamily: fonts.label, fontSize: 13, fontWeight: '800', lineHeight: 14, marginTop: 3 },
  hotelNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, marginTop: 5 },
  hotelActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  hotelNavigateButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 11, flexDirection: 'row', gap: 5, minHeight: 34, paddingHorizontal: 10 },
  hotelNavigateText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
  hotelCallButton: { alignItems: 'center', borderColor: 'rgba(62,207,178,0.38)', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 5, minHeight: 34, paddingHorizontal: 12 },
  hotelCallText: { color: colors.teal, fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
  offlineReadyBanner: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.10)', borderColor: 'rgba(245,166,35,0.32)', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, padding: spacing.md },
  offlineReadyIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.14)', borderRadius: 16, height: 46, justifyContent: 'center', width: 46 },
  offlineReadyTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  offlineReadyText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginTop: 3 },
  referencePriceRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  referencePriceIcon: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.12)', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  referencePriceName: { color: colors.text, fontFamily: fonts.accent, fontSize: 17, fontWeight: '900' },
  referencePriceNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, marginTop: 3 },
  referencePriceValueWrap: { alignItems: 'flex-end', maxWidth: 120 },
  referencePriceValue: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 16, fontWeight: '900', textAlign: 'right' },
  referencePriceBadge: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  referencePriceBadgeGood: { color: colors.teal },
  contentSource: { color: colors.dim, fontFamily: fonts.body, fontSize: 9, lineHeight: 14, textAlign: 'right' },
  districtFeature: { gap: spacing.md, minWidth: 0, width: '100%' },
  districtFeatureDesktop: { alignItems: 'flex-start', flexDirection: 'row' },
  districtTabs: { gap: spacing.xs, paddingRight: spacing.md },
  districtTab: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: 6, minHeight: 40, paddingHorizontal: 12 },
  districtTabSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  districtTabText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  districtTabTextSelected: { color: '#1a0f00' },
  districtSearchPanel: { ...premiumSurface, borderRadius: 18, flexGrow: 0, flexShrink: 1, gap: spacing.sm, minWidth: 0, padding: spacing.md, width: '100%' },
  districtSearchHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  districtSearchLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  districtSearchHint: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 16, marginTop: 4, maxWidth: 560 },
  districtPickerButton: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 76, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  districtPickerButtonOpen: { borderColor: 'rgba(245,166,35,0.48)' },
  districtPickerIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 15, height: 44, justifyContent: 'center', width: 44 },
  districtPickerName: { color: colors.text, fontFamily: fonts.display, fontSize: 28, fontWeight: '700', lineHeight: 32, marginTop: 2 },
  districtCountBadge: { backgroundColor: 'rgba(62,207,178,0.12)', borderColor: 'rgba(62,207,178,0.32)', borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  districtCountText: { color: colors.teal, fontFamily: fonts.label, fontSize: 10, fontWeight: '900' },
  districtSearchBox: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 48, paddingHorizontal: 12 },
  districtSearchInput: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 17, minHeight: 44, paddingVertical: 8 },
  districtClearButton: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  districtList: { maxHeight: 330 },
  districtListContent: { gap: spacing.xs, paddingBottom: 2 },
  districtListItem: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.025)', borderColor: colors.border, borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 54, paddingHorizontal: 10, paddingVertical: 8 },
  districtListItemSelected: { backgroundColor: 'rgba(245,166,35,0.14)', borderColor: colors.gold },
  districtListIcon: { alignItems: 'center', backgroundColor: colors.surface2, borderRadius: 14, height: 34, justifyContent: 'center', width: 34 },
  districtListIconSelected: { backgroundColor: colors.gold },
  districtInitial: { color: colors.muted, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  districtInitialSelected: { color: '#1a0f00' },
  districtListName: { color: colors.text, fontFamily: fonts.accent, fontSize: 16, fontWeight: '900' },
  districtListNameSelected: { color: colors.goldLight },
  districtListProvince: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  districtGuideBadge: { color: colors.teal, fontFamily: fonts.label, fontSize: 8, fontWeight: '900' },
  districtStarterNotice: { alignItems: 'flex-start', backgroundColor: 'rgba(245,166,35,0.10)', borderColor: 'rgba(245,166,35,0.28)', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md, padding: spacing.sm },
  districtStarterText: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 17 },
  districtBriefing: { ...premiumSurface, borderColor: 'rgba(245,166,35,0.28)', borderRadius: 18, flex: 1, minWidth: 0, overflow: 'hidden', padding: spacing.md, width: '100%' },
  districtHeading: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md, minWidth: 0 },
  districtIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 16, height: 46, justifyContent: 'center', width: 46 },
  districtName: { color: colors.text, fontFamily: fonts.display, fontSize: 32, fontWeight: '700', lineHeight: 38 },
  districtProvince: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, marginTop: 2 },
  districtOfflineBadge: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.10)', borderRadius: 10, flexDirection: 'row', gap: 4, paddingHorizontal: 7, paddingVertical: 5 },
  districtOfflineText: { color: colors.teal, fontFamily: fonts.label, fontSize: 8, fontWeight: '900' },
  districtFacts: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingVertical: spacing.md },
  districtFact: { flexBasis: 140, flexGrow: 1, minWidth: 0, paddingRight: spacing.xs },
  districtFactLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 12, fontWeight: '900' },
  districtFactValue: { color: colors.text, fontFamily: fonts.accent, fontSize: 16, fontWeight: '900', lineHeight: 22, marginTop: 4 },
  districtBestFor: { alignItems: 'center', flexDirection: 'row', gap: 7, paddingVertical: spacing.md },
  districtBestForText: { color: colors.goldLight, flex: 1, fontFamily: fonts.accent, fontSize: 12, fontWeight: '800', lineHeight: 18 },
  districtInfoRow: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  districtInfoRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  districtInfoLabel: { color: colors.text, fontFamily: fonts.accent, fontSize: 16, fontWeight: '900' },
  districtInfoText: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, marginTop: 3 },
  famousSitesSection: { borderTopColor: colors.border, borderTopWidth: 1, marginHorizontal: -spacing.md, marginTop: spacing.lg, minWidth: 0, paddingHorizontal: spacing.md, paddingTop: spacing.lg },
  famousSitesHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md },
  famousSitesEyebrow: { color: colors.teal, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  famousSitesTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 34, fontWeight: '700', lineHeight: 39, marginTop: 4 },
  famousSitesCount: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.12)', borderRadius: 17, height: 36, justifyContent: 'center', width: 36 },
  famousSitesCountText: { color: colors.teal, fontFamily: fonts.label, fontSize: 14, fontWeight: '900' },
  famousSitesList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingTop: spacing.md },
  famousSitesListStacked: { flexDirection: 'column' },
  famousSiteCard: { backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 18, borderWidth: 1, flexShrink: 0, minWidth: 320, overflow: 'hidden', width: 380 },
  famousSiteCardCompact: { minWidth: 0, width: '100%' },
  famousSiteCardFeatured: { marginTop: spacing.md, minWidth: 0, width: '100%' },
  famousSiteCardFeaturedDesktop: { alignItems: 'stretch', flexDirection: 'row' },
  famousSitePhoto: { height: 240, justifyContent: 'flex-end' },
  famousSitePhotoFeatured: { height: 300, width: '100%' },
  famousSitePhotoFeaturedDesktop: { flexBasis: '43%', flexShrink: 0, height: 'auto', minHeight: 390, width: '43%' },
  famousSiteImage: { borderTopLeftRadius: 17, borderTopRightRadius: 17 },
  famousSiteGradient: { ...StyleSheet.absoluteFillObject },
  famousSitePhotoCopy: { padding: spacing.md },
  famousSitePlace: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  famousSiteName: { color: colors.white, fontFamily: fonts.display, fontSize: 35, fontWeight: '700', lineHeight: 40, marginTop: 4 },
  famousSiteBody: { flex: 1, gap: spacing.md, minWidth: 0, padding: spacing.md },
  famousSiteExperience: { color: colors.text, fontFamily: fonts.body, fontSize: 18, lineHeight: 28 },
  famousSiteMetaRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  famousSiteMetaLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  famousSiteMetaText: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, marginTop: 3 },
  famousSiteMapButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.gold, borderRadius: 12, flexDirection: 'row', gap: 7, minHeight: 42, paddingHorizontal: 14 },
  famousSiteMapText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 14, fontWeight: '900' },
  famousSiteImageNote: { color: colors.dim, fontFamily: fonts.body, fontSize: 9 },
  districtFreshness: { color: colors.dim, fontFamily: fonts.body, fontSize: 9, marginTop: spacing.sm, textAlign: 'right' },
  sectionHeader: { marginBottom: spacing.md, marginTop: spacing.xl },
  sectionLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginBottom: spacing.xs, textTransform: 'uppercase' },
  sectionTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 30, fontWeight: '700', lineHeight: 35 },
  stack: { gap: spacing.sm },
  desktopTwoColumnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  desktopThreeColumnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  flex: { flex: 1 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  offlineCard: { ...premiumSurface, alignItems: 'flex-start', borderRadius: 16, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  offlineIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 15, height: 46, justifyContent: 'center', width: 46 },
  cardTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 20, fontWeight: '900' },
  cardText: { color: colors.muted, fontFamily: fonts.body, fontSize: 18, lineHeight: 28, marginTop: 4 },
  packSize: { color: colors.dim, fontFamily: fonts.label, fontSize: 11, fontWeight: '800' },
  progressTrack: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 7, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.gold, borderRadius: 99, height: 7 },
  packStatus: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 11, fontWeight: '800', marginTop: 6 },
  horizontalList: { gap: spacing.md, paddingRight: spacing.md },
  festivalPhoto: { ...premiumSurface, borderRadius: 20, flexBasis: 360, flexGrow: 1, flexShrink: 1, minHeight: 404, minWidth: 0, overflow: 'hidden', padding: 0 },
  festivalImageWrap: { height: 164, justifyContent: 'flex-start', overflow: 'hidden' },
  festivalImage: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  festivalImageGradient: { ...StyleSheet.absoluteFillObject },
  photoGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 18 },
  countdown: { alignSelf: 'flex-start', borderRadius: 12, color: colors.white, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', margin: spacing.md, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 6, textTransform: 'uppercase' },
  festivalCopy: { flex: 1, gap: 7, padding: spacing.lg },
  festivalCrowd: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  festivalName: { color: colors.text, fontFamily: fonts.display, fontSize: 25, fontWeight: '700', lineHeight: 30 },
  festivalLocation: { color: colors.muted, fontFamily: fonts.accent, fontSize: 13, fontWeight: '800' },
  festivalWhy: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  festivalLink: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 5, marginTop: spacing.xs, paddingVertical: 4 },
  festivalLinkText: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  filterChip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, color: colors.muted, fontFamily: fonts.accent, fontSize: 14, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 8 },
  discoverCard: { borderColor: colors.border, borderRadius: 20, borderWidth: 1, flexBasis: 360, flexGrow: 1, height: 282, justifyContent: 'flex-end', minWidth: 0, overflow: 'hidden' },
  discoverImage: { borderRadius: 18 },
  discoverCopy: { padding: spacing.md },
  discoverTag: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  discoverTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 30, fontWeight: '700', marginTop: 4 },
  discoverLocation: { color: 'rgba(255,255,255,0.66)', fontFamily: fonts.label, fontSize: 12, marginTop: 2 },
  discoverSummary: { color: 'rgba(255,255,255,0.74)', fontFamily: fonts.body, fontSize: 16, lineHeight: 24, marginTop: 8 },
  discoverMeta: { color: colors.teal, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900', marginTop: 8 },
  alertCard: { ...premiumSurface, borderRadius: 16, flexBasis: 420, flexDirection: 'row', flexGrow: 1, gap: spacing.md, padding: spacing.md },
  alertUrgent: { borderColor: 'rgba(255,93,108,0.35)' },
  alertIcon: { alignItems: 'center', backgroundColor: 'rgba(79,163,217,0.16)', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  alertStatus: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  mapPanel: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: 'rgba(79,163,217,0.30)', borderRadius: 18, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.sm, padding: spacing.md },
  mapTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  mapText: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, marginTop: 4 },
  navigateButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 18, flexDirection: 'row', gap: 5, paddingHorizontal: 12, paddingVertical: 9 },
  navigateText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  updateRow: { ...premiumSurface, alignItems: 'center', borderRadius: 14, flexBasis: 320, flexDirection: 'row', flexGrow: 1, gap: spacing.sm, padding: spacing.md },
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
  scamAlertRow: { ...premiumSurface, alignItems: 'flex-start', borderRadius: 14, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  scamAlertIcon: { alignItems: 'center', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  scamAlertTitle: { color: colors.text, flex: 1, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900', paddingRight: spacing.sm },
  scamAlertTime: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '800' },
  scamAlertLocation: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 10, fontWeight: '800', marginTop: 3 },
  moderationNotice: { backgroundColor: 'rgba(62,207,178,0.10)', borderColor: 'rgba(62,207,178,0.30)', borderRadius: 12, borderWidth: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginBottom: spacing.md, padding: spacing.sm },
  moderationActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  moderationFlagText: { color: colors.danger, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', marginTop: 5 },
  verifyButton: { backgroundColor: colors.teal, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  verifyButtonText: { color: '#07130f', fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
  rejectButton: { borderColor: colors.danger, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  rejectButtonText: { color: colors.danger, fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
  reportStatusText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginBottom: spacing.sm },
  reportTrustBadge: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', marginLeft: spacing.sm },
  reportTrustBadgeVerified: { color: colors.teal },
  reportActionRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  confirmReportButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 5 },
  confirmReportText: { color: colors.teal, fontFamily: fonts.accent, fontSize: 10, fontWeight: '800' },
  flagReportText: { color: colors.danger, fontFamily: fonts.accent, fontSize: 10, fontWeight: '800' },
  scamDescriptionInput: { backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontFamily: fonts.body, fontSize: 12, minHeight: 96, padding: spacing.sm, textAlignVertical: 'top' },
  reportPhotoButton: { alignItems: 'center', alignSelf: 'flex-start', borderColor: colors.border, borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 7, paddingHorizontal: 10, paddingVertical: 8 },
  reportPhotoText: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 10, fontWeight: '800' },
  reportLocationText: { color: colors.dim, fontFamily: fonts.body, fontSize: 9 },
  scamReportPanel: { backgroundColor: colors.surface, borderColor: 'rgba(255,93,108,0.35)', borderRadius: 14, borderWidth: 1, gap: spacing.sm, marginTop: spacing.sm, padding: spacing.md },
  scamReportHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  scamReportTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  scamReportSubtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, marginTop: 3 },
  scamReportClose: { alignItems: 'center', height: 32, justifyContent: 'center', width: 32 },
  scamReportTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  scamReportType: { borderColor: colors.border, borderRadius: 11, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  scamReportTypeSelected: { backgroundColor: 'rgba(255,93,108,0.14)', borderColor: colors.danger },
  scamReportTypeText: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, fontWeight: '700' },
  scamReportTypeTextSelected: { color: colors.white },
  scamReportSubmit: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.gold, borderRadius: 12, flexDirection: 'row', gap: 6, minHeight: 38, paddingHorizontal: 12 },
  scamReportSubmitText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
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
  phraseEnglish: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  phraseTip: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, marginTop: 2 },
  infoCard: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  priceChecker: { gap: spacing.md },
  priceHeroCard: { ...premiumSurface, alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderColor: 'rgba(245,166,35,0.32)', borderRadius: 18, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  priceHeroIcon: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 18, height: 48, justifyContent: 'center', width: 48 },
  priceHeroTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 25, fontWeight: '700' },
  priceHeroText: { color: colors.muted, fontFamily: fonts.body, fontSize: 18, lineHeight: 28, marginTop: 3 },
  priceSearchBox: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 52, paddingHorizontal: 12 },
  priceSearchInput: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 16, minHeight: 48, paddingVertical: 8 },
  priceCategoryList: { gap: spacing.xs, paddingVertical: 2 },
  priceCategoryChip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  priceCategoryChipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  priceCategoryText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  priceCategoryTextSelected: { color: '#1a0f00' },
  priceCompareCard: { ...premiumSurface, borderColor: 'rgba(62,207,178,0.30)', borderRadius: 18, gap: spacing.md, padding: spacing.md },
  priceCompareHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  priceBadgeStack: { alignItems: 'flex-end', gap: spacing.xs },
  priceCompareLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  priceCompareItem: { color: colors.text, fontFamily: fonts.accent, fontSize: 20, fontWeight: '900', marginTop: 4 },
  priceCompareRange: { color: colors.teal, fontFamily: fonts.display, fontSize: 24, fontWeight: '700', marginTop: 6 },
  priceRiskBadge: { backgroundColor: 'rgba(62,207,178,0.12)', borderColor: 'rgba(62,207,178,0.35)', borderRadius: 12, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  priceRiskMedium: { backgroundColor: 'rgba(245,166,35,0.12)', borderColor: 'rgba(245,166,35,0.35)' },
  priceRiskHigh: { backgroundColor: 'rgba(255,93,108,0.12)', borderColor: 'rgba(255,93,108,0.38)' },
  priceRiskText: { color: colors.text, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  priceQuoteRow: { alignItems: 'stretch', flexDirection: 'row', gap: spacing.sm },
  priceQuoteInput: { backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontFamily: fonts.accent, fontSize: 18, minHeight: 64, paddingHorizontal: spacing.md, width: 140 },
  priceVerdict: { backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: 14, borderWidth: 1, flex: 1, justifyContent: 'center', padding: spacing.sm },
  priceVerdictLabel: { fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  priceVerdictText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 3 },
  pricePhraseLarge: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  priceTip: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  priceObservationSource: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  priceConfidenceRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 8 },
  priceConfidenceText: { color: colors.dim, flexShrink: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  priceResultsHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  priceResultsTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 24, fontWeight: '700' },
  priceResultsDistrict: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, textAlign: 'right' },
  fairPriceRow: { ...premiumSurface, alignItems: 'flex-start', borderRadius: 16, flexBasis: 460, flexDirection: 'row', flexGrow: 1, gap: spacing.md, padding: spacing.md },
  fairPriceIcon: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.12)', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  fairPriceName: { color: colors.text, fontFamily: fonts.accent, fontSize: 19, fontWeight: '900' },
  fairPriceMeta: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 12, fontWeight: '800', lineHeight: 14, marginTop: 3 },
  fairPriceTip: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, marginTop: 5 },
  fairPriceRangeBox: { alignItems: 'flex-end', minWidth: 96 },
  fairPriceRange: { color: colors.teal, fontFamily: fonts.label, fontSize: 13, fontWeight: '900', textAlign: 'right' },
  fairPriceUnit: { color: colors.dim, fontFamily: fonts.body, fontSize: 10, marginTop: 4, textAlign: 'right' },
  priceTool: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', padding: spacing.md },
  priceToolItem: { color: colors.text, fontFamily: fonts.accent, fontSize: 14, fontWeight: '900' },
  priceToolNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4, maxWidth: 280 },
  priceRangeBox: { alignItems: 'flex-end' },
  priceRange: { color: colors.teal, fontFamily: fonts.label, fontSize: 14, fontWeight: '900' },
  pricePhrase: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 11, fontWeight: '800', marginTop: 4 },
  foodSnapshot: { ...premiumSurface, borderColor: 'rgba(245,166,35,0.28)', borderRadius: 18, gap: spacing.md, padding: spacing.md },
  foodSnapshotHeader: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  foodSnapshotLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  foodSnapshotTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 24, fontWeight: '700', marginTop: 4 },
  foodSnapshotButton: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 14, flexDirection: 'row', gap: 7, minHeight: 42, paddingHorizontal: 13 },
  foodSnapshotButtonText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  foodSnapshotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  foodSnapshotCard: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 15, borderWidth: 1, flexBasis: 260, flexDirection: 'row', flexGrow: 1, gap: spacing.sm, minWidth: 0, padding: spacing.sm },
  foodSnapshotIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  foodSnapshotName: { color: colors.text, fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  foodSnapshotNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 2 },
  foodSnapshotPriceBox: { alignItems: 'flex-end', minWidth: 76 },
  foodSnapshotPrice: { color: colors.teal, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', textAlign: 'right' },
  foodSnapshotBadge: { color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  foodSnapshotBadgeWarn: { color: colors.gold },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  foodCard: { ...premiumSurface, borderRadius: 18, flexBasis: 280, flexGrow: 1, overflow: 'hidden', padding: 0, width: '48.5%' },
  foodGridDesktop: { gap: spacing.md },
  foodCategoryList: { gap: spacing.xs, paddingTop: spacing.md },
  foodCategoryChip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  foodCategoryChipSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  foodCategoryText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900' },
  foodCategoryTextSelected: { color: '#1a0f00' },
  foodImage: { height: 190, width: '100%' },
  foodCardBody: { gap: 10, padding: spacing.md },
  foodTitleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  foodTitleCopy: { flex: 1 },
  foodRegion: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  foodDish: { color: colors.text, fontFamily: fonts.display, fontSize: 21, fontWeight: '700', marginTop: 4 },
  foodPrice: { color: colors.teal, fontFamily: fonts.label, fontSize: 11, fontWeight: '900', maxWidth: 110, textAlign: 'right' },
  foodDescription: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  foodBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  foodBadge: { backgroundColor: 'rgba(62,207,178,0.11)', borderColor: 'rgba(62,207,178,0.28)', borderRadius: 999, borderWidth: 1, color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6 },
  foodFlavors: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 12, fontWeight: '800' },
  foodInfoGrid: { gap: spacing.xs },
  foodInfoBox: { backgroundColor: 'rgba(255,255,255,0.035)', borderColor: colors.border, borderRadius: 12, borderWidth: 1, padding: 9 },
  foodAllergyBox: { backgroundColor: 'rgba(245,166,35,0.08)', borderColor: 'rgba(245,166,35,0.24)' },
  foodInfoLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  foodInfoText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 4 },
  foodDetailRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 7 },
  foodDetailText: { color: colors.dim, flex: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  foodOrderBox: { backgroundColor: 'rgba(245,166,35,0.08)', borderColor: 'rgba(245,166,35,0.24)', borderRadius: 12, borderWidth: 1, marginTop: 2, padding: 10 },
  foodOrderLabel: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  foodTip: { color: colors.text, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 4 },
  cultureBites: { ...premiumSurface, borderRadius: 16, gap: spacing.md, padding: spacing.md },
  cultureBiteTabs: { backgroundColor: colors.surface2, borderRadius: 13, flexDirection: 'row', gap: spacing.xs, padding: 5 },
  cultureBiteTab: { alignItems: 'center', borderRadius: 10, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 38, paddingHorizontal: 8 },
  cultureBiteTabSelected: { backgroundColor: colors.gold },
  cultureBiteTabText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  cultureBiteTabTextSelected: { color: '#1a0f00' },
  cultureFactList: { gap: spacing.xs },
  cultureFactRow: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  cultureFactIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  cultureFactTag: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  cultureFactTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 17, fontWeight: '900', marginTop: 2 },
  cultureFactText: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 3 },
  localChat: { ...premiumSurface, borderColor: 'rgba(62,207,178,0.28)', borderRadius: 18, gap: spacing.md, overflow: 'hidden', padding: spacing.md },
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
  altitudePanel: { ...premiumSurface, borderColor: 'rgba(79,163,217,0.30)', borderRadius: 18, flexBasis: 420, flexGrow: 1, gap: spacing.md, padding: spacing.md },
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
  sosPanel: { ...premiumSurface, backgroundColor: 'rgba(255,93,108,0.10)', borderColor: 'rgba(255,93,108,0.35)', borderRadius: 18, flexBasis: 420, flexGrow: 1, gap: spacing.md, padding: spacing.md },
  sosHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  sosIcon: { alignItems: 'center', backgroundColor: colors.danger, borderRadius: 16, height: 46, justifyContent: 'center', width: 46 },
  sosTitle: { color: colors.white, fontFamily: fonts.display, fontSize: 32, fontWeight: '700' },
  sosText: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 4 },
  refreshLocationButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 12, borderWidth: 1, height: 38, justifyContent: 'center', width: 38 },
  offlineBadgeWaiting: { borderColor: 'rgba(245,166,35,0.30)' },
  emptyContactsText: { color: colors.dim, fontFamily: fonts.body, fontSize: 11 },
  addContactButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 7, paddingVertical: 6 },
  addContactText: { color: colors.goldLight, fontFamily: fonts.accent, fontSize: 11, fontWeight: '800' },
  contactEditor: { backgroundColor: 'rgba(7,6,15,0.36)', borderRadius: 14, gap: spacing.xs, padding: spacing.sm },
  contactKindRow: { flexDirection: 'row', gap: spacing.xs },
  contactKindButton: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 },
  contactKindButtonActive: { backgroundColor: 'rgba(245,166,35,0.14)', borderColor: colors.gold },
  contactKindText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 9, fontWeight: '800' },
  contactInput: { backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: 11, borderWidth: 1, color: colors.text, fontFamily: fonts.body, fontSize: 12, minHeight: 42, paddingHorizontal: spacing.sm },
  saveContactButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.gold, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9 },
  saveContactText: { color: '#1a0f00', fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
  emergencySource: { color: colors.dim, fontFamily: fonts.body, fontSize: 9, textAlign: 'center', textDecorationLine: 'underline' },
  offlineBadge: { alignItems: 'center', backgroundColor: 'rgba(62,207,178,0.12)', borderColor: 'rgba(62,207,178,0.30)', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  offlineStatusDot: { backgroundColor: colors.teal, borderRadius: 4, height: 7, width: 7 },
  offlineBadgeText: { color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  gpsFix: { alignItems: 'center', backgroundColor: 'rgba(7,6,15,0.46)', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  gpsLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  gpsCoordinates: { color: colors.white, fontFamily: fonts.accent, fontSize: 24, fontWeight: '900', marginTop: 3 },
  gpsArea: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  sosRecipients: { gap: spacing.xs },
  recipientRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minHeight: 30 },
  recipientText: { color: colors.text, flex: 1, fontFamily: fonts.accent, fontSize: 17, fontWeight: '800' },
  recipientStatus: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '800' },
  sosButton: { alignItems: 'center', backgroundColor: colors.danger, borderRadius: 16, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48, paddingHorizontal: 16, paddingVertical: 12 },
  buttonPressed: { opacity: 0.78 },
  sosButtonText: { color: colors.white, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  emergencyServices: { backgroundColor: 'rgba(7,6,15,0.36)', borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: spacing.xs, padding: spacing.sm },
  emergencyServicesTitle: { color: colors.dim, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginBottom: 3 },
  emergencyCallCard: { alignItems: 'center', backgroundColor: colors.surface2, borderColor: 'rgba(255,93,108,0.22)', borderRadius: 13, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, minHeight: 64, padding: spacing.sm },
  emergencyCallIcon: { alignItems: 'center', backgroundColor: colors.danger, borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  emergencyCallLabel: { color: colors.text, fontFamily: fonts.accent, fontSize: 18, fontWeight: '900' },
  emergencyCallNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 2 },
  emergencyCallNumber: { color: colors.danger, fontFamily: fonts.display, fontSize: 27, fontWeight: '700' },
  emergencyAvailability: { color: colors.dim, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, paddingHorizontal: 3, paddingTop: 4 },
  contentSourceNote: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
    marginTop: -spacing.xs
  },

});
