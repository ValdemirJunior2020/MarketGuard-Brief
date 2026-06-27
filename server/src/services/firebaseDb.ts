import { createHash } from 'node:crypto';
import { initializeApp, getApps } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { env, isFirebaseConfigured } from '../utils/env.js';
import { defaultFollowTargets } from '../utils/defaultFollowTargets.js';

export type FollowTargetRecord = {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSelected: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DeviceRecord = {
  deviceId: string;
  pushToken?: string | null;
  email?: string | null;
  platform?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type PreferenceRecord = {
  deviceId: string;
  selectedTargetIds: string[];
  customKeywords: string[];
  alertTime: string;
  timezone: string;
  urgentAlerts: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  alertTone: string;
  pauseAllAlerts: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SourceRecord = {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsItemRecord = {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceId?: string;
  publishedAt: string;
  publishedAtMs: number;
  snippet: string;
  aiSummary?: string | null;
  whyItMatters?: string | null;
  possibleAffectedAreas: string[];
  riskLevel: 'low' | 'medium' | 'high';
  isAiSummary: boolean;
  marketRelevanceScore: number;
  createdAt: string;
  updatedAt: string;
};

export type AlertLogRecord = {
  deviceId: string;
  newsItemId?: string;
  type: 'daily' | 'urgent';
  title: string;
  body: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
  createdAt: string;
};

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      apiKey: env.firebase.apiKey,
      authDomain: env.firebase.authDomain,
      projectId: env.firebase.projectId,
      storageBucket: env.firebase.storageBucket,
      messagingSenderId: env.firebase.messagingSenderId,
      appId: env.firebase.appId,
      measurementId: env.firebase.measurementId
    });

export const firestore = getFirestore(firebaseApp);

function requireFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Copy server/.env.example to server/.env and keep the FIREBASE_* values.');
  }
}

function nowIso() {
  return new Date().toISOString();
}

function stableId(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

function cleanArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export async function ensureDefaultFollowTargets() {
  requireFirebase();
  const batch = writeBatch(firestore);
  const timestamp = nowIso();

  for (const target of defaultFollowTargets) {
    batch.set(
      doc(firestore, 'followTargets', target.id),
      {
        ...target,
        updatedAt: timestamp,
        createdAt: timestamp
      },
      { merge: true }
    );
  }

  await batch.commit();
}

export async function getFollowTargets(): Promise<FollowTargetRecord[]> {
  await ensureDefaultFollowTargets();
  const snapshot = await getDocs(collection(firestore, 'followTargets'));
  const targets = snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }) as FollowTargetRecord);

  return targets.sort((a, b) => `${a.category}-${a.name}`.localeCompare(`${b.category}-${b.name}`));
}

export async function upsertDevice(input: {
  deviceId: string;
  pushToken?: string | null;
  email?: string | null;
  platform?: string;
  timezone?: string;
}): Promise<DeviceRecord> {
  requireFirebase();
  const ref = doc(firestore, 'devices', input.deviceId);
  const existing = await getDoc(ref);
  const timestamp = nowIso();
  const previous = existing.exists() ? (existing.data() as Partial<DeviceRecord>) : {};
  const device: DeviceRecord = {
    deviceId: input.deviceId,
    pushToken: input.pushToken === undefined ? previous.pushToken || null : input.pushToken,
    email: input.email === undefined ? previous.email || null : input.email,
    platform: input.platform || previous.platform || 'unknown',
    timezone: input.timezone || previous.timezone || 'UTC',
    createdAt: previous.createdAt || timestamp,
    updatedAt: timestamp
  };

  await setDoc(ref, device, { merge: true });
  return device;
}

export async function deleteDeviceAndPreferences(deviceId: string) {
  requireFirebase();
  await Promise.allSettled([
    deleteDoc(doc(firestore, 'devices', deviceId)),
    deleteDoc(doc(firestore, 'preferences', deviceId))
  ]);
}

