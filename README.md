# MarketGuard Brief

**Market-moving news before it moves you.**

MarketGuard Brief is an iOS-first Expo React Native app with a Render-ready Node.js backend. It helps daily traders follow public statements, official announcements, speeches, economic remarks, and public news that may affect market sentiment or volatility.

The product is intentionally positioned as **news intelligence and risk awareness only**. It is not a brokerage, investment advisor, trading signal app, portfolio tool, or execution platform.

## Important update: Firebase instead of PostgreSQL

This version uses **Firebase Firestore** for the backend database and **Firebase Authentication** for email/password sign up and login. Prisma and PostgreSQL were removed because local PostgreSQL was causing this error:

```text
Can't reach database server at localhost:5432
```

The backend now stores data in Firestore collections:

```text
devices
preferences
followTargets
newsItems
sources
alertLogs
```

## Monorepo structure

```text
marketguard-brief/
  client/   # Expo React Native app
  server/   # Express + Firebase Firestore backend
```

## Compliance position

MarketGuard Brief provides informational news summaries only. It is not financial advice, investment advice, legal advice, or a trading recommendation. Always verify information from primary sources before making financial decisions.

Some summaries are generated with AI from public news and official sources. AI summaries may be incomplete or inaccurate. Always open the original source.

## Windows PowerShell setup

### Root

```powershell
cd marketguard-brief
```

### Server

Open PowerShell:

```powershell
cd server
copy .env.example .env
npm install
npm run dev
```

The server listens on:

```text
http://localhost:3000
```

Test it in the browser:

```text
http://localhost:3000/health
```

Expected response:

```json
{
  "ok": true,
  "app": "MarketGuard Brief",
  "database": "Firebase Firestore",
  "firebaseConfigured": true
}
```

### Client

Open a second PowerShell window:

```powershell
cd client
copy .env.example .env
npm install
npm run dev
```

When Expo starts, press:

```text
w
```

The browser app opens at:

```text
http://localhost:8081
```

Set the backend URL in `client\.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```


## Firebase Authentication setup

This version includes email/password sign up and login.

In Firebase Console:

1. Open project `quizzhp-3729a`
2. Go to **Authentication**
3. Click **Get started** if needed
4. Go to **Sign-in method**
5. Enable **Email/Password**
6. Save

The client uses the Firebase Authentication REST API with your public Firebase Web API key. The API key is not an OpenAI/admin secret. Your OpenAI key and admin secret remain server-side only.

## Firebase setup

The server uses the Firebase Web SDK configuration from `server\.env`:

```env
FIREBASE_API_KEY="AIzaSyA51gDGvIJ01cwLGRiqwNVxAkNUWfr5WcE"
FIREBASE_AUTH_DOMAIN="quizzhp-3729a.firebaseapp.com"
FIREBASE_PROJECT_ID="quizzhp-3729a"
FIREBASE_STORAGE_BUCKET="quizzhp-3729a.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID="511564005836"
FIREBASE_APP_ID="1:511564005836:web:fa8075e18dd34b47535d69"
FIREBASE_MEASUREMENT_ID="G-XC6SB8RM4J"
```

### Firestore must be enabled

In Firebase Console:

1. Open your project: `quizzhp-3729a`
2. Go to **Firestore Database**
3. Create database if it does not exist
4. Start in test mode for local development, or use the sample local testing rules below

### Local testing Firestore rules

Use these only while testing locally:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, lock this down before App Store submission. The current backend uses public Firebase web config so local testing is simple. For a production-only locked database, switch the backend to Firebase Admin SDK with a service account.

## Environment variables

### server\.env

