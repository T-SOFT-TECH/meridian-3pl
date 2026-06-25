# Meridian 3PL — Pricing Calculator Formula
### Draft for client approval · v1.0

**Purpose.** This document defines the exact pricing logic for the live "Instant Quote" calculator on the Meridian 3PL website. It lets a prospect enter a few details about their operation and instantly see an estimated cost — shown both **per order** and **per month** — before they ever speak to a salesperson.

**Design principles**
- **Transparent:** real published rates, no hidden fees (the opposite of "contact us for a quote").
- **Two views:** sellers think in *cost per order*; owners think in *monthly spend*. We show both.
- **Starter-friendly:** unlike larger competitors whose calculators won't go below 500 orders/month, ours works for your first small clients.
- **Honest, but the estimate is not a contract:** the on-screen figure is an indicative estimate; the final quote is confirmed after a short conversation.

> All prices are in **AUD** and **exclude GST**. GST is added at invoicing.
> Every tiered rate uses the **whole-quantity rule**: the entire quantity is charged at the rate of the band it falls into (e.g. 18 pallets are all charged at the 11–25 rate — not split across bands).

---

## 1. What the customer enters

| Field | Range / format | Used for |
|---|---|---|
| Average **orders per month** | 1 – 5,000+ | Pick & pack, per-order maths |
| Average **items per order** | 1.0 – 10.0 | Additional-item picking |
| **Pallets stored** | 0 – 55 (then "custom") | Storage |
| **Pallets received** per month | 0 – 50 | Inbound receiving |
| **Unique SKUs** | 1 – 1,000 | One-off SKU setup (optional) |
| Average **order weight (kg)** | 0.1 – 22 | Shipping band |
| **Extra services** (optional) | returns qty, relabel, kitting, urgent | Add-ons |

---

## 2. The six cost components

### A. Monthly Account Fee
Covers admin, software access, account management and support.

```
Account Fee = flat monthly fee based on size tier
```

| Tier | Applies when | Fee / month |
|---|---|---|
| **Starter** | under 1,000 orders/month | **$299** |
| **Growth** | 1,000 – 3,000 orders/month | **$499** |
| **Custom** | 3,000+ orders/month, or 55+ pallets | Quoted |

---

### B. Storage  *(charged per pallet position, per month)*

```
Storage = Pallets Stored × Monthly Rate (whole-quantity band)
```

| Pallets stored | Rate / pallet / month |
|---|---|
| 1 – 10 | **$40** |
| 11 – 25 | **$35** |
| 26 – 55 | **$30** |
| 56+ | Custom (beyond current facility capacity) |

*Example: 12 pallets → 12 × $35 = **$420/month**.*

---

### C. Inbound Receiving  *(per pallet received that month)*

```
Receiving = Pallets Received × Rate (whole-quantity band)
```

| Pallets received / month | Rate / pallet |
|---|---|
| 1 – 10 | **$22** |
| 11 – 30 | **$18** |
| 31+ | **$15** |

*Example: 8 pallets received → 8 × $22 = **$176**.*

**Optional — one-off SKU setup fee** (new clients only, billed once at onboarding):
```
SKU Setup = Unique SKUs × $2.20   →  e.g. 60 SKUs = $132 (one-time)
```
*Shown as a separate one-off line, not part of the recurring monthly total.*

---

### D. Pick & Pack  *(the main revenue driver)*

```
Pick & Pack = Orders × First-Item Fee
            + (Orders × (Items per Order − 1)) × Additional-Item Fee
```

| Charge | Rate |
|---|---|
| First item in each order | **$3.50** |
| Each additional item | **$0.50** |

*Example: 600 orders at 1.8 items each →*
*Base 600 × $3.50 = $2,100; extras 600 × 0.8 × $0.50 = $240 → **$2,340**.*

---

### E. Shipping  *(weight-banded — margin already included)*

Rather than a live courier lookup, we charge a **fixed price per weight band**, with Meridian's handling margin (≈15%) already built in. Clean, instant, and predictable.

