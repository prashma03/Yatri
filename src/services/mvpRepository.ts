import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { supabase } from '../auth/supabase';

const REPORT_QUEUE_KEY = 'yatri_pending_safety_reports_v1';
const PACKS_KEY = 'yatri_offline_district_packs_v1';
const CONTACTS_KEY = 'yatri_emergency_contacts_v1';

export type ReportStatus = 'community' | 'verified' | 'rejected';
export type SafetyReport = {
  id: string;
  reporter_id: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  district: string | null;
  photo_path: string | null;
  verification_status: ReportStatus;
  vote_count: number;
  created_at: string;
};

export type NewSafetyReport = {
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  district?: string;
  photoUri?: string | null;
};

export type TrustedContact = {
  id: string;
  kind: 'trusted' | 'embassy';
  name: string;
  phone: string;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

async function isOnline() {
  const state = await Network.getNetworkStateAsync();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function currentUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function uploadReportPhoto(userId: string, reportId: string, uri?: string | null) {
  if (!supabase || !uri) return null;
  const response = await fetch(uri);
  const bytes = await response.arrayBuffer();
  const extension = uri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const path = `${userId}/${reportId}.${extension}`;
  const { error } = await supabase.storage.from('report-photos').upload(path, bytes, {
    contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
    upsert: false
  });
  if (error) throw error;
  return path;
}

async function insertReport(input: NewSafetyReport, userId: string): Promise<{ duplicateId?: string; report?: SafetyReport }> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const latitudeWindow = 0.002;
  const longitudeWindow = 0.002;
  const { data: duplicate } = await supabase
    .from('scam_reports')
    .select('id')
    .eq('category', input.category)
    .gte('created_at', since)
    .gte('latitude', input.latitude - latitudeWindow)
    .lte('latitude', input.latitude + latitudeWindow)
    .gte('longitude', input.longitude - longitudeWindow)
    .lte('longitude', input.longitude + longitudeWindow)
    .limit(1)
    .maybeSingle();

  if (duplicate?.id) {
    await supabase.from('report_votes').upsert({ report_id: duplicate.id, user_id: userId });
    return { duplicateId: duplicate.id };
  }

  const { data, error } = await supabase.from('scam_reports').insert({
    reporter_id: userId,
    category: input.category,
    description: input.description.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    district: input.district ?? null
  }).select('*').single();
  if (error) throw error;

  const report = data as SafetyReport;
  if (input.photoUri) {
    const photoPath = await uploadReportPhoto(userId, report.id, input.photoUri);
    const { error: photoError } = await supabase.from('scam_reports').update({ photo_path: photoPath }).eq('id', report.id);
    if (photoError) throw photoError;
    report.photo_path = photoPath;
  }
  return { report };
}

export async function submitSafetyReport(input: NewSafetyReport) {
  const userId = await currentUserId();
  if (!userId || !(await isOnline())) {
    const queue = await readJson<NewSafetyReport[]>(REPORT_QUEUE_KEY, []);
    await AsyncStorage.setItem(REPORT_QUEUE_KEY, JSON.stringify([...queue, { ...input, photoUri: null }]));
    return { queued: true, duplicateId: undefined };
  }
  const result = await insertReport(input, userId);
  return { queued: false, ...result };
}

export async function syncPendingReports() {
  const userId = await currentUserId();
  if (!userId || !(await isOnline())) return 0;
  const queue = await readJson<NewSafetyReport[]>(REPORT_QUEUE_KEY, []);
  const remaining: NewSafetyReport[] = [];
  let synced = 0;
  for (const report of queue) {
    try { await insertReport(report, userId); synced += 1; } catch { remaining.push(report); }
  }
  await AsyncStorage.setItem(REPORT_QUEUE_KEY, JSON.stringify(remaining));
  return synced;
}

export async function listSafetyReports() {
  if (!supabase || !(await isOnline())) return [] as SafetyReport[];
  const { data, error } = await supabase.from('scam_reports').select('*').neq('verification_status', 'rejected').order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data as SafetyReport[];
}

export function subscribeToSafetyReports(onChange: () => void) {
  if (!supabase) return () => undefined;
  const channel = supabase.channel('public-safety-reports').on('postgres_changes', { event: '*', schema: 'public', table: 'scam_reports' }, onChange).subscribe();
  return () => { void supabase.removeChannel(channel); };
}

export async function voteForReport(reportId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const userId = await currentUserId();
  if (!userId) throw new Error('Sign in to confirm a community report.');
  const { error } = await supabase.from('report_votes').upsert({ report_id: reportId, user_id: userId });
  if (error) throw error;
}

export async function saveDistrictPack(district: string, payload: unknown) {
  const packs = await readJson<Record<string, { savedAt: string; payload: unknown }>>(PACKS_KEY, {});
  packs[district] = { savedAt: new Date().toISOString(), payload };
  await AsyncStorage.setItem(PACKS_KEY, JSON.stringify(packs));
  if (supabase) {
    const userId = await currentUserId();
    if (userId && await isOnline()) await supabase.from('saved_districts').upsert({ user_id: userId, district });
  }
  return packs[district];
}

export async function getSavedDistrictPacks() {
  return readJson<Record<string, { savedAt: string; payload: unknown }>>(PACKS_KEY, {});
}

export async function listTrustedContacts(): Promise<TrustedContact[]> {
  const local = await readJson<TrustedContact[]>(CONTACTS_KEY, []);
  if (!supabase || !(await isOnline())) return local;
  const userId = await currentUserId();
  if (!userId) return local;
  const { data } = await supabase.from('trusted_contacts').select('id,kind,name,phone').eq('user_id', userId);
  if (data) await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(data));
  return (data as TrustedContact[] | null) ?? local;
}

export async function saveTrustedContact(contact: Omit<TrustedContact, 'id'>) {
  const item = { ...contact, id: `local-${Date.now()}` };
  const local = await readJson<TrustedContact[]>(CONTACTS_KEY, []);
  await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify([...local.filter((entry) => entry.kind !== contact.kind), item]));
  if (supabase) {
    const userId = await currentUserId();
    if (userId && await isOnline()) {
      await supabase.from('trusted_contacts').delete().eq('user_id', userId).eq('kind', contact.kind);
      await supabase.from('trusted_contacts').insert({ kind: contact.kind, name: contact.name, phone: contact.phone, user_id: userId });
    }
  }
  return item;
}

export async function deleteCurrentAccount() {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.functions.invoke('delete-account');
  if (error) throw error;
  await AsyncStorage.multiRemove([REPORT_QUEUE_KEY, PACKS_KEY, CONTACTS_KEY]);
  await supabase.auth.signOut();
}

export async function getCurrentRole() {
  if (!supabase) return 'traveler';
  const userId = await currentUserId();
  if (!userId) return 'traveler';
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  return (data?.role as 'traveler' | 'moderator' | 'admin' | undefined) ?? 'traveler';
}

export async function listPendingReports() {
  if (!supabase) return [] as SafetyReport[];
  const { data, error } = await supabase.from('scam_reports').select('*').eq('verification_status', 'community').order('created_at', { ascending: false });
  if (error) throw error;
  return data as SafetyReport[];
}

export async function moderateReport(reportId: string, status: 'verified' | 'rejected', note: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('scam_reports').update({ verification_status: status, moderation_note: note.trim() || null }).eq('id', reportId);
  if (error) throw error;
}

export async function saveProfilePreferences(preferences: unknown) {
  if (!supabase) return;
  const userId = await currentUserId();
  if (!userId || !(await isOnline())) return;
  const { error } = await supabase.from('profiles').update({ preferences, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw error;
}