export async function upsertPreference(input: {
  deviceId: string;
  selectedTargetIds?: string[];
  customKeywords?: string[];
  alertTime?: string;
  timezone?: string;
  urgentAlerts?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  alertTone?: string;
  pauseAllAlerts?: boolean;
  notificationsEnabled?: boolean;
}): Promise<PreferenceRecord> {
  requireFirebase();
  const ref = doc(firestore, 'preferences', input.deviceId);
  const existing = await getDoc(ref);
  const timestamp = nowIso();
  const previous = existing.exists() ? (existing.data() as Partial<PreferenceRecord>) : {};
  const defaultSelectedIds = defaultFollowTargets.filter((target) => target.defaultSelected).map((target) => target.id);

  const preference: PreferenceRecord = {
    deviceId: input.deviceId,
    selectedTargetIds: input.selectedTargetIds ?? (cleanArray(previous.selectedTargetIds).length ? cleanArray(previous.selectedTargetIds) : defaultSelectedIds),
    customKeywords: input.customKeywords ?? cleanArray(previous.customKeywords),
    alertTime: input.alertTime || previous.alertTime || '08:00',
    timezone: input.timezone || previous.timezone || 'UTC',
    urgentAlerts: input.urgentAlerts ?? previous.urgentAlerts ?? false,
    quietHoursStart: input.quietHoursStart ?? previous.quietHoursStart ?? null,
    quietHoursEnd: input.quietHoursEnd ?? previous.quietHoursEnd ?? null,
    alertTone: input.alertTone || previous.alertTone || 'default',
    pauseAllAlerts: input.pauseAllAlerts ?? previous.pauseAllAlerts ?? false,
    notificationsEnabled: input.notificationsEnabled ?? previous.notificationsEnabled ?? false,
    createdAt: previous.createdAt || timestamp,
    updatedAt: timestamp
  };

  await setDoc(ref, preference, { merge: true });
  return preference;
}

export async function getPreference(deviceId: string): Promise<PreferenceRecord | null> {
  requireFirebase();
  const snapshot = await getDoc(doc(firestore, 'preferences', deviceId));
  return snapshot.exists() ? (snapshot.data() as PreferenceRecord) : null;
}

export async function getNotificationPreferences(): Promise<Array<PreferenceRecord & { device?: DeviceRecord | null }>> {
  requireFirebase();
  const snapshot = await getDocs(collection(firestore, 'preferences'));

  const preferences: Array<PreferenceRecord & { device?: DeviceRecord | null }> = [];
  for (const snap of snapshot.docs) {
    const preference = snap.data() as PreferenceRecord;
    if (!preference.notificationsEnabled || preference.pauseAllAlerts) continue;

    const deviceSnap = await getDoc(doc(firestore, 'devices', preference.deviceId));
    preferences.push({
      ...preference,
      device: deviceSnap.exists() ? (deviceSnap.data() as DeviceRecord) : null
    });
  }

  return preferences;
}

export async function upsertSource(input: { name: string; url: string; rssUrl: string }): Promise<SourceRecord> {
  requireFirebase();
  const id = stableId(input.rssUrl);
  const ref = doc(firestore, 'sources', id);
  const existing = await getDoc(ref);
  const timestamp = nowIso();
  const previous = existing.exists() ? (existing.data() as Partial<SourceRecord>) : {};
  const source: SourceRecord = {
    id,
    name: input.name,
    url: input.url,
    rssUrl: input.rssUrl,
    createdAt: previous.createdAt || timestamp,
    updatedAt: timestamp
  };
  await setDoc(ref, source, { merge: true });
  return source;
}

export async function getNewsByUrl(url: string): Promise<NewsItemRecord | null> {
  requireFirebase();
  const snapshot = await getDoc(doc(firestore, 'newsItems', stableId(url)));
  return snapshot.exists() ? (snapshot.data() as NewsItemRecord) : null;
}

export async function createNewsItem(input: Omit<NewsItemRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsItemRecord> {
  requireFirebase();
  const id = stableId(input.url);
  const timestamp = nowIso();
  const item: NewsItemRecord = {
    id,
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await setDoc(doc(firestore, 'newsItems', id), item);
  return item;
}

export async function getNewsItem(id: string): Promise<NewsItemRecord | null> {
  requireFirebase();
  const snapshot = await getDoc(doc(firestore, 'newsItems', id));
  return snapshot.exists() ? (snapshot.data() as NewsItemRecord) : null;
}

export async function getRecentNewsItems(options: { sinceMs?: number; take?: number } = {}): Promise<NewsItemRecord[]> {
  requireFirebase();
  const take = options.take || 30;
  const maxDocs = Math.max(take, 50);
  const newsRef = collection(firestore, 'newsItems');
  const newsQuery = options.sinceMs
    ? query(newsRef, where('publishedAtMs', '>=', options.sinceMs), limit(maxDocs))
    : query(newsRef, limit(maxDocs));

  const snapshot = await getDocs(newsQuery);
  return snapshot.docs
    .map((snap) => snap.data() as NewsItemRecord)
    .sort((a, b) => b.marketRelevanceScore - a.marketRelevanceScore || b.publishedAtMs - a.publishedAtMs)
    .slice(0, take);
}

export async function createAlertLog(input: Omit<AlertLogRecord, 'createdAt'>): Promise<AlertLogRecord> {
  requireFirebase();
  const log: AlertLogRecord = { ...input, createdAt: nowIso() };
  await addDoc(collection(firestore, 'alertLogs'), log);
  return log;
}
