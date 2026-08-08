import type { ComponentProps } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export type TravelMode = 'culture' | 'adventure';

export type QuickAction = {
  title: string;
  subtitle: string;
  icon: IconName;
  accent: string;
};

export type OfflinePack = {
  title: string;
  size: string;
  status: string;
  description: string;
  icon: IconName;
  progress: number;
};

export type Festival = {
  name: string;
  date: string;
  description: string;
  icon: MaterialIconName;
  countdown: string;
  crowd: string;
  why: string;
  image: string;
  accent: string;
};

export type DiscoverItem = {
  mode: TravelMode;
  title: string;
  location: string;
  tag: string;
  summary: string;
  meta: string;
  image: string;
};

export type TrailAlert = {
  title: string;
  location: string;
  status: string;
  detail: string;
  icon: IconName;
  urgent?: boolean;
};

export type TrailUpdate = {
  route: string;
  update: string;
  time: string;
};

export type CultureFact = {
  title: string;
  tag: string;
  detail: string;
  icon: IconName;
};

export type Phrase = {
  nepali: string;
  english: string;
  roman: string;
  tip: string;
};

export type EtiquetteCard = {
  context: string;
  rule: string;
  detail: string;
  icon: IconName;
};

export type FoodCard = {
  dish: string;
  region: string;
  image: 'momo' | 'dal-bhat' | 'newari-khaja' | 'yomari';
  description: string;
  orderTip: string;
  flavors: string;
  dietary: string;
  spice: string;
  allergens: string;
  price: string;
  tryIn: string;
};

export type PriceTool = {
  item: string;
  range: string;
  phrase: string;
  note: string;
};

export type FairPriceCategory = 'Food' | 'Transport' | 'Shopping' | 'Permits' | 'Connectivity';

export type FairPriceItem = {
  item: string;
  category: FairPriceCategory;
  district: string;
  low: number;
  high: number;
  unit: string;
  phrase: string;
  risk: 'Low' | 'Medium' | 'High';
  tip: string;
  source: string;
};

export type NearbyHotel = {
  name: string;
  area: string;
  address: string;
  distance: string;
  phone: string;
  displayPhone: string;
  note: string;
};

export type DistrictDirectoryItem = {
  district: string;
  province: string;
};

export type DistrictBriefing = {
  district: string;
  province: string;
  base: string;
  elevation: string;
  bestFor: string;
  connectivity: 'Strong' | 'Mixed' | 'Limited';
  transport: string;
  etiquette: string;
  safety: string;
  icon: IconName;
};

export type ScamAlert = {
  title: string;
  location: string;
  reportCount: number;
  time: string;
  risk: 'High' | 'Medium' | 'Low';
  detail: string;
  top: `${number}%`;
  left: `${number}%`;
};

export const quickActions: QuickAction[] = [
  { title: 'SOS', subtitle: 'GPS + help lines', icon: 'medical-outline', accent: '#ff5d6c' },
  { title: 'Fair Price', subtitle: 'Check before paying', icon: 'calculator-outline', accent: '#3ecfb2' },
  { title: 'Ride Tips', subtitle: 'Pathao + inDrive', icon: 'car-outline', accent: '#85b7eb' },
  { title: 'Offline', subtitle: 'Download packs', icon: 'cloud-download-outline', accent: '#f5a623' }
];

export type Feature = {
  title: string;
  description: string;
  icon: IconName;
  color: string;
};

export type PriceItem = {
  name: string;
  note: string;
  price: string;
  badge: string;
  good?: boolean;
};

export const features: Feature[] = [
  {
    title: 'Phrasebook',
    description: 'Useful Nepali phrases, gestures, and pronunciation for daily travel.',
    icon: 'chatbubble-ellipses-outline',
    color: '#ffd87a'
  },
  {
    title: 'Fair Prices',
    description: 'Know what food, rides, permits, and souvenirs should usually cost.',
    icon: 'pricetag-outline',
    color: '#3ecfb2'
  },
  {
    title: 'Festivals',
    description: 'Follow upcoming celebrations and understand what is happening around you.',
    icon: 'calendar-outline',
    color: '#ff8a9d'
  },
  {
    title: 'Offline Guide',
    description: 'Keep essential cultural tips ready even when your signal disappears.',
    icon: 'map-outline',
    color: '#85b7eb'
  }
];