```env
FIREBASE_API_KEY="AIzaSyA51gDGvIJ01cwLGRiqwNVxAkNUWfr5WcE"
FIREBASE_AUTH_DOMAIN="quizzhp-3729a.firebaseapp.com"
FIREBASE_PROJECT_ID="quizzhp-3729a"
FIREBASE_STORAGE_BUCKET="quizzhp-3729a.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID="511564005836"
FIREBASE_APP_ID="1:511564005836:web:fa8075e18dd34b47535d69"
FIREBASE_MEASUREMENT_ID="G-XC6SB8RM4J"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
ADMIN_SECRET="change-this-admin-secret"
EXPO_ACCESS_TOKEN=""
NEWS_RSS_FEEDS="https://www.federalreserve.gov/feeds/press_all.xml,https://www.sec.gov/news/pressreleases.rss"
NODE_ENV="development"
PORT="3000"
```

### client\.env

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA51gDGvIJ01cwLGRiqwNVxAkNUWfr5WcE
```

## Ingest news into Firebase

After the server is running, call the admin ingest endpoint:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/api/admin/ingest-news `
  -Headers @{ "x-admin-secret" = "change-this-admin-secret" }
```

This will read the configured RSS feeds, summarize with OpenAI if `OPENAI_API_KEY` exists, and save items into the Firestore `newsItems` collection. If no OpenAI key is provided, the backend uses a neutral fallback summary.

## Backend endpoints

```text
GET    /health
POST   /api/device/register
DELETE /api/device/:deviceId
GET    /api/follow-targets
POST   /api/preferences
GET    /api/preferences/:deviceId
GET    /api/news/today?deviceId=
GET    /api/news/:id
POST   /api/admin/ingest-news
POST   /api/admin/send-daily-briefs
```

Admin endpoints require this header:

```text
x-admin-secret: YOUR_ADMIN_SECRET
```

## iOS build using EAS from Windows

You can build the iOS app from Windows using EAS cloud builds.

```powershell
cd marketguard-brief\client
npm install -g eas-cli
eas login
eas build:configure
eas build -p ios
```

## Render deployment

The backend is configured with `server/render.yaml`.

1. Push this repository to GitHub.
2. In Render, create a Blueprint or Web Service using `server/render.yaml`.
3. Add the Firebase and OpenAI environment variables in Render.
4. Confirm `/health` returns `firebaseConfigured: true`.

Required Render environment variables:

```text
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
OPENAI_API_KEY
OPENAI_MODEL
ADMIN_SECRET
EXPO_ACCESS_TOKEN
NEWS_RSS_FEEDS
NODE_ENV
PORT
```

## Troubleshooting

### Browser error: `ExpoSecureStore.default.getValueWithKeyAsync is not a function`

Fixed in this version. The app now uses `localStorage` on web and `expo-secure-store` on iOS/Android for disclaimer/device/session storage.

### Web bundling error: `Cannot find module react-native-worklets/plugin`

Fixed in this version. `react-native-worklets` was added to the client package.

### Server error: `Can't reach database server at localhost:5432`

Fixed in this version. PostgreSQL/Prisma was removed. The backend now uses Firebase Firestore.

### Save button returns Firebase permission error

Enable Firestore and use permissive test rules while developing locally. Then restart the server:

```powershell
cd server
npm run dev
```

## App icon

The app currently includes placeholder assets:

```text
client/assets/icon.png
client/assets/adaptive-icon.png
client/assets/splash.png
```

The final icon prompt is stored here:

```text
client/assets/APP_ICON_PROMPT.md
```

Do not use transparent backgrounds for the final App Store icon. iOS applies the rounded mask automatically.

## Production audit notes

- The client never contains an OpenAI API key.
- Push notifications are optional and requested only after onboarding explains the benefit.
- The app remains usable if notifications are declined.
- News detail screens include source, timestamp, AI summary label, and disclaimer footer.
- The backend uses official/configurable RSS feed URLs and does not include hardcoded scraping logic.
- Admin endpoints require `ADMIN_SECRET`.
- Render uses `process.env.PORT || 3000` and binds to `0.0.0.0`.
- Firestore is used instead of PostgreSQL.
- Email/password sign up and login are included with Firebase Authentication.
