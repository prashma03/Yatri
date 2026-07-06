# Yatri

Yatri is a free Nepal safety companion. The MVP is focused on one promise: help travelers avoid scams and stay safer offline with scam alerts, district packs, SOS contacts, fair-price references, and phrases.

## Tech stack

- TypeScript
- React Native
- Expo
- Supabase

## Run the app

Install dependencies:

```bash
npm install
```

If Expo asks you to align native module versions, run:

```bash
npx expo install expo-location expo-network expo-sms expo-image-picker
```

Start the app:

```bash
npm start
```

Then scan the QR code with the Expo Go app, or run it in a browser with:

```bash
npm run web
```

## What is built

- Mobile home screen inspired by the original HTML design
- Nepal travel hero section
- Feature cards for phrasebook, fair prices, scam alerts, SOS, and offline district packs
- Essential Nepali phrases
- Namaste gesture guidance
- Food, drink, ride, and transport price guide
- Custom Yatri logo mark and wordmark assets
- Supabase email/password sign-in, sign-up, email verification, password reset, session restoration, and sign-out
- Supabase-backed profiles, safety reports, report votes, saved districts, trusted contacts, sourced content, and photo storage
- Real foreground GPS for nearby reports and SOS messages
- Offline report queueing, district-pack saves, and later sync
- Community-report versus verified-alert moderation flow
- Account deletion Edge Function scaffold
- Privacy policy, terms, beta checklist, and EAS build config

The original `index.html` is kept as the visual design reference.

## Supabase authentication

Create a `.env` file from `.env.example` and add the project URL and publishable anon key from your Supabase project:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

In Supabase Authentication settings, enable the Email provider and configure the Site URL/redirect URLs for the builds you deploy. Never put the service-role key in the app.

Restart Expo after changing `.env`. Supabase manages password hashing, email confirmation, token refresh, and persisted sessions; native sessions are stored with AsyncStorage.

## Supabase backend setup

Apply the database schema and seed sourced safety content:

```bash
supabase db push
supabase db seed
```

The migration creates protected tables for profiles, scam reports, votes, saved districts, trusted contacts, and content items. Row-level security is enabled, public report reads exclude rejected reports, and moderator-only updates separate community reports from verified alerts.

Deploy the account deletion function:

```bash
supabase functions deploy delete-account
```

Set these Supabase function secrets before using it:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Use the service-role key only in Supabase server-side functions, never in the Expo app.

## Location, SMS, and privacy

The app requests foreground location only. It uses GPS while the app is open for nearby scam reports and SOS message text. Background location is not configured.

Publish these pages before store review and add their public URLs to `.env`:

```bash
EXPO_PUBLIC_PRIVACY_URL=https://your-domain/privacy
EXPO_PUBLIC_TERMS_URL=https://your-domain/terms
EXPO_PUBLIC_SUPPORT_URL=https://your-domain/contact
```

Drafts live in:

- `docs/PRIVACY.md`
- `docs/TERMS.md`
- `docs/BETA_CHECKLIST.md`

## Build and beta

Create native builds with EAS:

```bash
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

Before TestFlight or Google Play internal testing, complete the checklist in `docs/BETA_CHECKLIST.md`, test SOS SMS/calling on physical Android and iOS devices, and fill Apple privacy plus Google Data Safety disclosures for account data, reports, contacts, photos, and foreground location.

## Verification

Run the lightweight MVP checks with:

```bash
npm test
```

Run the TypeScript check with:

```bash
npm run typecheck
```
