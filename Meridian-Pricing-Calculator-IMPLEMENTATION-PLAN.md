# Meridian 3PL — Pricing Calculator Implementation Plan
### Phase 2 · Status: approved, ready to build

This plan turns the approved pricing formula into a **live, on-site Instant Quote calculator** plus an
**admin Pricing Manager** so Meridian can edit every rate without touching code. It builds on the
existing stack (SvelteKit + adapter-node + MariaDB/Drizzle + better-auth) and the `pricing_config`
table that already exists in the schema.

---

## 1. Goals

1. A prospect adjusts a few inputs and **instantly sees an estimate** — shown both **per order** and **per month**.
2. Every rate is **editable from the admin panel** (`/admin/pricing`), versioned and publishable — no redeploy.
3. Each estimate can be **captured as a lead**, with the computed breakdown saved alongside the quote request.
4. The public price is computed live on the client for responsiveness, but **re-computed on the server** on submit so stored numbers can't be tampered with.

**Design principles (from the approved formula):** transparent — real published rates, not "contact us for a quote" · **two views** — per-order *and* monthly · **starter-friendly** — works below 500 orders/month, unlike larger competitors · **honest but indicative** — the on-screen figure is an estimate, the final quote is confirmed after a short conversation.

> All prices **AUD, ex-GST** (GST added at invoicing). Tiered rates use the **whole-quantity rule**: the entire quantity is charged at the rate of the band it lands in (18 pallets → all at the 11–25 rate, not split).

---

## 2. Architecture at a glance

```
                ┌─────────────────────────────┐
                │  pricing_config (MySQL)      │  versioned JSON rate card
                │  one row = one version       │  (isPublished flag)
                └──────────────┬──────────────┘
                               │  getPublishedConfig()
          ┌────────────────────┼─────────────────────┐
          ▼                    ▼                      ▼
   /admin/pricing       /quote (public)        /api/quote (POST)
   edit + publish       live calculator        server re-computes
   (Pricing Manager)    (reads config)         estimate, stores it
                               │                      │
                               └── shared engine ─────┘
                          src/lib/pricing/calculate.ts
                          (pure, used client + server)
```

The **calculation engine is a single pure module** imported by the public page (live display), the
server endpoint (authoritative re-compute), and the admin preview. One source of truth, no drift.

---

## 3. The rate-card config (single source of truth)

Stored as JSON in `pricing_config.data`. Shape (`src/lib/pricing/types.ts`):

```ts
interface RateCard {
  version: number;
  currency: 'AUD';
  // A — Account fee (flat monthly, chosen by monthly order volume)
  accountTiers: { id: string; label: string; maxOrders: number | null; fee: number | null }[];
  // B — Storage (per pallet/month, whole-quantity band)
  storageBands: { min: number; max: number | null; rate: number }[];
  storageCustomAbove: number;            // e.g. 55 → "contact us"
  // C — Inbound receiving (per pallet received/month, whole-quantity band)
  receivingBands: { min: number; max: number | null; rate: number }[];
  skuSetupFee: number;                    // one-off, per SKU at onboarding
  // D — Pick & pack
  pickPack: { firstItem: number; additionalItem: number };
  // E — Shipping (weight-banded, margin baked in)
  shippingBands: { maxKg: number; price: number }[];
  // F — Extras (optional add-ons)
  extras: { returns: number; relabel: number; kitting: number; urgent: number };
}
```

**Default/seed values (the approved formula)** — `src/lib/pricing/default-config.ts`:

| Component | Values |
|---|---|
| Account tiers | Starter `$299` (< 1,000 orders) · Growth `$499` (1,000–3,000) · Custom (3,000+) |
| Storage / pallet | 1–10 `$40` · 11–25 `$35` · 26–55 `$30` · 56+ custom |
| Receiving / pallet | 1–10 `$22` · 11–30 `$18` · 31+ `$15` |
| SKU setup (one-off) | `$2.20` / SKU |
| Pick & pack | first item `$3.50` · each additional `$0.50` |
| Shipping bands ⚠️ | ≤0.5kg `$8.50` · ≤1 `$10.50` · ≤2 `$11.50` · ≤3 `$12.50` · ≤5 `$14.50` · ≤10 `$18.50` · ≤15 `$24.00` · ≤22 `$30.00` |
| Extras | returns `$7` · relabel `$1`/unit · kitting `$0.80`/unit · urgent `$50` |

