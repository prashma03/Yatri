# Yatri production launch checklist

Use this when moving from the local Expo build to a real public beta or store build.

## 1. Supabase project

- Create the production Supabase project.
- Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the Expo environment.
- Run the migration and seed:

```bash
supabase db push
supabase db seed
```

- Enable email/password auth.
- Configure Site URL and redirect URLs for web, Expo preview, Android, and iOS builds.
- Configure custom SMTP with a Yatri sender such as `no-reply@your-domain`.
- Customize email templates for confirm signup, reset password, and magic links.
- Create moderator/admin users and assign roles only through trusted admin tooling.

## 2. Edge functions and secrets

Deploy:

```bash
supabase functions deploy delete-account
supabase functions deploy travel-assistant --no-verify-jwt
```

Set secrets:

```bash
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set YATRI_AI_ENDPOINT=https://your-model-endpoint
supabase secrets set YATRI_AI_API_KEY=your-private-model-key
supabase secrets set YATRI_AI_MODEL=your-model-name
```

Never put service-role or private AI keys in Expo `.env`.

## 3. Public legal/support pages

- Publish Privacy Policy, Terms, support/contact, and account deletion instructions.
- Add the public URLs to `.env`:

```bash
EXPO_PUBLIC_PRIVACY_URL=https://your-domain/privacy
EXPO_PUBLIC_TERMS_URL=https://your-domain/terms
EXPO_PUBLIC_SUPPORT_URL=https://your-domain/contact
```

The login screen shows these links automatically when the URLs are present.

## 4. Data readiness

- Review all fair-price ranges and mark source dates.
- Expand richer district briefings beyond the seed districts.
- Add famous places, local food notes, emergency references, and hotel/search guidance for priority districts.
- Decide which content is community reference versus official source.

## 5. Safety operations

- Assign a human owner for report moderation.
- Define response times for flagged reports.
- Document abuse handling for fake reports, doxxing, harassment, and dangerous misinformation.
- Test report queueing offline, sync after reconnect, voting, flagging, and moderator verification.

## 6. Device QA

Test on:

- Desktop web at 1280, 1440, and wide monitor widths.
- Mobile web at common iPhone and Android widths.
- Android physical device through Expo/EAS.
- iOS physical device through Expo/EAS.

Required flows:

- Continue as guest.
- Sign up, email confirmation, sign in, reset password, sign out.
- Travel preferences and location-denied flow.
- District picker, hotel map search, fair-price checker.
- Scam report with and without photo.
- Offline report queue and later sync.
- SOS contact add, GPS refresh, SMS composer, and emergency call links.
- AI assistant fallback and configured model response.

## 7. Store release

- Build preview:

```bash
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

- Prepare screenshots for phone and tablet/desktop-style web if needed.
- Fill Apple App Privacy and Google Play Data Safety accurately.
- Explain foreground location, user reports/photos, contacts, and account deletion.
- Do not claim official government affiliation unless you have it.

## 8. Payment/tipping

The guide tipping UI is visual only. Before enabling money movement:

- Choose a payment provider supported in Nepal/target markets.
- Add clear refund, dispute, and guide payout rules.
- Add fraud review and tax/accounting handling.
- Update Terms and Privacy Policy before launch.
