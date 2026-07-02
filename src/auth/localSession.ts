const SESSION_KEY = 'yatri_demo_session';
const LOCATION_PROMPT_KEY = 'yatri_location_prompt_complete';

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