> ⚠️ **Shipping bands are placeholders** until Meridian's courier rate card is supplied. They're fully editable in the admin manager, so the calculator can go live now and the real numbers dropped in later.

---

## 4. The calculation engine

`src/lib/pricing/calculate.ts` — a pure function, no I/O, easy to unit-test.

**Inputs the customer provides:**
```ts
interface CalcInputs {
  ordersPerMonth: number;
  itemsPerOrder: number;       // average, ≥ 1, decimals allowed (e.g. 1.8)
  palletsStored: number;
  palletsReceived: number;     // per month
  skuCount: number;
  avgWeightKg: number;
  extras: {
    returns: number; relabel: number; kitting: number; urgent: number;
    customPackaging: boolean;  // flag only → "quoted separately" note, no number
  };
}
```

**Input ranges (drives the slider/field min–max–step):**

| Field | Range | Step | Notes |
|---|---|---|---|
| Orders / month | 1 – 5,000 | 10 | **≥ 3,000 → custom** (account tier has no fixed fee) |
| Items / order | 1.0 – 10.0 | 0.1 | decimals (averages) |
| Pallets stored | 0 – 55 | 1 | **56+ → custom** |
| Pallets received / month | 0 – 50 | 1 | |
| Unique SKUs | 1 – 1,000 | 1 | drives one-off setup only |
| Avg order weight (kg) | 0.1 – 22 | 0.1 | selects shipping band |
| Extras | returns / relabel / kitting / urgent qty; custom-packaging toggle | 1 | optional |