export const phrases: Phrase[] = [
  {
    nepali: 'नमस्ते',
    english: 'Hello',
    roman: 'Namaste',
    tip: 'Bring both palms together at chest level.'
  },
  {
    nepali: 'धन्यवाद',
    english: 'Thank you',
    roman: 'Dhanyabad',
    tip: 'A small effort that is warmly appreciated.'
  },
  {
    nepali: 'कति पर्छ?',
    english: 'How much does it cost?',
    roman: 'Kati parcha?',
    tip: 'Useful before taxis, markets, and small shops.'
  },
  {
    nepali: 'मलाई मद्दत चाहियो',
    english: 'I need help',
    roman: 'Malai maddat chahiyo',
    tip: 'Use clearly in an urgent or confusing situation.'
  },
  {
    nepali: 'मैले बुझिनँ',
    english: "I don't understand",
    roman: 'Maile bujhina',
    tip: 'Pair it with a polite smile and ask them to repeat.'
  },
  {
    nepali: 'शौचालय कहाँ छ?',
    english: 'Where is the restroom?',
    roman: 'Shauchalaya kaha chha?',
    tip: 'Helpful in bus parks, markets, and trail stops.'
  }
];

export const fairPriceCatalog: FairPriceItem[] = [
  { item: 'Momo, 10 pieces', category: 'Food', district: 'Kathmandu', low: 80, high: 160, unit: 'plate', phrase: 'Kati parcha?', risk: 'Low', tip: 'Street stalls are cheaper than tourist cafes; check menu price before ordering.', source: 'Community reference · Kathmandu local cafes' },
  { item: 'Dal bhat set', category: 'Food', district: 'Kathmandu', low: 180, high: 350, unit: 'meal', phrase: 'Refill paucha?', risk: 'Low', tip: 'Local restaurants often include refills; tourist restaurants may charge more.', source: 'Community reference · city restaurants' },
  { item: 'Bottled water 1L', category: 'Food', district: 'Kathmandu', low: 25, high: 60, unit: 'bottle', phrase: 'MRP kati ho?', risk: 'Medium', tip: 'Check printed MRP. Prices near tourist sites can be inflated.', source: 'Community reference · retail/MRP checks' },
  { item: 'Milk tea', category: 'Food', district: 'Kathmandu', low: 25, high: 80, unit: 'cup', phrase: 'Chiya dinus na.', risk: 'Low', tip: 'Small local tea shops are much cheaper than cafes in tourist streets.', source: 'Community reference · tea shops' },
  { item: 'Taxi: Airport to Thamel', category: 'Transport', district: 'Kathmandu', low: 700, high: 1200, unit: 'ride', phrase: 'Meter ma janu huncha?', risk: 'High', tip: 'Airport arrivals are high-risk for overcharging. Compare ride apps or official counters.', source: 'Community reference · traveler reports' },
  { item: 'Taxi: Thamel to Boudha', category: 'Transport', district: 'Kathmandu', low: 500, high: 900, unit: 'ride', phrase: 'Ali sasto huncha?', risk: 'High', tip: 'Agree before entering or use Pathao/inDrive where available.', source: 'Community reference · Kathmandu rides' },
  { item: 'Pathao bike', category: 'Transport', district: 'Kathmandu', low: 25, high: 45, unit: 'km', phrase: 'App price cha?', risk: 'Low', tip: 'Use app fare as anchor; surge and traffic can change the final cost.', source: 'Community reference · ride apps' },
  { item: 'Local bus inside city', category: 'Transport', district: 'Kathmandu', low: 20, high: 60, unit: 'ride', phrase: 'Yo bus kaha jancha?', risk: 'Low', tip: 'Carry small notes. Ask route before boarding.', source: 'Community reference · public transport' },
  { item: 'Tourist bus: Kathmandu to Pokhara', category: 'Transport', district: 'Kathmandu', low: 900, high: 1800, unit: 'seat', phrase: 'Ticket official ho?', risk: 'Medium', tip: 'Use known counters or hotel booking help; confirm pickup point and departure time.', source: 'Community reference · tourist bus counters' },
  { item: 'Pashmina shawl', category: 'Shopping', district: 'Kathmandu', low: 2000, high: 5500, unit: 'piece', phrase: 'Yo genuine ho?', risk: 'High', tip: 'Compare several shops and ask about material. Very high pressure is a red flag.', source: 'Community reference · tourist markets' },
  { item: 'Singing bowl', category: 'Shopping', district: 'Kathmandu', low: 600, high: 2500, unit: 'piece', phrase: 'Arko dekhaunu na.', risk: 'Medium', tip: 'Decorative bowls should cost less than handmade/heavy bowls. Test sound first.', source: 'Community reference · market checks' },
  { item: 'Basic souvenir magnet/keyring', category: 'Shopping', district: 'Kathmandu', low: 100, high: 350, unit: 'piece', phrase: 'Discount huncha?', risk: 'Medium', tip: 'Bundle prices are usually better than buying one item at a tourist-shop first quote.', source: 'Community reference · souvenir shops' },
  { item: 'Ncell/NTC SIM starter pack', category: 'Connectivity', district: 'Kathmandu', low: 100, high: 500, unit: 'SIM', phrase: 'Official rate kati ho?', risk: 'High', tip: 'Use official counters when possible and confirm data pack details before paying.', source: 'Community reference · SIM counters' },
  { item: 'Heritage site guide approach', category: 'Shopping', district: 'Kathmandu', low: 500, high: 1500, unit: 'short tour', phrase: 'License cha?', risk: 'High', tip: 'Ask for guide ID/license and agree scope/time before starting.', source: 'Community reference · heritage areas' },
  { item: 'Pokhara Lakeside taxi short ride', category: 'Transport', district: 'Kaski', low: 300, high: 700, unit: 'ride', phrase: 'Meter cha?', risk: 'Medium', tip: 'Agree fare first; tourist-zone prices can jump at night or rain.', source: 'Community reference · Pokhara rides' },
  { item: 'Pokhara boat rental', category: 'Transport', district: 'Kaski', low: 700, high: 1800, unit: 'hour/boat', phrase: 'Life jacket cha?', risk: 'Medium', tip: 'Confirm duration, route, and life jacket before paying.', source: 'Community reference · lakeside operators' },
  { item: 'Chitwan jeep safari seat', category: 'Transport', district: 'Chitwan', low: 1800, high: 3500, unit: 'person', phrase: 'Permit included cha?', risk: 'Medium', tip: 'Ask what is included: park fee, guide, pickup, and duration.', source: 'Community reference · Sauraha operators' },
  { item: 'Trekking porter daily wage', category: 'Transport', district: 'Solukhumbu', low: 2500, high: 4500, unit: 'day', phrase: 'Insurance included cha?', risk: 'High', tip: 'Use ethical agencies and confirm insurance, load limit, food, and lodging.', source: 'Community reference · trekking agencies' },
  { item: 'Restricted area permit check', category: 'Permits', district: 'Mustang', low: 0, high: 0, unit: 'official only', phrase: 'Official permit counter kaha cha?', risk: 'High', tip: 'Permit prices change and must be checked through official channels or licensed agencies.', source: 'Official check required · Department of Immigration' }
];

