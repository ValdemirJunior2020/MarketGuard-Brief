# MarketGuard Brief — App Store Checklist

## Positioning

- Recommended category: **News** or **Finance**, with the app clearly positioned as informational news intelligence only.
- Not a brokerage.
- Not investment advice.
- No trading execution.
- No portfolio management.
- No price predictions.
- No guaranteed alerts.
- No claims of guaranteed accuracy, profit, or loss prevention.

## Required user-facing disclosures

- Include this disclaimer during onboarding and in Settings:

  > MarketGuard Brief provides informational news summaries only. It is not financial advice, investment advice, legal advice, or a trading recommendation. Always verify information from primary sources before making financial decisions.

- Include this AI disclosure in onboarding, Privacy, and article details:

  > Some summaries are generated with AI from public news and official sources. AI summaries may be incomplete or inaccurate. Always open the original source.

## Notifications

- Push notifications are optional.
- User must explicitly opt in before notifications are enabled.
- User can use the app if notifications are declined.
- User can opt out.
- User can pause all alerts.
- User can disable urgent alerts.
- User can change alert time and timezone.
- Notification copy must stay neutral and source-linked inside the app.

## Privacy

- Privacy policy required before App Store submission.
- The app explains data collected:
  - push notification token
  - selected followed topics/people
  - preferred alert time
  - timezone
  - account email used for sign in and support
- Privacy deletion action included.
- Delete server preferences action included.

## Content and AI

- AI disclosure included.
- Source links included.
- Every news detail includes headline, source, timestamp, AI summary label when applicable, original source button, and disclaimer.
- Avoid sensational or fear-based language.
- Avoid partisan commentary.
- Avoid claiming certainty about market outcomes.

## App icon and metadata

- App icon must be 1024x1024.
- App icon must be opaque with no transparency.
- No rounded corners in source icon because iOS applies masking.
- No political faces, flags, real company logos, or copyrighted symbols.
- App Store subtitle suggestion: **AI news alerts for traders**.

## Review readiness

- Because login is now included, prepare a demo account for App Store review or include account creation instructions in review notes.
- Backend must be live during review.
- Support URL required.
- Privacy URL required.
- Contact support placeholder should be replaced with a real support email or URL before submission.
- Test push notification opt-in and opt-out flow before submission.
- Confirm OpenAI API key is server-side only.

## Backend and data storage

- Backend database uses Firebase Firestore instead of PostgreSQL.
- Firestore security rules must be reviewed before App Store submission.
- Do not leave broad local testing rules enabled in production.
- Firebase client configuration and Firebase Web API key are allowed in app/server configuration, but OpenAI API keys and admin secrets must remain server-side only.
- Email/password sign-in must be enabled in Firebase Authentication before testing or App Store review.
