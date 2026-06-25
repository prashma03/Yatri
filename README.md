# Yatri

Yatri is a free travel companion for Nepal. It helps travelers with phrases and gestures, fair prices, festival context, ride tips, and cultural highlights.

## Tech stack

- TypeScript
- React Native
- Expo

## Run the app

Install dependencies:

```bash
npm install
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
- Feature cards for phrasebook, fair prices, festivals, and offline guide
- Essential Nepali phrases
- Namaste gesture guidance
- Food, drink, ride, and transport price guide
- Festival and culture cards
- Custom Yatri logo mark and wordmark assets
- Login and sign-up prototype with local web session remembering

The original `index.html` is kept as the visual design reference.

## Auth status

The current login flow is a front-end prototype. In the web preview, "Remember me" stores a demo signed-in flag in local browser storage so refreshes stay on the dashboard.

For production accounts, connect an auth provider such as Supabase, Firebase Auth, Clerk, or Auth0. Production auth should use provider-managed email verification, password hashing, password reset, and session refresh.
