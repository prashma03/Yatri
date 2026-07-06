import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const LAST_LOCATION_KEY = 'yatri_last_location_v1';

export type SavedLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
};

export async function getForegroundLocation(requestPermission = false): Promise<SavedLocation | null> {
  let permission = await Location.getForegroundPermissionsAsync();
  if (permission.status !== 'granted' && requestPermission) {
    permission = await Location.requestForegroundPermissionsAsync();
  }
  if (permission.status !== 'granted') return null;

  const quick = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000, requiredAccuracy: 500 });
  const result = quick ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const saved = {
    latitude: result.coords.latitude,
    longitude: result.coords.longitude,
    accuracy: result.coords.accuracy,
    timestamp: result.timestamp
  };
  await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(saved));
  return saved;
}

export async function getSavedLocation(): Promise<SavedLocation | null> {
  const raw = await AsyncStorage.getItem(LAST_LOCATION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as SavedLocation; } catch { return null; }
}

export function formatCoordinates(location: SavedLocation) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

export function formatLocationAge(timestamp: number) {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}
