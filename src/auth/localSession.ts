const SESSION_KEY = 'yatri_demo_session';
const LOCATION_PROMPT_KEY = 'yatri_location_prompt_complete';
const TRAVEL_PREFERENCES_KEY = 'yatri_travel_preferences';
const TRAVEL_PREFERENCES_COMPLETE_KEY = 'yatri_travel_preferences_complete';

export type TravelerPreferences = {
  travelStyle: 'luxury' | 'culture' | 'nature' | 'balanced' | null;
  pace: 'relaxed' | 'flexible' | 'active' | null;
  interests: string[];
};

function getStorage() {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
}

export function loadRememberedSession() {
  return getStorage()?.getItem(SESSION_KEY) === 'signed-in';
}

export function rememberSession() {
  getStorage()?.setItem(SESSION_KEY, 'signed-in');
}

export function clearRememberedSession() {
  getStorage()?.removeItem(SESSION_KEY);
}

export function hasCompletedLocationPrompt() {
  return getStorage()?.getItem(LOCATION_PROMPT_KEY) === 'complete';
}

export function rememberLocationPrompt() {
  getStorage()?.setItem(LOCATION_PROMPT_KEY, 'complete');
}

export function hasCompletedTravelPreferences() {
  return getStorage()?.getItem(TRAVEL_PREFERENCES_COMPLETE_KEY) === 'complete';
}

export function saveTravelPreferences(preferences: TravelerPreferences) {
  getStorage()?.setItem(TRAVEL_PREFERENCES_KEY, JSON.stringify(preferences));
  getStorage()?.setItem(TRAVEL_PREFERENCES_COMPLETE_KEY, 'complete');
}

export function loadTravelPreferences(): TravelerPreferences | null {
  const value = getStorage()?.getItem(TRAVEL_PREFERENCES_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as TravelerPreferences;
  } catch {
    return null;
  }
}