export const fairPriceSourceNote = 'Community price reference, not an official tariff · reviewed July 6, 2026 · verify locally before paying';

export const foodPrices: PriceItem[] = [
  {
    name: 'Momo, 10 pieces',
    note: 'Street stall or local cafe',
    price: 'Rs. 60-100',
    badge: 'fair',
    good: true
  },
  {
    name: 'Dal bhat',
    note: 'Local restaurant, usually with refills',
    price: 'Rs. 150-250',
    badge: 'fair',
    good: true
  },
  {
    name: 'Bottled water',
    note: 'Can be inflated near tourist spots',
    price: 'Rs. 20-30',
    badge: 'check',
    good: false
  }
];

export const transportPrices: PriceItem[] = [
  {
    name: 'Pathao bike',
    note: 'Fast inside Kathmandu traffic',
    price: 'Rs. 25/km',
    badge: 'app',
    good: true
  },
  {
    name: 'Airport to Thamel',
    note: 'Car ride range before late-night markup',
    price: 'Rs. 600-900',
    badge: 'range',
    good: true
  },
  {
    name: 'Local bus',
    note: 'Cheapest cross-city option',
    price: 'Rs. 20-150',
    badge: 'cash',
    good: true
  }
];

export const festivals: Festival[] = [
  {
    name: 'Janai Purnima / Raksha Bandhan',
    date: 'Aug 28, 2026',
    description: 'Sacred-thread rituals, wrist bands, family visits, and kwati soup traditions.',
    icon: 'ribbon',
    countdown: 'Before Dashain',
    crowd: 'Temples busy',
    why: 'Important late-monsoon festival observed across Nepal before the autumn festival season peaks.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    accent: '#85b7eb'
  },
  {
    name: 'Gai Jatra',
    date: 'Aug 29, 2026',
    description: 'Kathmandu Valley processions remember loved ones with satire, music, and cow symbols.',
    icon: 'cow',
    countdown: 'Before Dashain',
    crowd: 'Kathmandu crowds',
    why: 'One of the most visible Newar festivals for travelers in Bhaktapur, Patan, and Kathmandu.',
    image: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?auto=format&fit=crop&w=900&q=80',
    accent: '#b65334'
  },
  {
    name: 'Gaura Parba',
    date: 'Sep 4, 2026',
    description: 'Far-western Nepal celebrates Shiva and Parvati with songs, fasting, and community gatherings.',
    icon: 'flower-tulip',
    countdown: 'Before Dashain',
    crowd: 'Regional festival',
    why: 'Especially meaningful in Sudurpashchim and Karnali, so travelers should expect local programs.',
    image: 'https://images.unsplash.com/photo-1600100594070-c16b588d42c9?auto=format&fit=crop&w=900&q=80',
    accent: '#3ecfb2'
  },
  {
    name: 'Krishna Janmashtami',
    date: 'Sep 4, 2026',
    description: 'Devotees visit Krishna temples, especially Patan Krishna Mandir, with evening worship.',
    icon: 'hands-pray',
    countdown: 'Before Dashain',
    crowd: 'Temple queues',
    why: 'A good day to plan extra time around Patan Durbar Square and major Krishna temples.',
    image: 'https://images.unsplash.com/photo-1617469165786-8007eda3caa7?auto=format&fit=crop&w=900&q=80',
    accent: '#f5a623'
  },
  {
    name: 'Haritalika Teej',
    date: 'Sep 14, 2026',
    description: 'Women gather in red saris for fasting, songs, dancing, and Shiva temple visits.',
    icon: 'dance-ballroom',
    countdown: 'Before Dashain',
    crowd: 'Very busy temples',
    why: 'Expect crowds around Pashupatinath and major Shiva temples; dress and photograph respectfully.',
    image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=900&q=80',
    accent: '#ff8a9d'
  },
  {
    name: 'Rishi Panchami',
    date: 'Sep 16, 2026',
    description: 'A quieter ritual day following Teej, with cleansing rites and temple visits.',
    icon: 'water-outline',
    countdown: 'Before Dashain',
    crowd: 'Moderate temple crowds',
    why: 'Useful context for travelers seeing continued Teej-related rituals after the main festival day.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    accent: '#5ba7a4'
  },
  {
    name: 'Indra Jatra',
    date: 'Sep 25, 2026',
    description: 'Kathmandu’s street festival with Kumari chariot processions and masked dances.',
    icon: 'pillar',
    countdown: 'Before Dashain',
    crowd: 'High crowd',
    why: 'It marks the start of Kathmandu’s biggest autumn festival stretch before Dashain.',
    image: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?auto=format&fit=crop&w=900&q=80',
    accent: '#b65334'
  },
  {
    name: 'Dashain begins: Ghatasthapana',
    date: 'Oct 11, 2026',
    description: 'Dashain starts with jamara planting, temple visits, and preparations for family travel.',
    icon: 'kite',
    countdown: 'Major festival',
    crowd: 'Travel rush begins',
    why: 'Transport fills quickly as families travel home; tourists should book buses and flights early.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    accent: '#f5a623'
  },
  {
    name: 'Vijaya Dashami',
    date: 'Oct 20, 2026',
    description: 'The main Dashain tika day, with family blessings, jamara, feasts, and limited services.',
    icon: 'kite',
    countdown: 'Main Dashain day',
    crowd: 'Family festival',
    why: 'Many shops and services close or run reduced hours; plan meals, cash, and transport ahead.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    accent: '#f5a623'
  },
  {
    name: 'Tihar',
    date: 'Nov 7-11, 2026',
    description: 'Festival of lights with marigolds, oil lamps, animal worship, and Bhai Tika.',
    icon: 'string-lights',
    countdown: 'After Dashain',
    crowd: 'Evening lights',
    why: 'A major post-Dashain festival; expect decorated homes, Deusi-Bhailo songs, and busy evenings.',
    image: 'https://images.unsplash.com/photo-1600100594070-c16b588d42c9?auto=format&fit=crop&w=900&q=80',
    accent: '#3ecfb2'
  }
];