**Logic:**
- `bandRate(qty, bands)` → finds the band where `min ≤ qty ≤ max` (or `max === null` for open-ended) and returns its rate. Whole-quantity rule = `qty × rate`.
- **Account** = flat tier fee selected by `ordersPerMonth` (Starter `$299` < 1,000 · Growth `$499` 1,000–3,000 · Custom → no fixed fee).
- **Storage** = `palletsStored × storageBand.rate`.
- **Receiving** = `palletsReceived × receivingBand.rate`.
- **Pick & pack** = `orders × firstItem + orders × (itemsPerOrder − 1) × additionalItem`.
- **Shipping** = `orders × shippingBandPrice(avgWeightKg)` (first band where `weight ≤ maxKg`).
- **Extras** = `returns×7 + relabel×1 + kitting×0.80 + urgent×50`. **Custom packaging** is a flag only → adds a "quoted separately" note, never a number.
- **SKU setup** (one-off) = `skuCount × skuSetupFee` — returned separately, **not** in the recurring monthly total.
- **Per-order, per line** = `lineMonthly ÷ ordersPerMonth` (matches the proposal's per-order column — e.g. account `$299 ÷ 600 = $0.50`). The headline cost-per-order = `monthlyTotal ÷ orders`; the fulfilment-only per-order excludes shipping.
- **Custom flag** = `true` when the account tier has no fixed fee (`ordersPerMonth ≥ 3,000`) **or** `palletsStored > storageCustomAbove` (56+). When custom, the calculator shows a **"Let's talk — custom pricing"** state with a contact CTA instead of a misleading total. *(Reason: in those zones the account/storage rate is "quoted", so an all-in number can't be honestly shown.)*

**Output:**
```ts
interface CalcResult {
  lines: { key: string; label: string; monthly: number; perOrder: number }[];
  monthlyTotal: number;
  perOrderTotal: number;
  fulfilmentPerOrder: number;   // everything except shipping
  oneOffSetup: number;          // SKU setup
  custom: boolean;              // true → show "contact us" instead of a number
  notes: string[];
}
```

**Acceptance test (must match the approved worked example — monthly *and* per-order):**
> 600 orders/mo · 1.8 items · 12 pallets stored · 8 received · 60 SKUs · 1.2 kg · 30 returns

| Line | Monthly | Per order |
|---|--:|--:|
| Account (Starter) | $299 | $0.50 |
| Storage (12 × $35) | $420 | $0.70 |
| Receiving (8 × $22) | $176 | $0.29 |
| Pick & pack (2,100 + 240) | $2,340 | $3.90 |
| Extras (30 × $7) | $210 | $0.35 |
| **Fulfilment subtotal** | **$3,445** | **$5.74** |
| Shipping (600 × $11.50) | $6,900 | $11.50 |
| **ALL-IN** | **$10,345 / mo** | **$17.24 / order** |

Plus one-off SKU setup: 60 × $2.20 = **$132**. This becomes a unit test (`calculate.test.ts`) — the build isn't "done" until it reproduces these exact numbers, including **band edges** (10↔11 pallets, 0.5↔0.501 kg, items = 1.0 → zero additional-item charge).

---

## 5. Admin — Pricing Manager (`/admin/pricing`)

Replaces the current stub. Features:

- **Load** the published config (or the seeded default on first run).
- **Edit every rate**: account tiers, storage/receiving bands, pick&pack, shipping bands, SKU fee, extras, capacity cap. Add/remove band rows.
- **Validation**: no negatives; bands must be contiguous and ascending; warn on gaps/overlaps.
- **Live preview**: a mini-calculator in the editor using the *draft* values, so the admin sees the effect before publishing.
- **Versioning**: each save creates a new `pricing_config` row (version N, `isPublished = false`). Nothing overwrites history.
- **Publish**: marks a version `isPublished = true` (and unpublishes the previous), stamps `effectiveFrom` and `createdBy`. The public calculator + server compute always use the currently published version.
- **Version history**: list past versions with who/when; "restore" duplicates an old version into a new draft.

---

## 6. Public — the live calculator

Lives on **`/quote`** as the new centrepiece (the "Get a Quote" button already points there). Layout:

- **Inputs** (sliders + number fields, debounced): orders/month, avg items/order, pallets stored, pallets received/month, unique SKUs, avg order weight, and optional extras quantities.
- **Live output panel** (updates on every change):
  - itemised breakdown (Account, Storage, Receiving, Pick & Pack, Shipping, Extras) with monthly + per-order columns,
  - **big monthly total** and **cost per order**,
  - a **fulfilment-only per-order** figure (the number sellers benchmark),
  - one-off SKU setup shown separately,
  - "ex-GST · indicative estimate" disclaimer.
- **Capacity rule**: if pallets exceed the cap (55), the storage line and total switch to **"Let's talk — custom pricing"** with a contact CTA instead of a number.
- **Reduced-motion / a11y**: inputs are native/labelled; values announced; works without JS by falling back to the existing form.
- **Lead capture**: a "**Email me this quote**" / "**Request this quote**" action reveals a short contact capture (name, company, email, phone) and submits inputs **+ computed estimate** to `/api/quote`.

> The existing 3-step qualifying form is preserved as the fallback / detailed path; the calculator becomes the primary, faster funnel. (Final placement — calculator-first on `/quote` vs a dedicated `/pricing` page — is a small UX decision to confirm before build.)

---

## 7. Lead capture & data flow

1. Public page loads the **published config** (see §8) and renders the calculator.
2. User adjusts inputs → engine computes live (client-side) for instant feedback.
3. On submit → `POST /api/quote` with the raw inputs + contact details.
4. **Server re-computes** the estimate from the *published* config (never trusts client numbers), then stores the row in `quote_requests` with the breakdown in the existing **`estimate`** JSON column, and sends the notification email (existing pipeline).
5. **Admin quote detail** renders the stored estimate breakdown, so staff see exactly what the prospect was quoted.

No new submission table needed — it reuses `quote_requests` (the `estimate` column already exists).

---

## 8. Config delivery (prerender decision)

The `/quote` page is currently prerendered. To serve live, editable config:

- **Recommended:** make `/quote` **dynamic** (`prerender = false`) and load the published config in `+page.server.ts`. The page already submits to a dynamic endpoint, so SSR here is clean and the config is server-rendered (no flash, no extra request).
- **Alternative:** keep `/quote` prerendered and add `GET /api/pricing/current` that the page fetches on mount. Keeps the page static but adds a request + brief loading state.

We'll go with the recommended approach unless you prefer to keep `/quote` fully static.

---

## 9. Files to create / change

**New**
- `src/lib/pricing/types.ts` — `RateCard`, `CalcInputs`, `CalcResult`
- `src/lib/pricing/calculate.ts` — pure engine + `bandRate()` helpers
- `src/lib/pricing/default-config.ts` — approved formula as the seed
- `src/lib/pricing/calculate.test.ts` — unit tests (worked example + band edges)
- `src/lib/server/pricing.ts` — `getPublishedConfig()`, `saveDraft()`, `publish()`, `seedIfEmpty()`
- `src/routes/admin/pricing/+page.server.ts` — load config + versions; actions: save, publish, restore
- `src/routes/admin/pricing/+page.svelte` — the editor UI (replaces stub)
- `src/routes/quote/+page.server.ts` — load published config (`prerender = false`)

**Changed**
- `src/routes/quote/+page.svelte` — add the live calculator + wire estimate into submission
- `src/routes/api/quote/+server.ts` — re-compute estimate server-side, store in `estimate`
- `src/routes/admin/quotes/[id]/+page.svelte` — render the estimate breakdown
- (optional) `src/routes/api/pricing/current/+server.ts` — only if we keep `/quote` prerendered

---

## 10. Build phases

### Phase 2A — Engine + config foundation
- [ ] Types + default config (approved rates)
- [ ] Pure calculation engine with whole-quantity band logic
- [ ] Unit tests passing (worked example = $10,345/mo, $17.24/order)
- [ ] `seedIfEmpty()` inserts the published default on first run
- [ ] `getPublishedConfig()` / `saveDraft()` / `publish()` server helpers

### Phase 2B — Admin Pricing Manager
- [ ] `/admin/pricing` editor for every rate (add/remove bands)
- [ ] Validation (no negatives, contiguous bands)
- [ ] Draft → preview → publish, with versioning + history
- [ ] Verified: editing a rate + publishing changes what the public calc uses

### Phase 2C — Public calculator + capture
- [ ] `/quote` loads published config (dynamic) and renders the live calculator
- [ ] Itemised breakdown, monthly + per-order totals, fulfilment-only per order
- [ ] Capacity cap → "Let's talk" state
- [ ] "Request this quote" → `/api/quote` re-computes + stores estimate + emails
- [ ] Admin quote detail shows the estimate breakdown

### Phase 2D — QA + go-live
- [ ] svelte-check 0/0, production build ✓
- [ ] End-to-end: change rate in admin → see it on the public calc → submit → estimate stored
- [ ] Cross-viewport + reduced-motion + keyboard checks
- [ ] **Swap placeholder shipping bands for Meridian's real courier rate card**
- [ ] Final review with you

---

## 11. Acceptance criteria
- The engine reproduces the approved worked example exactly.
- Every rate is editable in `/admin/pricing` and takes effect on publish (no redeploy).
- Public estimate updates live and matches the server re-computed figure on submit.
- Submitting stores the estimate against the quote in `quote_requests` and emails the team.
- Over-capacity pallet counts show "custom pricing", not a number.

---

## 12. Dependencies & open items

✅ **Locked by the approved formula:** account tiers ($299 / $499 / custom), storage ($40 / $35 / $30), receiving ($22 / $18 / $15), SKU setup ($2.20), pick & pack ($3.50 / $0.50), extras ($7 / $1 / $0.80 / $50 / custom packaging quoted), capacity cap (55 pallets), GST-exclusive display, and the whole-quantity rule. Remaining:

1. **Courier rate card** — the only hard external input still outstanding. The calculator ships with the approved *placeholder* shipping bands (fully editable in the admin Pricing Manager); the real numbers swap in at **Phase 2D**. *Please provide when available.*
2. **Placement** — calculator-first on `/quote` (recommended) vs a separate `/pricing` page. Quick confirm before **2C**.
3. **Custom-tier copy** — wording for the 3,000+ orders / 56+ pallets "custom pricing" state. Minor; finalise during 2C.

## 13. Out of scope (this phase)
- Real-time courier API integration (we use fixed weight bands by design).
- Multi-currency.
- Customer accounts / saved quotes (estimates are captured as leads only).
