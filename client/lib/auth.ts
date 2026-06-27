import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'marketguard_auth_session';
const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '';

type FirebaseAuthResponse = {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
};

export type AuthSession = {
  uid: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeSession(response: FirebaseAuthResponse): AuthSession {
  const expiresInSeconds = Number(response.expiresIn || 3600);
  return {
    uid: response.localId,
    email: normalizeEmail(response.email),
    idToken: response.idToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + expiresInSeconds * 1000
  };
}

function friendlyFirebaseError(code?: string) {
  switch (code) {
    case 'EMAIL_EXISTS':
      return 'This email already has an account. Please sign in instead.';
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_LOGIN_CREDENTIALS':
    case 'INVALID_PASSWORD':
      return 'Invalid email or password.';
    case 'WEAK_PASSWORD : Password should be at least 6 characters':
    case 'WEAK_PASSWORD':
      return 'Password should be at least 6 characters.';
    case 'INVALID_EMAIL':
      return 'Please enter a valid email address.';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'Too many attempts. Please try again later.';
    case 'OPERATION_NOT_ALLOWED':
      return 'Email/password sign-in is not enabled in Firebase Authentication.';
    case 'TOKEN_EXPIRED':
    case 'USER_NOT_FOUND':
      return 'Your session expired. Please sign in again.';
    default:
      return code ? code.replace(/_/g, ' ') : 'Authentication failed.';
  }
}

async function readStorage(key: string) {
  if (Platform.OS === 'web') return window.localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function writeStorage(key: string, value: string) {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeStorage(key: string) {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function requireFirebaseApiKey() {
  if (!FIREBASE_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_FIREBASE_API_KEY in client/.env');
  }
}

async function callFirebaseAuth(endpoint: 'signUp' | 'signInWithPassword', payload: Record<string, unknown>) {
  requireFirebaseApiKey();

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(friendlyFirebaseError(json?.error?.message));
  }

  return json as FirebaseAuthResponse;
}

async function refreshSession(session: AuthSession) {
  if (!FIREBASE_API_KEY) return session;

  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken
    }).toString()
  });

  const json = await response.json();

  if (!response.ok) {
    await signOut();
    throw new Error('Your session expired. Please sign in again.');
  }

  const refreshed: AuthSession = {
    uid: json.user_id,
    email: session.email,
    idToken: json.id_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + Number(json.expires_in || 3600) * 1000
  };

  await saveAuthSession(refreshed);
  return refreshed;
}

export async function saveAuthSession(session: AuthSession) {
  await writeStorage(SESSION_KEY, JSON.stringify(session));
}

export async function getAuthSession() {
  const raw = await readStorage(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (!session.uid || !session.email || !session.idToken) return null;

    const shouldRefresh = session.expiresAt && session.expiresAt - Date.now() < 5 * 60 * 1000;
    return shouldRefresh ? refreshSession(session) : session;
  } catch {
    await removeStorage(SESSION_KEY);
    return null;
  }
}

export async function signUp(email: string, password: string) {
  const response = await callFirebaseAuth('signUp', {
    email: normalizeEmail(email),
    password,
    returnSecureToken: true
  });

  const session = makeSession(response);
  await saveAuthSession(session);
  return session;
}

export async function signIn(email: string, password: string) {
  const response = await callFirebaseAuth('signInWithPassword', {
    email: normalizeEmail(email),
    password,
    returnSecureToken: true
  });

  const session = makeSession(response);
  await saveAuthSession(session);
  return session;
}

export async function deleteAccount() {
  requireFirebaseApiKey();

  const session = await getAuthSession();

  if (!session?.idToken) {
    await signOut();
    return;
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: session.idToken
    })
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(friendlyFirebaseError(json?.error?.message));
  }

  await signOut();
}

export async function signOut() {
  await removeStorage(SESSION_KEY);
}

export async function getCurrentUserId() {
  const session = await getAuthSession();
  return session?.uid || null;
}