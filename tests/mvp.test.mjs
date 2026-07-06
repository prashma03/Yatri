import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const schema = await readFile(new URL('../supabase/migrations/202607050001_safety_mvp.sql', import.meta.url), 'utf8');
const appConfig = JSON.parse(await readFile(new URL('../app.json', import.meta.url), 'utf8'));
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('report trust states and row-level security are present', () => {
  assert.match(schema, /community.*verified.*rejected/);
  assert.match(schema, /enable row level security/);
  assert.match(schema, /reports authenticated insert/);
  assert.match(schema, /reports moderator update/);
});

test('only foreground location is configured', () => {
  const plugin = appConfig.expo.plugins.find((entry) => Array.isArray(entry) && entry[0] === 'expo-location');
  assert.equal(plugin[1].isIosBackgroundLocationEnabled, false);
  assert.equal(plugin[1].isAndroidBackgroundLocationEnabled, false);
  assert.deepEqual(appConfig.expo.android.permissions.sort(), ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION']);
});

test('MVP device dependencies are pinned to Expo SDK 52 versions', () => {
  assert.equal(packageJson.dependencies['expo-location'], '~18.0.10');
  assert.equal(packageJson.dependencies['expo-network'], '~7.0.5');
  assert.equal(packageJson.dependencies['expo-sms'], '~13.0.1');
});
