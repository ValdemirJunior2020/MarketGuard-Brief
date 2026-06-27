import { DEFAULT_TARGETS } from '../constants/followTargets';
import { getAuthSession } from './auth';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export type RegisterDevicePayload = {
  deviceId: string;
  email?: string | null;
  pushToken?: string | null;
  platform?: string;
  timezone: string;
  alertTime: string;
  notificationsEnabled: boolean;
};

export type PreferencePayload = {
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
};

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  snippet: string;
  aiSummary?: string | null;
  whyItMatters?: string | null;
  possibleAffectedAreas: string[];
  riskLevel: 'low' | 'medium' | 'high';
  isAiSummary: boolean;
  marketRelevanceScore: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await getAuthSession();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.idToken ? { Authorization: `Bearer ${session.idToken}` } : {}),
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || `Request failed: ${response.status}`;

    try {
      const parsed = JSON.parse(text) as { error?: string };
      message = parsed.error || message;
    } catch {
      // Keep original text when the backend response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function registerDevice(payload: RegisterDevicePayload) {
  return request('/api/device/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteDevice(deviceId: string) {
  return request(`/api/device/${encodeURIComponent(deviceId)}`, {
    method: 'DELETE'
  });
}

export async function getFollowTargets() {
  try {
    return await request('/api/follow-targets');
  } catch {
    return { targets: DEFAULT_TARGETS };
  }
}

export async function savePreferences(payload: PreferencePayload) {
  return request('/api/preferences', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getPreferences(deviceId: string) {
  return request<{ preference: PreferencePayload | null }>(`/api/preferences/${encodeURIComponent(deviceId)}`);
}

export async function getTodayNews(deviceId: string) {
  return request<{ items: NewsItem[]; lastUpdated: string }>(
    `/api/news/today?deviceId=${encodeURIComponent(deviceId)}`
  );
}

export async function getNewsItem(id: string) {
  return request<{ item: NewsItem }>(`/api/news/${encodeURIComponent(id)}`);
}
