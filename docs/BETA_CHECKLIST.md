# Beta safety and store checklist

## Required before external beta

- [ ] Replace all bracketed operator and contact details in Privacy Policy and Terms.
- [ ] Publish Privacy Policy, Terms, contact, and account-deletion instructions at stable HTTPS URLs.
- [ ] Complete Apple App Privacy and Google Play Data Safety answers from the actual production build.
- [ ] Confirm Supabase region, retention, backups, email templates, redirect URLs, and abuse limits.
- [ ] Deploy the database migration, seed data, and delete-account Edge Function.
- [ ] Assign moderator roles only through trusted admin tooling.
- [ ] Test GPS denial, approximate location, offline queueing, photo upload, SMS composer, calls, and deletion on physical Android and iOS devices.
- [ ] Add a monitored support inbox and an incident/moderation response policy.
- [ ] Add production error monitoring only after documenting its collected data.
- [ ] Run accessibility checks with VoiceOver, TalkBack, larger text, and reduced motion.

## Store disclosure notes

Yatri processes account identifiers, precise foreground location when the user invokes a location feature, user-generated report text/photos, and user-entered contacts. Location is not collected in the background. Emergency contacts are private. Community report location and content are shared publicly by design. Safety check-in selections remain local in this MVP.
