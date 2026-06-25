# Lesson 0001 — New page keeps the previous page's scroll position

## Problem

A user scrolls down to the middle of a page, then clicks a navigation link to go
to a different page. Instead of landing at the top of the new page, the new page
appears already scrolled to roughly the same middle position the previous page
was at. Every navigation feels like it "inherits" the scroll offset of the page
you came from, which is disorienting — you expect a fresh page to start at the
top.

## Environment

- SvelteKit with Svelte 5 runes (`$props`, `$derived`, `$effect`).
- A prerendered marketing site — `+layout.ts` sets `prerender = true`.
- Smooth scrolling provided by **Lenis**, driven off **GSAP's ticker** so that
  GSAP animations and the smooth-scroll loop share a single clock.
- **GSAP ScrollTrigger** for scroll-linked animations.
- Cross-fade between pages via the **View Transitions API**.
- The relevant file is `src/routes/+layout.svelte`.

The admin area (`/admin/*`) renders its own chrome and deliberately does **not**
run smooth scroll, so Lenis is only active on the marketing pages and only when
the user has not requested reduced motion.

## Root Cause

SvelteKit **does** automatically reset scroll to the top when you navigate to a
new page — that behaviour is built in and works fine on a plain site.

The problem is that Lenis does not let the browser own the scroll position.
Lenis maintains its **own internal scroll value** and re-applies it to the window
on every animation frame, via `lenis.raf(...)` called from the GSAP ticker. So
the sequence on navigation is:

