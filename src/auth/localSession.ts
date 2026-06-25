const SESSION_KEY = 'yatri_demo_session';

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
