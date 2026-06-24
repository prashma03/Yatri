import type { ComponentProps } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Feature = {
  title: string;
  description: string;
  icon: IoniconName;
  color: string;
};

export type Phrase = {
  nepali: string;
  english: string;
  roman: string;
  tip: string;
};

export type PriceItem = {
  name: string;
  note: string;
  price: string;
  badge: string;
  good?: boolean;
};

export type Festival = {
  name: string;
  date: string;
  description: string;
  icon: MaterialIconName;
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
    tip: 'Locals appreciate this small effort immediately.'
  },
  {
    nepali: 'कति पर्छ?',
    english: 'How much?',
    roman: 'Kati parcha?',
    tip: 'Useful before taxis, markets, and small shops.'
  },
  {
    nepali: 'मिठो छ!',
    english: 'It is delicious!',
    roman: 'Mitho chha!',
    tip: 'Perfect after momo, dal bhat, or homemade tea.'
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
    description: 'Nepal’s biggest festival, with family blessings, tika, kites, and feasts.',
    icon: 'kite'
  },
  {
    name: 'Tihar',
    date: 'Autumn',
    description: 'Festival of lights, marigolds, lamps, and worship of crows, dogs, cows, and Lakshmi.',
    icon: 'string-lights'
  },
  {
    name: 'Indra Jatra',
    date: 'Kathmandu',
    description: 'Chariot processions, masked dances, and Durbar Square celebrations.',
    icon: 'pillar'
  }
];
