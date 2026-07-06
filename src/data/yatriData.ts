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
  orderTip: string;
  flavors: string;
};

export type PriceTool = {
  item: string;
  range: string;
  phrase: string;
  note: string;
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
    name: 'Dashain',
    date: 'Autumn',
    description: 'Nepal’s biggest festival, with tika blessings, kites, and family feasts.',
    icon: 'kite',
    countdown: 'Upcoming',
    crowd: 'Family festival',
    why: 'Nepal’s biggest festival, with tika blessings, kites, and family feasts.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80',
    accent: '#f5a623'
  },
  {
    name: 'Tihar',
    date: 'Autumn',
    description: 'Festival of lights with marigolds, oil lamps, and Lakshmi worship.',
    icon: 'string-lights',
    countdown: 'Upcoming',
    crowd: 'Evening lights',
    why: 'Festival of lights with marigolds, oil lamps, and Lakshmi worship.',
    image: 'https://images.unsplash.com/photo-1600100594070-c16b588d42c9?auto=format&fit=crop&w=900&q=80',
    accent: '#3ecfb2'
  },
  {
    name: 'Indra Jatra',
    date: 'Kathmandu',
    description: 'Chariot processions, masked dances, and Durbar Square celebrations.',
    icon: 'pillar',
    countdown: 'Live route',
    crowd: 'High crowd',
    why: 'Chariot processions, masked dances, and Durbar Square celebrations.',
    image: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?auto=format&fit=crop&w=900&q=80',
    accent: '#b65334'
  }
];

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
    dish: 'Yomari',
    region: 'Newari',
    orderTip: 'Ask for chaku filling if you want the classic sweet version.',
    flavors: 'Steamed rice flour, molasses, sesame'
  },
  {
    dish: 'Thakali Set',
    region: 'Thakali',
    orderTip: 'Look for gundruk, timur achar, and balanced refills.',
    flavors: 'Rice, lentils, curry, pickles, greens'
  },
  {
    dish: 'Sherpa Stew',
    region: 'Mountain',
    orderTip: 'Best after a cold trek day; ask if yak cheese is available.',
    flavors: 'Broth, potatoes, noodles, vegetables'
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
