import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  adminSecret: process.env.ADMIN_SECRET || '',
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN || '',
  newsRssFeeds: process.env.NEWS_RSS_FEEDS || '',
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
  }
};

export function getConfiguredFeedUrls() {
  return env.newsRssFeeds
    .split(',')
    .map((feed) => feed.trim())
    .filter(Boolean);
}

export function isFirebaseConfigured() {
  return Boolean(env.firebase.apiKey && env.firebase.projectId && env.firebase.appId);
}
