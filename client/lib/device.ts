import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getAuthSession } from './auth';

const DEVICE_ID_KEY = 'marketguard_device_id';
const DISCLAIMER_KEY = 'marketguard_disclaimer_accepted';

function makeId() {
  return `mgb-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

async function getStoredValue(key: string) {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredValue(key: string) {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function getOrCreateDeviceId() {
  const session = await getAuthSession();
  if (session?.uid) return session.uid;

  const existing = await getStoredValue(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = makeId();
  await setStoredValue(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export async function getDeviceId() {
  const session = await getAuthSession();
  return session?.uid || getStoredValue(DEVICE_ID_KEY);
}

export async function clearLocalDeviceData() {
  await deleteStoredValue(DEVICE_ID_KEY);
  await deleteStoredValue(DISCLAIMER_KEY);
}

export async function hasAcceptedDisclaimer() {
  return (await getStoredValue(DISCLAIMER_KEY)) === 'true';
}

export async function acceptDisclaimer() {
  await setStoredValue(DISCLAIMER_KEY, 'true');
}
