# Lesson 0002 — Animating form rows when fields are added or removed

## Problem

In the admin **Pricing Manager** (`/admin/pricing`), several editable tables let the
admin add and remove rows: account tiers, storage bands, receiving bands, and
shipping bands. Adding or removing a row happened instantly. The goal: a new row
should ease open, a removed row should ease closed, and — critically — the **card
that contains the rows should grow/shrink smoothly**, not snap to its new height.

## Environment

- SvelteKit with Svelte 5 runes.
- Editor state is a single reactive `card = $state<RateCard>(...)` in
  `src/routes/admin/pricing/+page.svelte`.
- Svelte's `slide` (`svelte/transition`). (We tried `fade` and `animate:flip`
  first — see below.)
- The shared `prefersReducedMotion()` helper from `$lib/motion`.
- Shared band types in `src/lib/pricing/types.ts`.

## Root Cause

Not a bug — a missing capability — but getting it right took ruling out two
approaches that *look* correct:

1. **`transition:fade` is not enough.** Fade only animates opacity. When a row is
   added, the table's height jumps to its new size instantly and the row fades
   into the already-allocated space; on remove, the row fades but its space only
   collapses once it's gone. The container "jumps." To animate the container you
   must animate **height**, which means `transition:slide`.

2. **`slide` does not work on `<tr>`.** `slide` animates `height` and sets
   `overflow: hidden`, but `<tr>`/`<td>` boxes don't clip with `overflow`, so
   height animation on table rows is unreliable and janky. The rows had to stop
   being real table rows.

3. **`animate:flip` *causes* the container to jump on remove.** This is the subtle
   one. To animate siblings when an item leaves, Svelte sets the leaving element to
   `position: absolute` so it can measure the others' new positions. Absolute
   positioning drops the leaving row out of layout flow, so the card immediately
   reflows to its final (smaller) height while the survivors slide up via
   `transform` — and `transform` never affects layout height. Net result: the card
   box snaps shorter instantly even though the row's own height is still
   collapsing. Flip only earns its keep when items **reorder** (drag/sort); these
   lists only add/remove, so flip was pure downside here.

## Approach

- Grepped the admin routes for add/remove handlers and `{#each}` blocks; found four
  dynamic lists in the pricing page (three keyed by array index, one by `tier.id`).
- Read the official `svelte/animate` and `svelte/transition` docs.
- **Verified empirically in the browser** (a throwaway `_anim-check` route + the
  chrome-devtools MCP) by sampling the card's `getBoundingClientRect().height` over
  time and inspecting `element.getAnimations()`:
  - `fade` + `flip`: add fired no flip (append doesn't move siblings) and the card
    height never animated.
  - `slide` + `flip`: **add** eased the card 288→343px smoothly, but **remove**
    dropped it to 288px on the very first frame while the leaving row's own
    `height(slide)` animation was still running (32→14→4px) — proving the leaving
    row had gone `position: absolute` and left the card's flow.
  - `slide` **only**: add 288→311→327→337→342→343, remove 343→320→303→294→289→288.
    Both directions ease smoothly. ✅

## Solution

**1. Stable keys.** Added an optional `id` to the band types so each row has a
stable identity (consistent with `AccountTier.id`, which already existed), minted
on add and backfilled at mount:

```ts
// src/lib/pricing/types.ts — id is optional so the seeded default & tests still compile
export interface Band { id?: string; min: number; max: number | null; rate: number; }
export interface ShippingBand { id?: string; maxKg: number; price: number; }
```
```ts
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
for (const b of card.storageBands) b.id ??= newId('band');   // + receiving / shipping
// add handlers mint one too: bands.push({ id: newId('band'), min, max: null, rate: 0 })
```

**2. Convert the four tables to grid-based `<div>` rows** so `slide` can animate
height. Each row is a wrapper div (`overflow-hidden`, the slide target) around an
inner grid that holds the cells; the header uses the same `grid-template-columns`
so columns line up:

```svelte
<div class="w-full min-w-[420px] text-sm">
	<div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-navy-950/10">
		<span class={thCls}>Min pallets</span> … <span class={thCls}></span>
	</div>
	{#each card.storageBands as band, i (band.id)}
		<div class="overflow-hidden" transition:slide={{ duration: slideMs }}>
			<div class="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b border-navy-950/5 py-2">
				<input class={inputCls} type="number" min="0" bind:value={band.min} />
				…
				<button type="button" onclick={() => removeBand(card.storageBands, i)} class="justify-self-end …">Remove</button>
			</div>
		</div>
	{/each}
</div>
```

**3. Reduced-motion-aware duration** (evaluated once at mount):

```ts
const slideMs = prefersReducedMotion() ? 0 : 300;
```

## Why It Works

- **`slide` animates `height`** on the row wrapper (which *is* `overflow:hidden`, a
  real block box, so it clips correctly). On add the wrapper grows 0→full; on
  remove it shrinks full→0.
- Because the wrapper stays in **normal flow** the whole time (no flip, no absolute
  positioning), its height *is* part of the card's layout height — so the card
  grows/shrinks in lock-step with the row, smoothly, in both directions.
- The rows below move naturally via reflow as the height changes — no `flip`
  needed, because the list never reorders.
- **Grid columns** (`grid-cols-[1fr_1fr_1fr_auto]`, shared by header and rows) keep
  the columns aligned now that there's no `<table>` to do it.
- **Stable `id` keys** ensure Svelte tracks each row correctly across changes
  (index keys would misidentify rows on remove).
- **Reduced motion** sets the duration to 0ms, disabling the animation without
  branching the markup.

## Gotchas / Notes

- **`fade` → no height animation; `slide` → height animation.** If the *container*
  must resize smoothly, you need `slide` (or another height transition), not `fade`.
- **`slide` needs a block box that clips.** It does **not** work on `<tr>`/`<td>`.
  If your rows are in a `<table>`, convert them to grid/flex `<div>`s first.
- **`animate:flip` fights a smoothly-resizing container on add/remove.** Flip
  absolutely-positions the leaving element, collapsing the container instantly.
  Only add `flip` when items genuinely **reorder** (sortable lists, drag & drop) —
  and accept that the container won't ease in that case, or clip it.
- **Verify animations by measurement, not just by eye.** Sampling
  `getBoundingClientRect().height` over time and reading `element.getAnimations()`
  turns "does it animate?" into objective numbers — that's how the flip-on-remove
  jump was pinned down.

## Verification

- ✅ `svelte-autofixer` — no issues on the animation code (two unrelated,
  pre-existing `href`/`resolve()` link warnings were left out of scope).
- ✅ `npm run check` (svelte-check) — 0 errors, 0 warnings.
- ✅ Browser (chrome-devtools MCP), sampling the card height mid-animation:
  add eased **288→343px**, remove eased **343→288px**, both through smooth
  intermediate values.
- Manual: open `/admin/pricing`, add/remove rows in each of the four sections, and
  confirm the row opens/closes and the card grows/shrinks smoothly. Enable OS
  "reduce motion" and confirm changes are instant.
