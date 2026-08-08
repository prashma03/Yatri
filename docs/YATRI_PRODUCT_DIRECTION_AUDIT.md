# Yatri product-direction audit

Audited August 8, 2026 against the direction: **“Yatri — your on-the-ground travel companion for Nepal.”**

## Executive conclusion

Yatri should not be rebuilt. It already has a credible safety/offline foundation and several unusually useful traveler tools. The missing product layer is a trip workspace that connects those tools around a traveler’s current destination, day, and budget.

The recommended next build is **Trip Foundation**, not a visual redesign and not a larger AI assistant. It should introduce a persistent trip, days, activities, and expenses, then let existing district sites, fair-price entries, offline packs, and safety tools attach to that trip.

## Status definitions

- **Working:** implemented behavior backed by local persistence, device capability, or Supabase.
- **Partial:** useful UI and some logic exist, but the feature is static, shallow, or not connected to a complete workflow.
- **Presentation only:** the interface implies a capability that is not backed by the required data or service.
- **Missing:** no meaningful domain model, persistence, or workflow exists.

## Capability audit

| Product capability | Status | What exists now | Important gap |
| --- | --- | --- | --- |
| Guest-first access | Working | Users can continue as a guest, skip preferences, and browse without creating an account. | The guest prompt appears immediately after entry and can still feel like an early conversion gate. Account prompts should happen when saving/syncing. |
| Travel preferences | Partial | Travel style, pace, and interests are stored locally and optionally copied into the profile. | No destinations, travel dates, party size, budget, or trip record. Preferences personalize copy/cards, not an itinerary. |
| Home / “Today” | Partial | Responsive dashboard, current selected district, weather presentation, quick tools, district details, and featured sites. | No date-aware “Today,” current trip, next activity, daily spend, or computed recommendation pipeline. Weather is presentation data rather than a weather-service integration. |
| Trip Mode | Missing | No trip, trip-day, activity, or itinerary types/tables/services. | This is the main missing product layer. |
| Itinerary | Missing | Some discover entries describe routes and sites have map links. | No add/reorder/remove activity workflow, time blocks, day grouping, directions, or cost roll-up. |
| Expense tracking | Missing | No expense UI, model, local key, database table, or budget calculation. | Requires trip-aware expenses, category totals, remaining budget, and offline persistence. |
| Fair Price | Working MVP | 19 searchable references, category/district filtering, quote comparison, risk levels, phrases, and overcharge verdicts. | Values are curated constants. No user-paid-price submission, timestamps per observation, aggregation, confidence, moderation, or historical intelligence. |
| Transport | Partial | Fair-price entries cover selected rides/buses; ride tips and external map search exist. | No origin/destination planner, schedules, departure points, route options, duration comparison, provider sources, or “Add to Trip.” |
| Destination pages | Partial | 77-district directory, 5 detailed district briefings, 82 site records, etiquette, best-time guidance, imagery, and external Google Maps search. | Most district-site descriptions are generic. There are no structured hours, entrance fees, coordinates, visit duration, live distance, rating provenance, saved-place state, or related transport options. |
| Near Me | Presentation only | Foreground GPS exists; reports use coordinates; hotel cards and district content are shown as nearby-style content. | No places API, geospatial query, distance sorting, open-now filtering, hospitals/ATMs/toilets/pharmacies, or embedded map. Hotel distances are curated strings. |
| Maps | Partial | External Google Maps search links and a stylized community-report plot. | No map SDK/provider dependency, map tiles, routing, markers backed by a real map, offline map data, or turn-by-turn navigation. The safety “map” is a visual coordinate plot. |
| Offline district packs | Working small MVP | District payloads save to AsyncStorage; saved timestamps sync to `saved_districts`; reports queue offline and sync later; contacts cache locally. | The advertised pack sizes/content are not real downloaded bundles. No asset manifest, versioning, eviction, integrity checks, offline map tiles, itinerary bundle, or download progress engine. |
| Phrase survival kit | Partial | 6 phrases with Nepali, English, romanization, tips, and categories in the UI. | No audio files or playback, and coverage is too small for taxi/restaurant/shopping/emergency flows. |
| Safety + SOS | Working MVP | Foreground GPS, location age, SMS composer, call links, local/synced contacts, community reports, duplicate detection, voting, flagging, moderation, photo upload, RLS, and realtime refresh. | Emergency/hospital/embassy data is not location-aware or sourced per destination. Safety-critical content still needs authoritative review and physical-device QA. |
| Scam intelligence | Working MVP | Reports, trust states, flags, moderation metadata, offline queue, realtime refresh, and protected writes. | Nearby reads are not server-side geospatial queries; the client loads up to 50 recent reports and plots them. District is currently hardcoded to Kathmandu on submission. |
| Events/cultural experiences | Partial | Curated 2026 festivals and detailed experiences such as Pashupatinath Evening Aarati. | No event ingestion/update service, date/location filtering, reminders, operating status, or trip integration. |
| Lodging | Presentation only | Three curated Kathmandu hotels plus generic fallback guidance and Google Maps/tel links. | Not a hotel search or availability system; “LIVE” should not imply real-time availability/data. |
| Weather | Presentation only | Weather card and some static trail conditions. | No weather API, forecast retrieval, location binding, cache policy, source timestamp, or warning ingestion. |
| Currency | Partial | Official Nepal Rastra Bank link is prominently available. | No fetched/cached exchange rate, conversion tool, source timestamp, or offline last-known rate. |
| Accounts and sync | Working foundation | Supabase email auth, profile preferences, RLS, saved districts, reports, contacts, account deletion. | No trip/saved-place/expense/download sync models. Guest-to-account data migration is not defined. |
| AI assistant | Working but non-core | Floating assistant, local safety/price/etiquette answers, and optional Edge Function/model endpoint. | It is globally prominent before Yatri has trip infrastructure. It should not drive roadmap priority or make unsourced live claims. |

