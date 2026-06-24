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
    nepali: 'Namaste',
    english: 'Hello',
    roman: 'Namaste',
    tip: 'Bring both palms together at chest level.'
  },
  {
    nepali: 'Dhanyabad',
    english: 'Thank you',
    roman: 'Dhanyabad',
    tip: 'Locals appreciate this small effort immediately.'
  },
  {
    nepali: 'Kati parcha?',
    english: 'How much?',
    roman: 'Kati parcha?',
    tip: 'Useful before taxis, markets, and small shops.'
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