export const festivalContentSource = 'Reviewed July 6, 2026 · 2026 Nepal public holiday calendar; local dates may vary by lunar observance and community.';

export const offlinePacks: OfflinePack[] = [
  {
    title: 'Culture + Phrases',
    size: '42 MB',
    status: 'Ready offline',
    description: 'Festival calendar, etiquette cards, fair price guide, and essential phrase audio.',
    icon: 'language-outline',
    progress: 1
  },
  {
    title: 'Trekking Map Lite',
    size: '118 MB',
    status: 'Download',
    description: 'Lightweight trail map with teahouses, water points, viewpoints, and checkpoints.',
    icon: 'map-outline',
    progress: 0.38
  },
  {
    title: 'Emergency Kit',
    size: '9 MB',
    status: 'Ready offline',
    description: 'Tourist police, hospital, embassy, AMS warning signs, and rescue checklist.',
    icon: 'shield-checkmark-outline',
    progress: 1
  }
];

export const discoverItems: DiscoverItem[] = [
  {
    mode: 'adventure',
    title: 'Australian Camp',
    location: 'Near Pokhara',
    tag: 'Day hike',
    summary: 'A scenic ridge walk with Annapurna views, village stops, and sunrise potential.',
    meta: 'Moderate - 5 hr - Mountain views',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80'
  },
  {
    mode: 'adventure',
    title: 'Poon Hill',
    location: 'Annapurna region',
    tag: 'Multi-day trek',
    summary: 'Classic sunrise panorama with teahouse stays and rhododendron forests.',
    meta: 'Moderate - 3 to 5 days - Sunrise',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=900&q=80'
  },
  {
    mode: 'culture',
    title: 'Patan Heritage Walk',
    location: 'Lalitpur',
    tag: 'Historic walk',
    summary: 'Courtyards, temples, metal workshops, and Newari food within a compact route.',
    meta: 'Easy - 2 hr - Architecture',
    image: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?auto=format&fit=crop&w=900&q=80'
  },
  {
    mode: 'culture',
    title: 'Boudha Morning Kora',
    location: 'Kathmandu',
    tag: 'Ritual walk',
    summary: 'Walk clockwise around the stupa with pilgrims, butter lamps, and monastery sounds.',
    meta: 'Easy - 45 min - Etiquette',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80'
  }
];