```
Shipping = Orders × Band Price (selected by average order weight)
```

| Avg order weight | Price / order *(indicative — see note)* |
|---|---|
| up to 0.5 kg | **$8.50** |
| 0.5 – 1 kg | **$10.50** |
| 1 – 2 kg | **$11.50** |
| 2 – 3 kg | **$12.50** |
| 3 – 5 kg | **$14.50** |
| 5 – 10 kg | **$18.50** |
| 10 – 15 kg | **$24.00** |
| 15 – 22 kg | **$30.00** |

> ⚠️ **These band prices are placeholders** based on typical Australian domestic parcel pricing. **Final bands should be set from Meridian's actual courier account** (e.g. Australia Post / Aramex / Couriers Please). Once you confirm your rate card, we plug the real numbers in.

*Example: 1.2 kg average → $11.50/order × 600 orders = **$6,900**.*

---

### F. Extras  *(optional add-ons)*

```
Extras = (Returns × $7) + (Relabel units × $1) + (Kitting units × $0.80)
       + (Urgent dispatches × $50) + Custom packaging (quoted)
```

| Service | Rate |
|---|---|
| Returns processing | $7.00 each |
| Relabelling | $1.00 / unit |
| Kitting / assembly | $0.80 / unit |
| Urgent same-day dispatch | $50.00 each |
| Custom packaging | Quoted separately |

---

## 3. The totals

**Monthly total**
```
MONTHLY TOTAL =
   Account Fee
 + Storage
 + Receiving
 + Pick & Pack
 + Shipping
 + Extras
```

**Per-order view** (shown alongside, for benchmarking)
```
COST PER ORDER = Monthly Total ÷ Orders per Month
```
We also show a **fulfilment-only per-order** figure (everything except shipping), because that's the number sellers compare between 3PLs.

---

## 4. Full worked example

> **Client:** 600 orders/month · 1.8 items/order · 12 pallets stored · 8 pallets received/month · 60 SKUs · 1.2 kg average weight · 30 returns/month.

| Component | Calculation | Monthly | Per order |
|---|---|--:|--:|
| Account fee (Starter) | flat | $299 | $0.50 |
| Storage | 12 × $35 | $420 | $0.70 |
| Receiving | 8 × $22 | $176 | $0.29 |
| Pick & pack | 2,100 + 240 | $2,340 | $3.90 |
| Extras | 30 × $7 | $210 | $0.35 |
| **Fulfilment subtotal** | | **$3,445** | **$5.74** |
| Shipping | 600 × $11.50 | $6,900 | $11.50 |
| **ALL-IN TOTAL** | | **$10,345 / month** | **$17.24 / order** |

*Plus one-off SKU setup: 60 × $2.20 = $132 at onboarding.*

---

## 5. Items for client sign-off

Please confirm or adjust the following before we build:

1. **Account fee tiers** — Starter **$299** / Growth **$499** / Custom. ✅ or change?
2. **Storage** — keep honest published rates **$40 / $35 / $30** per pallet (recommended), or run a lower headline "teaser" rate like some competitors? 
3. **Inbound receiving** — per-pallet **$22 / $18 / $15** confirmed?
4. **SKU setup fee** — include the optional one-off **$2.20/SKU** onboarding charge? Yes / No.
5. **Pick & pack** — **$3.50** first item + **$0.50** each additional confirmed? (Add volume discounts later? Optional.)
6. **Shipping bands** — approve the *structure*, and send Meridian's real **courier rate card** so we replace the placeholder band prices.
7. **Extras** — rates confirmed: returns $7 · relabel $1 · kitting $0.80 · urgent $50 · custom = quote.
8. **Capacity rule** — over **55 pallets** the calculator shows "Contact us for custom pricing" (reflects current 166 sqm facility). OK?

Once approved, we implement this directly into the website's Get-a-Quote calculator — live, instant, and delivering every enquiry straight to Meridian's inbox, or into a dedicated admin dashboard on the website where the team can review, track, and action each quote in one place.