1. SvelteKit navigates and sets `window.scrollY = 0`.
2. On the very next `requestAnimationFrame` tick, Lenis runs `raf()` and writes
   its **stale** internal position (the old page's offset) back onto the window.

The net effect is that the new page is snapped straight back to the previous
page's scroll position — SvelteKit's reset is silently overwritten one frame
later.

Compounding the problem, the original Lenis instance was declared with `const`
**inside** the `$effect` closure. That meant no navigation hook outside the
effect could reach the instance to correct its internal position — the very
object that needed resetting was trapped in a scope nothing else could see.

## Approach

The build notes for this project mention the animation stack as "GSAP +
ScrollTrigger + Lenis." Seeing a scroll-restoration bug against that stack, the
immediate suspicion was a **smooth-scroll hijacker**: any library that takes over
scrolling (Lenis, Locomotive, etc.) maintains its own position and will fight the
framework's native scroll handling.

Reading `src/routes/+layout.svelte` confirmed two things:

1. Lenis runs a RAF loop (`lenis.raf(time * 1000)` from the GSAP ticker), so it
   re-applies its own scroll value every frame — exactly the mechanism that would
   stomp on SvelteKit's reset.
2. The `lenis` instance was a `const` declared inside the `$effect`, so it was
   unreachable from `afterNavigate`.

From there the fix followed: the instance had to be **hoisted to component scope**
so that SvelteKit's `afterNavigate` hook could explicitly snap Lenis's internal
position back to the top after each navigation completes.

## Solution

**BEFORE** (the relevant parts):

```svelte
$effect(() => {
    if (isAdmin || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.115, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
    };
});

// Recompute scroll-trigger positions once the new page has mounted.
afterNavigate(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
});
```

**AFTER** (the implemented fix):

```svelte
// Held at component scope so afterNavigate can reset the scroll position.
// Null whenever smooth scroll is inactive (admin area or reduced-motion),
// in which case SvelteKit's native scroll restoration already works.
let lenis: Lenis | null = null;

$effect(() => {
    if (isAdmin || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const instance = new Lenis({ lerp: 0.115, wheelMultiplier: 1 });
    lenis = instance;
    instance.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
        gsap.ticker.remove(tick);
        instance.destroy();
        lenis = null;
    };
});

// Lenis owns the scroll position and re-applies it every RAF tick, which
// overrides SvelteKit's built-in scroll reset — so without this a new page
// inherits the previous page's scroll. Snap Lenis to the anchor (when the
// destination URL has a hash) or the top, then recompute trigger positions.
afterNavigate(({ to }) => {
    if (lenis) lenis.scrollTo(to?.url.hash || 0, { immediate: true });
    requestAnimationFrame(() => ScrollTrigger.refresh());
});
```

## Why It Works

1. **Hoisting the instance.** A `let lenis: Lenis | null` is declared at component
   scope so navigation hooks can reach it. Inside the effect, a local
   `const instance` is still used for the RAF tick and cleanup closures (keeping
   those clean and non-null), and `lenis = instance` simply publishes the same
   object to the outer scope. On teardown, `lenis = null` un-publishes it.

2. **`afterNavigate` runs at the right moment.** It fires after every
   client-side navigation completes, which is exactly when the new page is in
   place but Lenis still holds the old page's scroll value.

3. **`scrollTo(0, { immediate: true })` snaps the internal position.** The
   `immediate` flag means no smooth animation — Lenis's internal scroll value is
   set to the target instantly. Because the RAF loop re-applies that internal
   value every frame, it now re-applies `0` instead of the stale offset, and the
   page stays at the top.

4. **`to?.url.hash || 0` honours in-page anchors.** If the destination URL has a
   hash (for example the `#main` skip-to-content link), Lenis scrolls to that
   target element; otherwise it falls back to `0` (the top). This preserves
   anchor-link behaviour instead of forcing everything to the top.

5. **The `if (lenis)` guard keeps native behaviour intact.** In the admin area
   and under reduced motion, Lenis is never created, so `lenis` is `null`, the
   `scrollTo` call is skipped, and SvelteKit's own scroll restoration is left
   completely untouched.

## Gotchas / Notes

- **Smooth-scroll libraries always shadow native scroll.** Lenis, Locomotive,
  and similar libraries keep their own scroll position and write it to the window
  every frame. Any time you use one, the framework's scroll restoration must be
  **bridged manually** — you cannot rely on the browser or SvelteKit alone.

- **Trade-off on back/forward navigation.** This fix snaps to the top (or the
  hash) on *every* navigation, including browser back/forward. Without Lenis,
  SvelteKit would restore the prior scroll position when you hit back. Losing
  that restoration is an acceptable trade for a marketing site, but be aware of
  it — for an app where back/forward scroll memory matters, you would need to
  capture and re-apply the saved position through Lenis instead of always using
  `0`.

- **Sticky headers and hash anchors.** A fixed/sticky header can sit on top of
  content that a hash link scrolls to, hiding the target beneath it. Lenis's
  `scrollTo` accepts an `offset` option (for example a negative pixel value equal
  to the header height) if this becomes a problem.

- **Never trap a long-lived instance in an `$effect`/`const` closure** if you
  need to reach it from elsewhere. The original bug was as much about scope as
  about timing: the instance that needed resetting was unreachable. Publish such
  instances to component scope.

## Verification

1. Run `npm run dev`.
2. On the home page, scroll down to roughly the middle of the page.
3. Click a header nav link to a different page and confirm the new page starts at
   the very **top**, not mid-scroll.
4. Test an in-page hash link (the skip-to-content `#main` link) and confirm it
   still scrolls to its anchor rather than just the top.
5. Visit the admin area (`/admin`) and confirm scrolling there still behaves
   normally — Lenis is not active, so SvelteKit's native scroll handling should
   be untouched.

### Static audit (performed alongside the fix)

A read-only audit of the codebase confirmed the fix is complete and surfaced no
related problems:

- **Lenis version/API.** `lenis@1.3.23` is installed; `scrollTo(number | string |
  HTMLElement, { immediate })` matches the call exactly.
- **Navigation links.** All header/footer links are plain `<a href>` internal
  routes that SvelteKit intercepts (so `afterNavigate` always fires). No
  `data-sveltekit-reload`/`-noscroll` anywhere. Real cross-page hash links exist
  (footer service links → `/services#slug`, with `scroll-mt-36` header offset on
  the target sections), and the `to?.url.hash` branch handles them correctly.
- **Other scroll containers.** The only inner `overflow-y-auto` elements (mobile
  menu, pricing-calculator capture modal) are conditionally rendered and remount
  fresh on each open/navigation, so they cannot carry stale scroll across routes.
  *Takeaway for the future: any persistent inner scroller would NOT be reset by
  Lenis or SvelteKit and would need manual handling.*
- **No competing scroll writes.** The only other scroll reference is
  `bind:scrollY` in `Header.svelte` (read-only, toggles the scrolled-header
  chrome) — it never writes scroll, so it can't fight Lenis.
- **Admin + reduced-motion.** Both leave `lenis` null, so `afterNavigate` no-ops
  and SvelteKit's native restoration is preserved in those modes.