export const trailAlerts: TrailAlert[] = [
  {
    title: 'Weather shift',
    location: 'Annapurna Base Camp',
    status: 'Watch afternoon clouds',
    detail: 'Start early and confirm teahouse availability before moving above Deurali.',
    icon: 'thunderstorm-outline',
    urgent: true
  },
  {
    title: 'AMS reminder',
    location: 'Above 2,800 m',
    status: 'Ascend slowly',
    detail: 'Headache, nausea, dizziness, or sleep trouble can be early altitude sickness signs.',
    icon: 'pulse-outline',
    urgent: true
  },
  {
    title: 'Water point',
    location: 'Ghorepani trail',
    status: 'Marked offline',
    detail: 'Carry purification tablets; refill points can change after heavy rain.',
    icon: 'water-outline'
  }
];

export const trailUpdates: TrailUpdate[] = [
  {
    route: 'Tatopani to Ghorepani',
    update: 'Muddy section after rain; poles recommended.',
    time: '2 hr ago'
  },
  {
    route: 'Mardi High Camp',
    update: 'Clear morning views, strong wind after noon.',
    time: 'Today'
  },
  {
    route: 'Jhinu bridge',
    update: 'Bridge open; avoid late crossing in heavy rain.',
    time: 'Yesterday'
  }
];

export const cultureFacts: CultureFact[] = [
  {
    title: 'Eight Himalayan giants',
    tag: 'Mountains',
    detail: 'Eight of the world’s fourteen peaks above 8,000 meters rise in Nepal, including Everest.',
    icon: 'triangle-outline'
  },
  {
    title: 'Buddha’s birthplace',
    tag: 'Lumbini',
    detail: 'Lumbini is recognized as the birthplace of Siddhartha Gautama and has been a UNESCO World Heritage Site since 1997.',
    icon: 'flower-outline'
  },
  {
    title: 'Festivals through the year',
    tag: 'Celebration',
    detail: 'Nepal’s many communities mark the calendar with distinct festivals, music, food, processions, and family traditions.',
    icon: 'sparkles-outline'
  },
  {
    title: 'Many traditions, one Nepal',
    tag: 'People',
    detail: 'Customs vary widely by region and community, with Hindu, Buddhist, Kirat, Muslim, Christian, Bon, and other traditions present.',
    icon: 'people-outline'
  }
];

export const etiquetteCards: EtiquetteCard[] = [
  {
    context: 'At a temple',
    rule: 'Walk clockwise and remove shoes where required.',
    detail: 'Watch what locals do at entrances and avoid stepping over offerings.',
    icon: 'footsteps-outline'
  },
  {
    context: 'Around people',
    rule: 'Do not point your feet at people or sacred objects.',
    detail: 'Feet are considered low and the head is treated as sacred.',
    icon: 'body-outline'
  },
  {
    context: 'Taking photos',
    rule: 'Ask before photographing rituals or monks.',
    detail: 'Some courtyards, cremation areas, and shrines prohibit photography.',
    icon: 'camera-outline'
  }
];