## What is genuinely strong

### Safety and trust architecture

The Supabase migration is the most production-shaped part of Yatri. It includes row-level security, community/verified/rejected report states, report votes, abuse flags, moderator-only workflows, private contacts, private photo storage, and deletion support.

### Offline behavior

Offline reporting is functional rather than decorative: reports can be queued locally and later synchronized. District payloads and contacts also persist locally. This provides a sound base for a real offline-trip bundle.

### Fair-price interaction

Fair Price already behaves like a tool: users can search, filter, enter a quote, and receive a rule-based verdict. It is the best candidate for Yatri’s distinctive long-term data product.

### Nepal-specific content structure

Yatri contains all 77 districts, 82 district-site records, focused Kathmandu/Kaski/Chitwan/Solukhumbu/Mustang briefings, cultural guidance, festival data, food cards, and survival phrases. The breadth is useful, though depth and sourcing vary.

## Claims to correct before a public beta

1. **“Live nearby data”** — there is no general nearby-data provider or geospatial places query.
2. **Hotel “LIVE” badge** — the three Kathmandu hotels are curated constants, not live availability/search results.
3. **Weather card** — the displayed Kathmandu weather is not fetched from a weather source.
4. **Offline pack sizes/progress** — the displayed MB sizes and download progress do not represent downloaded manifests/assets.
5. **Offline map/navigation language** — no map SDK, tile bundle, or turn-by-turn implementation exists.
6. **Community safety “map”** — it is a stylized plot, not an actual basemap.
7. **Price freshness** — price references share a broad review note and are not based on timestamped observations.
8. **Generic district sites** — many use representative images and template-like copy; these must not appear equally verified.

Use labels such as **Preview**, **Guide**, **Community reference**, or **Coming next** until the backing systems exist.

## Recommended next build: Trip Foundation

### User outcome

A guest can create one Nepal trip, select destinations and dates, see trip days, add an existing Yatri place to a day, add an expense, and keep everything offline. Sign-in is requested only when the user chooses cloud sync.

### Minimal domain model

```text
Trip
  id, title, startDate, endDate, travelStyle
  budgetAmount, budgetCurrency, homeCurrency
  destinations[], createdAt, updatedAt

TripDay
  id, tripId, date, destinationDistrict, notes

TripActivity
  id, tripDayId, siteKey, title, startTime
  estimatedCostNpr, durationMinutes, status, notes

Expense
  id, tripId, tripDayId?, activityId?
  category, amount, currency, amountNpr, note, spentAt
```

### Implementation sequence

1. Add a `tripRepository` using AsyncStorage with versioned schemas and pure budget/day calculations.
2. Add a Trip page to the existing navigation without reorganizing every other tab.
3. Add optional trip setup: destinations, dates, style, and budget. Do not block guest exploration.
4. Add “Add to trip” to `DistrictSiteCard`; store stable site keys rather than copied display text.
5. Build trip-day and activity lists with reorder/remove/complete actions.
6. Add manual expenses and category/budget summaries.
7. Make district packs include the active trip, activities, relevant price entries, phrases, contacts, and content version metadata.
8. Add Supabase trip tables and RLS only after the local workflow is proven; then implement guest-to-account merge.

### Acceptance criteria

- Works entirely in guest mode and without network access after initial content load.
- A trip survives app restart.
- Activities are grouped by real trip dates.
- Existing sites can be added and removed without duplication.
- Budget totals are deterministic and unit-tested.
- Expenses work in NPR and preserve the originally entered currency.
- Signing in never discards the guest trip.
- No AI or live-data dependency is required for the core workflow.

## Fair Price roadmap after Trip Foundation

Create timestamped price observations rather than editing a single global range:

```text
PriceItem
  id, canonicalName, category, district, unit, sourcePolicy

PriceObservation
  id, priceItemId, userId?, amountNpr
  latitude?, longitude?, paidAt, submittedAt
  sourceType, moderationStatus
```

Ranges should be calculated from recent accepted observations, with sample size, freshness, district, unit, and confidence shown to the traveler. Official prices must remain separate from community estimates.

## Architecture after the trip workflow proves itself

- **Home:** Today, current location, continue trip, urgent context, nearby shortcuts.
- **Explore:** Places, food, culture, adventure, events.
- **Trip:** Itinerary, transport, budget, saved places.
- **Tools:** Fair Price, offline packs, phrasebook, safety.
- **Profile:** Trips, downloads, preferences, account.

Do not perform this entire navigation migration before Trip has a working domain and persistence layer. Otherwise the project will only move existing cards into new containers.

## Test gap

The current four automated tests validate selected schema/configuration guarantees. They do not test repository behavior, offline synchronization, price verdicts, guest flows, responsive layout, district selection, SOS actions, or account deletion. Trip Foundation should begin with unit tests for date generation, activity ordering, currency/budget totals, schema migration, and guest-to-account merge behavior.

## Final recommendation

Keep and strengthen Fair Price, safety/SOS, offline persistence, local guidance, district discovery, phrases, currency links, and event experiences. Treat weather, nearby places, lodging, maps, offline sizes, and transport planning honestly until their backing integrations exist. Build Trip Foundation next; it is the smallest change that turns Yatri’s existing tools into one coherent travel companion.
