import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as SMS from 'expo-sms';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YatriLogo } from '../components/YatriLogo';
import { loadTravelPreferences } from '../auth/localSession';
import { formatCoordinates, formatLocationAge, getForegroundLocation, getSavedLocation, type SavedLocation } from '../services/location';
import {
  deleteCurrentAccount,
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
import {
  cultureFacts,
  discoverItems,
  districtBriefings,
  etiquetteCards,
  festivals,
  filterChips,
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

type DashboardPage = 'home' | 'explore' | 'safety' | 'local' | 'prices' | 'moderation';
type ConnectivityMode = 'online' | 'offline';

const dashboardPages: { id: DashboardPage; label: string; icon: IconName; activeIcon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'explore', label: 'Explore', icon: 'compass-outline', activeIcon: 'compass' },
  { id: 'safety', label: 'Safety', icon: 'shield-outline', activeIcon: 'shield' },
  { id: 'local', label: 'Local', icon: 'people-outline', activeIcon: 'people' },
  { id: 'prices', label: 'Prices', icon: 'pricetag-outline', activeIcon: 'pricetag' }
];

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
  const recommendedMode: TravelMode = savedPreferences?.travelStyle === 'culture' || savedPreferences?.interests.includes('heritage') || savedPreferences?.interests.includes('festivals')
    ? 'culture'
    : 'adventure';
  const [activeMode, setActiveMode] = useState<TravelMode>(recommendedMode);
  const active = modeConfig[activeMode];
  const [currentPage, setCurrentPage] = useState<DashboardPage>('home');
  const [priceFocus, setPriceFocus] = useState<'fair' | 'rides'>('fair');
  const [isModerator, setIsModerator] = useState(false);
  const [connectivity, setConnectivity] = useState<ConnectivityMode>(() =>
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online'
  );
  const selectedDiscover = discoverItems.filter((item) => item.mode === activeMode);

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
      setCurrentPage('safety');
      return;
    }
    if (title === 'Offline') {
      setConnectivity('offline');
      setCurrentPage('home');
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
          <>
            <ImageBackground source={{ uri: active.image }} style={[styles.hero, isDesktop && styles.heroDesktop]} imageStyle={styles.heroImage}>
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
              <ModeButton mode="culture" selected={activeMode === 'culture'} onPress={() => setActiveMode('culture')} />
              <ModeButton mode="adventure" selected={activeMode === 'adventure'} onPress={() => setActiveMode('adventure')} />
            </View>

            <ConnectivityControl mode={connectivity} onChange={setConnectivity} />

            <View style={styles.quickGrid}>
              {quickActions.map((action) => (
                <Pressable
                  accessibilityLabel={action.title}
                  accessibilityRole="button"
                  key={action.title}
                  onPress={() => handleQuickAction(action.title)}
                  style={[styles.quickAction, isTablet && styles.quickActionTablet]}
                >
                  <View style={[styles.quickIcon, { backgroundColor: `${action.accent}22` }]}>
                    <Ionicons name={action.icon} size={22} color={action.accent} />
                  </View>
                  <Text style={styles.quickTitle}>{action.title}</Text>
                  <Text style={styles.quickSub}>{action.subtitle}</Text>
                </Pressable>
              ))}
            </View>

            {connectivity === 'online' ? (
              <>
                <SectionHeader label="Online nearby" title="Hotels around Thamel" />
                <NearbyHotels />
                <SectionHeader label="Know before you go" title="Choose your district" />
                <DistrictBriefingSelector />
              </>
            ) : (
              <>
                <OfflineReadyBanner />
                <SectionHeader label="Saved on this device" title="Your offline district guide" />
                <DistrictBriefingSelector />
                <SectionHeader label="Offline-first" title="Downloaded travel packs" />
                <View style={styles.stack}>
                  {offlinePacks.map((pack) => (
                    <OfflinePackCard key={pack.title} pack={pack} />
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {currentPage === 'explore' && (
          <>
            <PageHeading eyebrow="Explore" title="Find your next Nepal experience" />
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

            <SectionHeader label="Trail updates" title="Routes and conditions" />
            <View style={styles.mapPanel}>
              <View style={styles.flex}>
                <Text style={styles.mapTitle}>Offline vector map preview</Text>
                <Text style={styles.mapText}>Trails, water, teahouses, checkpoints</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={openTrailNavigation} style={styles.navigateButton}>
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
          </>
        )}

        {currentPage === 'safety' && (
          <>
            <PageHeading eyebrow="Safety" title="Alerts and emergency tools" />
            <SectionHeader label="Trail safety" title="Weather and altitude alerts" />
            <View style={styles.stack}>
              {trailAlerts.map((alert) => (
                <AlertCard key={alert.title} alert={alert} />
              ))}
            </View>

            <SectionHeader label="Altitude safety" title="Daily symptom check-in" />
            <AltitudeTracker />

            <SectionHeader label="Traveler safety" title="Live scam alert map" />
            <ScamAlertMap />

            <SectionHeader label="Emergency" title="Offline help" />
            <OfflineSos />
          </>
        )}

        {currentPage === 'local' && (
          <>
            <PageHeading eyebrow="Local" title="Ask, speak, and spend confidently" />
            <SectionHeader label="Know Nepal" title="Culture bites and useful phrases" />
            <CultureBites />

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
            <View style={styles.stack}>
              {etiquetteCards.map((card) => (
                <InfoCard key={card.context} icon={card.icon} title={card.context} body={`${card.rule} ${card.detail}`} />
              ))}
            </View>

            <SectionHeader label="Taste Nepal" title="Regional food decoder" />
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
          </>
        )}

        {currentPage === 'moderation' && isModerator && <ModerationPanel />}

        {currentPage === 'prices' && (
          <>
            <PageHeading
              eyebrow={priceFocus === 'rides' ? 'Getting around' : 'Fair price guide'}
              title={priceFocus === 'rides' ? 'Know your transport costs' : 'Know before you pay'}
            />

            {priceFocus === 'rides' && (
              <>
                <SectionHeader label="Ride guide" title="Typical transport prices" />
                <ReferencePriceList items={transportPrices} icon="car-outline" />
              </>
            )}

            <SectionHeader label="Check the range" title="Common tourist purchases" />
            <View style={styles.stack}>
              {priceTools.map((tool) => (
                <View key={tool.item} style={styles.priceTool}>
                  <View style={styles.flex}>
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

            <SectionHeader label="Everyday costs" title="Food price references" />
            <ReferencePriceList items={foodPrices} icon="restaurant-outline" />

            {priceFocus === 'fair' && (
              <>
                <SectionHeader label="Getting around" title="Transport price references" />
                <ReferencePriceList items={transportPrices} icon="car-outline" />
              </>
            )}
          </>
        )}
          </ScrollView>

          {!isDesktop && <BottomNavigation currentPage={currentPage} onChange={setCurrentPage} />}
        </View>
      </View>
    </SafeAreaView>
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
    </View>
  );
}

function PageHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={styles.pageHeading}>
      <Text style={styles.pageEyebrow}>{eyebrow}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
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

function NearbyHotels() {
  const openNavigation = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => Alert.alert('Navigation unavailable', 'Unable to open maps on this device.'));
  };

  const callHotel = (phone: string, displayPhone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Calling unavailable', `Call the hotel at ${displayPhone}.`));
  };

  return (
    <View style={styles.hotelList}>
      <View style={styles.hotelLocationNote}>
        <Ionicons name="location-outline" size={16} color={colors.teal} />
        <Text style={styles.hotelLocationText}>Distances shown from Thamel center</Text>
        <Text style={styles.hotelLiveText}>LIVE</Text>
      </View>
      {nearbyHotels.map((hotel) => (
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
                <Text style={styles.hotelNavigateText}>Navigate</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => callHotel(hotel.phone, hotel.displayPhone)} style={styles.hotelCallButton}>
                <Ionicons name="call-outline" size={15} color={colors.teal} />
                <Text style={styles.hotelCallText}>Call</Text>
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

function DistrictBriefingSelector() {
  const [selectedDistrict, setSelectedDistrict] = useState('Kathmandu');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const activeDistrict = districtBriefings.find((item) => item.district === selectedDistrict)!;
  const connectivityColor = activeDistrict.connectivity === 'Strong'
    ? colors.teal
    : activeDistrict.connectivity === 'Mixed'
      ? colors.gold
      : colors.danger;

  useEffect(() => {
    void getSavedDistrictPacks().then((packs) => setSavedAt(packs[selectedDistrict]?.savedAt ?? null));
  }, [selectedDistrict]);

  const downloadPack = async () => {
    const saved = await saveDistrictPack(selectedDistrict, activeDistrict);
    setSavedAt(saved.savedAt);
  };

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
          <Pressable accessibilityRole="button" onPress={downloadPack} style={styles.districtOfflineBadge}>
            <Ionicons name={savedAt ? 'cloud-done-outline' : 'cloud-download-outline'} size={14} color={colors.teal} />
            <Text style={styles.districtOfflineText}>{savedAt ? 'SAVED' : 'DOWNLOAD'}</Text>
          </Pressable>
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
        <Text style={styles.districtFreshness}>{savedAt ? `Offline copy saved ${new Date(savedAt).toLocaleDateString()} · ` : ''}Yatri editorial review · July 5, 2026</Text>
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
                  <Text style={[styles.reportTrustBadge, verified && styles.reportTrustBadgeVerified]}>{verified ? 'VERIFIED ALERT' : 'COMMUNITY REPORT'}</Text>
                </View>
                <Text style={styles.scamAlertLocation}>{report.district ?? 'Nearby'} · {formatLocationAge(new Date(report.created_at).getTime())}</Text>
                <Text style={styles.cardText}>{report.description}</Text>
                <Pressable accessibilityRole="button" onPress={() => confirmReport(report.id)} style={styles.confirmReportButton}>
                  <Ionicons name="checkmark-circle-outline" size={15} color={colors.teal} />
                  <Text style={styles.confirmReportText}>I saw this too · {report.vote_count}</Text>
                </Pressable>
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
        {reports.length ? reports.map((report) => (
          <View key={report.id} style={styles.scamAlertRow}>
            <View style={styles.flex}>
              <Text style={styles.scamAlertTitle}>{report.category.replace(/_/g, ' ')}</Text>
              <Text style={styles.scamAlertLocation}>{formatCoordinates({ latitude: report.latitude, longitude: report.longitude, accuracy: null, timestamp: new Date(report.created_at).getTime() })}</Text>
              <Text style={styles.cardText}>{report.description}</Text>
              <View style={styles.moderationActions}>
                <Pressable onPress={() => decide(report.id, 'verified')} style={styles.verifyButton}><Text style={styles.verifyButtonText}>Verify</Text></Pressable>
                <Pressable onPress={() => decide(report.id, 'rejected')} style={styles.rejectButton}><Text style={styles.rejectButtonText}>Reject</Text></Pressable>
              </View>
            </View>
          </View>
        )) : <Text style={styles.reportStatusText}>No reports waiting for review.</Text>}
      </View>
    </>
  );
}

function CultureBites() {
  const [view, setView] = useState<'facts' | 'phrases'>('facts');

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

  const callTouristPolice = () => {
    Linking.openURL('tel:1144').catch(() => Alert.alert('Calling unavailable', 'Dial 1144 for Nepal Tourist Police.'));
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

      <Pressable accessibilityLabel="Call Nepal Tourist Police at 1144" accessibilityRole="button" onPress={callTouristPolice} style={styles.policeCallButton}>
        <Ionicons name="call-outline" size={17} color={colors.danger} />
        <Text style={styles.policeCallText}>Call Tourist Police · 1144</Text>
      </Pressable>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://ntb.gov.np/plan-your-trip/before-you-come/tourist-police')}>
        <Text style={styles.emergencySource}>Source: Nepal Tourism Board · reviewed July 5, 2026</Text>
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
  responsiveShell: { flex: 1 },
  responsiveShellDesktop: { flexDirection: 'row' },
  responsiveMain: { flex: 1, minWidth: 0 },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { alignSelf: 'center', padding: spacing.md, paddingBottom: spacing.xl, width: '100%' },
  contentTablet: { padding: spacing.lg },
  contentDesktop: { maxWidth: 1180, paddingHorizontal: 32, paddingVertical: spacing.lg },
  desktopSidebar: { backgroundColor: colors.surface, borderRightColor: colors.border, borderRightWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.lg, width: 246 },
  desktopNavList: { gap: spacing.xs, marginTop: 42 },
  desktopNavItem: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: spacing.sm, minHeight: 48, paddingHorizontal: 12 },
  desktopNavItemSelected: { backgroundColor: colors.gold },
  desktopNavText: { color: colors.muted, flex: 1, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  desktopNavTextSelected: { color: '#1a0f00' },
  desktopSidebarStatus: { alignItems: 'center', borderColor: colors.border, borderRadius: 13, borderWidth: 1, bottom: spacing.lg, flexDirection: 'row', gap: spacing.sm, left: spacing.md, padding: spacing.sm, position: 'absolute', right: spacing.md },
  desktopStatusLabel: { color: colors.text, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  desktopStatusText: { color: colors.dim, fontFamily: fonts.body, fontSize: 9, marginTop: 2 },
  topBar: { alignItems: 'center', backgroundColor: colors.bg, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 68, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  topBarActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  signOutButton: { alignItems: 'center', borderColor: colors.border, borderRadius: 16, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  topBarDesktop: { minHeight: 76, paddingHorizontal: 32 },
  desktopContext: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  desktopPageName: { color: colors.text, fontFamily: fonts.display, fontSize: 21, fontWeight: '700', marginTop: 2 },
  pageHeading: { marginBottom: spacing.xs, paddingTop: spacing.sm },
  pageEyebrow: { color: colors.gold, fontFamily: fonts.label, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, textTransform: 'uppercase' },
  pageTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 32, fontWeight: '700', lineHeight: 38, marginTop: spacing.xs },
  bottomNav: { alignItems: 'center', backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', minHeight: 68, paddingHorizontal: spacing.sm, paddingTop: 7 },
  bottomNavItem: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center', minHeight: 56 },
  bottomNavIcon: { alignItems: 'center', borderRadius: 13, height: 30, justifyContent: 'center', width: 42 },
  bottomNavIconSelected: { backgroundColor: colors.gold },
  bottomNavLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  bottomNavLabelSelected: { color: colors.goldLight },
  exchangePill: { alignItems: 'flex-end', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  exchangeLabel: { color: colors.dim, fontFamily: fonts.label, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  exchangeValue: { color: colors.teal, fontFamily: fonts.accent, fontSize: 13, fontWeight: '800', marginTop: 2 },
  hero: { height: 500, justifyContent: 'space-between', overflow: 'hidden' },
  heroDesktop: { height: 440 },
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
  quickActionTablet: { width: '23.5%' },
  quickIcon: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', marginBottom: spacing.sm, width: 44 },
  quickTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 15, fontWeight: '900' },
  quickSub: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 4, textAlign: 'center' },
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
  hotelLocationNote: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  hotelLocationText: { color: colors.muted, flex: 1, fontFamily: fonts.body, fontSize: 10 },
  hotelLiveText: { color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '900' },
  hotelRow: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  hotelIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  hotelName: { color: colors.text, fontFamily: fonts.accent, fontSize: 14, fontWeight: '900' },
  hotelArea: { color: colors.teal, fontFamily: fonts.label, fontSize: 9, fontWeight: '800', lineHeight: 14, marginTop: 3 },
  hotelNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 16, marginTop: 5 },
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
  referencePriceName: { color: colors.text, fontFamily: fonts.accent, fontSize: 13, fontWeight: '900' },
  referencePriceNote: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 3 },
  referencePriceValueWrap: { alignItems: 'flex-end', maxWidth: 120 },
  referencePriceValue: { color: colors.goldLight, fontFamily: fonts.label, fontSize: 12, fontWeight: '900', textAlign: 'right' },
  referencePriceBadge: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', marginTop: 4, textTransform: 'uppercase' },
  referencePriceBadgeGood: { color: colors.teal },
  contentSource: { color: colors.dim, fontFamily: fonts.body, fontSize: 9, lineHeight: 14, textAlign: 'right' },
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
  districtFreshness: { color: colors.dim, fontFamily: fonts.body, fontSize: 9, marginTop: spacing.sm, textAlign: 'right' },
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
  moderationNotice: { backgroundColor: 'rgba(62,207,178,0.10)', borderColor: 'rgba(62,207,178,0.30)', borderRadius: 12, borderWidth: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginBottom: spacing.md, padding: spacing.sm },
  moderationActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  verifyButton: { backgroundColor: colors.teal, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  verifyButtonText: { color: '#07130f', fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
  rejectButton: { borderColor: colors.danger, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  rejectButtonText: { color: colors.danger, fontFamily: fonts.accent, fontSize: 10, fontWeight: '900' },
  reportStatusText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginBottom: spacing.sm },
  reportTrustBadge: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', marginLeft: spacing.sm },
  reportTrustBadgeVerified: { color: colors.teal },
  confirmReportButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 5, marginTop: spacing.sm },
  confirmReportText: { color: colors.teal, fontFamily: fonts.accent, fontSize: 10, fontWeight: '800' },
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
  cultureBites: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  cultureBiteTabs: { backgroundColor: colors.surface2, borderRadius: 13, flexDirection: 'row', gap: spacing.xs, padding: 5 },
  cultureBiteTab: { alignItems: 'center', borderRadius: 10, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 38, paddingHorizontal: 8 },
  cultureBiteTabSelected: { backgroundColor: colors.gold },
  cultureBiteTabText: { color: colors.muted, fontFamily: fonts.accent, fontSize: 11, fontWeight: '900' },
  cultureBiteTabTextSelected: { color: '#1a0f00' },
  cultureFactList: { gap: spacing.xs },
  cultureFactRow: { alignItems: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  cultureFactIcon: { alignItems: 'center', backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  cultureFactTag: { color: colors.gold, fontFamily: fonts.label, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  cultureFactTitle: { color: colors.text, fontFamily: fonts.accent, fontSize: 12, fontWeight: '900', marginTop: 2 },
  cultureFactText: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 16, marginTop: 3 },
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