export const foodCards: FoodCard[] = [
  {
    dish: 'Momo',
    region: 'Across Nepal',
    image: 'momo',
    description: 'Steamed dumplings served with a bright tomato-sesame achar.',
    orderTip: 'Say “veg momo dinus na” for a vegetarian plate.',
    flavors: 'Savory · tangy achar',
    dietary: 'Veg or meat',
    spice: 'Mild–hot achar',
    allergens: 'Usually wheat; ask about sesame and soy',
    price: 'Rs. 150–350 / plate',
    tryIn: 'Kathmandu, Pokhara and town cafés'
  },
  {
    dish: 'Dal Bhat',
    region: 'Everyday Nepal',
    image: 'dal-bhat',
    description: 'Nepal’s everyday rice-and-lentil meal with vegetables, greens and achar.',
    orderTip: 'Ask whether dal, rice and tarkari refills are included.',
    flavors: 'Comforting · earthy · balanced',
    dietary: 'Often vegetarian',
    spice: 'Usually mild',
    allergens: 'Ask about dairy and gluten in sides',
    price: 'Rs. 250–650 / set',
    tryIn: 'Local bhatti and family restaurants'
  },
  {
    dish: 'Newari Khaja Set',
    region: 'Kathmandu Valley',
    image: 'newari-khaja',
    description: 'A generous Newari platter built around beaten rice and many savory sides.',
    orderTip: 'Veg sets are available; confirm before ordering because choila is meat.',
    flavors: 'Toasty · smoky · spicy',
    dietary: 'Veg or meat',
    spice: 'Medium–hot',
    allergens: 'May contain soy, sesame and eggs',
    price: 'Rs. 300–700 / set',
    tryIn: 'Patan, Kirtipur and Bhaktapur'
  },
  {
    dish: 'Yomari',
    region: 'Newari sweet',
    image: 'yomari',
    description: 'Steamed rice-flour dumpling traditionally filled with chaku and sesame.',
    orderTip: 'Ask for chaku filling for the classic sweet version.',
    flavors: 'Soft · warm · molasses-sweet',
    dietary: 'Usually vegetarian',
    spice: 'Not spicy',
    allergens: 'Often sesame; confirm dairy preparation',
    price: 'Rs. 60–150 / piece',
    tryIn: 'Newari cafés in the Kathmandu Valley'
  }
];

export const priceTools: PriceTool[] = [
  {
    item: 'Taxi: Thamel to Boudha',
    range: 'Rs. 500-800',
    phrase: 'Ali sasto huncha?',
    note: 'Confirm price before entering; ride apps may be cheaper in traffic.'
  },
  {
    item: 'Pashmina shawl',
    range: 'Rs. 2,000-5,000',
    phrase: 'Yo genuine ho?',
    note: 'Ask about material and compare multiple shops before buying.'
  },
  {
    item: 'Singing bowl',
    range: 'Rs. 500-1,500',
    phrase: 'Arko dekhaunu na.',
    note: 'Test the sound; decorative bowls should cost less than handmade bowls.'
  }
];

export const nearbyHotels: NearbyHotel[] = [
  {
    name: 'KGH Thamel',
    area: 'Saatghumti, Thamel',
    address: 'Kathmandu Guest House, Saatghumti, Thamel, Kathmandu, Nepal',
    distance: '0.3 km from Thamel center',
    phone: '+97714700632',
    displayPhone: '+977 1 470 0632',
    note: 'Central garden property near the main Thamel walking streets.'
  },
  {
    name: 'Aloft Kathmandu Thamel',
    area: 'Chhaya Devi Complex, Amrit Marg',
    address: 'Aloft Kathmandu Thamel, Chhaya Devi Complex, Amrit Marg, Kathmandu, Nepal',
    distance: '0.5 km from Thamel center',
    phone: '+97715252000',
    displayPhone: '+977 1 525 2000',
    note: 'Full-service hotel inside Chhaya Center in central Thamel.'
  },
  {
    name: 'Hotel Yak & Yeti',
    area: 'Durbar Marg',
    address: 'Hotel Yak and Yeti, Paryatak Marg, Durbar Marg, Kathmandu, Nepal',
    distance: '1.8 km from Thamel center',
    phone: '+97714248999',
    displayPhone: '+977 1 424 8999',
    note: 'Heritage hotel near Durbar Marg and the palace museum.'
  }
];

export const districtDirectory: DistrictDirectoryItem[] = [
  { district: 'Achham', province: 'Sudurpashchim Province' },
  { district: 'Arghakhanchi', province: 'Lumbini Province' },
  { district: 'Baglung', province: 'Gandaki Province' },
  { district: 'Baitadi', province: 'Sudurpashchim Province' },
  { district: 'Bajhang', province: 'Sudurpashchim Province' },
  { district: 'Bajura', province: 'Sudurpashchim Province' },
  { district: 'Banke', province: 'Lumbini Province' },
  { district: 'Bara', province: 'Madhesh Province' },
  { district: 'Bardiya', province: 'Lumbini Province' },
  { district: 'Bhaktapur', province: 'Bagmati Province' },
  { district: 'Bhojpur', province: 'Koshi Province' },
  { district: 'Chitwan', province: 'Bagmati Province' },
  { district: 'Dadeldhura', province: 'Sudurpashchim Province' },
  { district: 'Dailekh', province: 'Karnali Province' },
  { district: 'Dang', province: 'Lumbini Province' },
  { district: 'Darchula', province: 'Sudurpashchim Province' },
  { district: 'Dhading', province: 'Bagmati Province' },
  { district: 'Dhankuta', province: 'Koshi Province' },
  { district: 'Dhanusha', province: 'Madhesh Province' },
  { district: 'Dolakha', province: 'Bagmati Province' },
  { district: 'Dolpa', province: 'Karnali Province' },
  { district: 'Doti', province: 'Sudurpashchim Province' },
  { district: 'Eastern Rukum', province: 'Lumbini Province' },
  { district: 'Gorkha', province: 'Gandaki Province' },
  { district: 'Gulmi', province: 'Lumbini Province' },
  { district: 'Humla', province: 'Karnali Province' },
  { district: 'Ilam', province: 'Koshi Province' },
  { district: 'Jajarkot', province: 'Karnali Province' },
  { district: 'Jhapa', province: 'Koshi Province' },
  { district: 'Jumla', province: 'Karnali Province' },
  { district: 'Kailali', province: 'Sudurpashchim Province' },
  { district: 'Kalikot', province: 'Karnali Province' },
  { district: 'Kanchanpur', province: 'Sudurpashchim Province' },
  { district: 'Kapilvastu', province: 'Lumbini Province' },
  { district: 'Kaski', province: 'Gandaki Province' },
  { district: 'Kathmandu', province: 'Bagmati Province' },
  { district: 'Kavrepalanchok', province: 'Bagmati Province' },
  { district: 'Khotang', province: 'Koshi Province' },
  { district: 'Lalitpur', province: 'Bagmati Province' },
  { district: 'Lamjung', province: 'Gandaki Province' },
  { district: 'Mahottari', province: 'Madhesh Province' },
  { district: 'Makwanpur', province: 'Bagmati Province' },
  { district: 'Manang', province: 'Gandaki Province' },
  { district: 'Morang', province: 'Koshi Province' },
  { district: 'Mugu', province: 'Karnali Province' },
  { district: 'Mustang', province: 'Gandaki Province' },
  { district: 'Myagdi', province: 'Gandaki Province' },
  { district: 'Nawalpur', province: 'Gandaki Province' },
  { district: 'Nuwakot', province: 'Bagmati Province' },
  { district: 'Okhaldhunga', province: 'Koshi Province' },
  { district: 'Palpa', province: 'Lumbini Province' },
  { district: 'Panchthar', province: 'Koshi Province' },
  { district: 'Parasi', province: 'Lumbini Province' },
  { district: 'Parbat', province: 'Gandaki Province' },
  { district: 'Parsa', province: 'Madhesh Province' },
  { district: 'Pyuthan', province: 'Lumbini Province' },
  { district: 'Ramechhap', province: 'Bagmati Province' },
  { district: 'Rasuwa', province: 'Bagmati Province' },
  { district: 'Rautahat', province: 'Madhesh Province' },
  { district: 'Rolpa', province: 'Lumbini Province' },
  { district: 'Rupandehi', province: 'Lumbini Province' },
  { district: 'Salyan', province: 'Karnali Province' },
  { district: 'Sankhuwasabha', province: 'Koshi Province' },
  { district: 'Saptari', province: 'Madhesh Province' },
  { district: 'Sarlahi', province: 'Madhesh Province' },
  { district: 'Sindhuli', province: 'Bagmati Province' },
  { district: 'Sindhupalchok', province: 'Bagmati Province' },
  { district: 'Siraha', province: 'Madhesh Province' },
  { district: 'Solukhumbu', province: 'Koshi Province' },
  { district: 'Sunsari', province: 'Koshi Province' },
  { district: 'Surkhet', province: 'Karnali Province' },
  { district: 'Syangja', province: 'Gandaki Province' },
  { district: 'Tanahun', province: 'Gandaki Province' },
  { district: 'Taplejung', province: 'Koshi Province' },
  { district: 'Tehrathum', province: 'Koshi Province' },
  { district: 'Udayapur', province: 'Koshi Province' },
  { district: 'Western Rukum', province: 'Karnali Province' }
];

export const districtBriefings: DistrictBriefing[] = [
  {
    district: 'Kathmandu',
    province: 'Bagmati Province',
    base: 'Thamel or Boudha',
    elevation: 'About 1,400 m',
    bestFor: 'Heritage, food, temples',
    connectivity: 'Strong',
    transport: 'Use ride apps or agree on a metered taxi before departure; allow extra time for traffic.',
    etiquette: 'Walk clockwise around stupas and check signs before entering Hindu temple interiors.',
    safety: 'Keep valuables close in crowded heritage areas and use official counters for permits or tickets.',
    icon: 'business-outline'
  },
  {
    district: 'Kaski',
    province: 'Gandaki Province',
    base: 'Pokhara Lakeside',
    elevation: 'About 820 m',
    bestFor: 'Lakes, day hikes, Annapurna access',
    connectivity: 'Strong',
    transport: 'Tourist buses arrive near Lakeside; confirm jeep routes and road conditions before trail transfers.',
    etiquette: 'Ask before photographing village homes or ceremonies outside the main visitor areas.',
    safety: 'Monsoon rain can disrupt roads and trails quickly; check local conditions before leaving Pokhara.',
    icon: 'water-outline'
  },
  {
    district: 'Solukhumbu',
    province: 'Koshi Province',
    base: 'Lukla or Namche Bazaar',
    elevation: '2,860-3,440 m',
    bestFor: 'Everest region trekking',
    connectivity: 'Limited',
    transport: 'Flights and mountain roads are weather-sensitive; keep buffer days and carry essential cash.',
    etiquette: 'Pass mani walls and prayer stones on the left, moving clockwise where the path allows.',
    safety: 'Ascend gradually, never climb higher with altitude symptoms, and keep your offline route available.',
    icon: 'trail-sign-outline'
  },
  {
    district: 'Mustang',
    province: 'Gandaki Province',
    base: 'Jomsom',
    elevation: 'About 2,720 m',
    bestFor: 'High desert, monasteries, road trips',
    connectivity: 'Mixed',
    transport: 'Strong afternoon winds and road conditions can delay flights, buses, and shared jeeps.',
    etiquette: 'Ask before entering monastery rooms or photographing religious art and ceremonies.',
    safety: 'Carry cash, sun and wind protection, and confirm whether your route needs a restricted-area permit.',
    icon: 'partly-sunny-outline'
  },
  {
    district: 'Chitwan',
    province: 'Bagmati Province',
    base: 'Sauraha',
    elevation: 'About 150 m',
    bestFor: 'Wildlife, Tharu culture, river trips',
    connectivity: 'Strong',
    transport: 'Tourist buses connect Sauraha with Kathmandu and Pokhara; arrange park activities locally.',
    etiquette: 'Choose community-led cultural visits and ask before photographing residents or homes.',
    safety: 'Follow guide instructions near the park, avoid walking alone at its edges, and prepare for heat.',
    icon: 'leaf-outline'
  }
];

export const scamAlerts: ScamAlert[] = [
  {
    title: 'Taxi overcharge cluster',
    location: 'Tribhuvan Airport arrivals',
    reportCount: 18,
    time: '12 min ago',
    risk: 'High',
    detail: 'Drivers quoting fixed tourist fares before meter or app comparison.',
    top: '28%',
    left: '69%'
  },
  {
    title: 'Fake guide approach',
    location: 'Durbar Square north gate',
    reportCount: 9,
    time: '31 min ago',
    risk: 'Medium',
    detail: 'Unlicensed helpers asking for entry cash away from the official booth.',
    top: '50%',
    left: '43%'
  },
  {
    title: 'SIM card markup',
    location: 'Thamel side streets',
    reportCount: 6,
    time: '1 hr ago',
    risk: 'Low',
    detail: 'Travelers report add-on data packs priced above posted NTC/Ncell rates.',
    top: '36%',
    left: '28%'
  }
];

export const filterChips = [
  'Day trip',
  'Multi-day trek',
  'Lazy stroll',
  'Moderate hike',
  'Waterfalls',
  'Sunrise',
  'Bird watching'
];
