# Meridian 3PL — build notes

- Design concept: "The Meridian Line" — precision-navigation visual language (compass logo, meridian rules, mono coordinate labels 37.78° S / 144.77° E Derrimut). Navy-dominant, amber strictly for signals/CTAs.
- Fonts: Archivo Variable (display, uses wdth axis for expanded uppercase), Instrument Serif (italic contrast words in headlines), IBM Plex Mono (data labels/eyebrows). Self-hosted via @fontsource.
- All images verified visually — several Unsplash IDs delivered different content than expected; files renamed to match real content (e.g. "forklift" was grinder sparks → ind-manufacturing.jpg).
- Image map: port-aerial (home hero bg), hero-warehouse (portrait tall aisle), fulfillment-floor (yellow boxes), container-ship, parcel-handover (last-mile/e-comm), racks-moody (warehousing), truck-dusk-bw (B&W highway truck), road-train (authentic AU outback truck), melbourne-flinders (Flinders St Station — crop left, horse on right edge), courier-truck, handshake, planning, ind-*.jpg for 10 industries.
- Logos: /logo/meridian-3pl-logo.webp (navy, light bg), /logo/meridian-3pl-white-logo.webp (white, dark bg). Header: transparent-over-dark uses white, scrolled solid-light uses navy.
- Motion: GSAP + ScrollTrigger + Lenis; all reveals set initial state in JS (no CSS hiding) so no-JS/SEO still renders content; gsap.matchMedia honours prefers-reduced-motion.
- Web3Forms: client-side fetch to api.web3forms.com/submit, JSON, access key in source (public by design). Quote form generates reference no. MER-xxxxx, includes botcheck honeypot.
- Derrimut coordinates used decoratively: 37.7833° S, 144.7667° E.

## QA results (final)
- svelte-check: 0 errors, 0 warnings, 0 problem files.
- vite build (prerender all routes): clean. Largest CSS 60KB (10.7KB gzip); JS well chunked.
- Web3Forms quote submission tested end-to-end in real browser → success:true, reference MER-BN83Z0 generated, confirmation screen rendered. (One test email sent to tsoftechnologies@gmail.com — subject "New quote request — Test Co (build verification)".)
- Visually verified all 6 routes desktop (1440px) + mobile (360px): home, about, services, industries, quote, contact. Mobile menu overlay, services sticky sub-nav, contact Google Map embed (resolves to Derrimut), and industries asymmetric grid all confirmed.
- Decorative email hello@meridian3pl.com.au used in footer/UI (profile gave no email); real form delivery goes to tsoftechnologies@gmail.com via Web3Forms. Flag for client confirmation.
- adapter-auto warns "no supported production environment" — expected; pick a concrete adapter (static/node/vercel/netlify) at deploy time. Site is fully prerenderable → adapter-static is the natural fit.

## Hero slider (HeroSlider.svelte)
- Replaced the static home hero with a bespoke 4-slide brand slider (Overview / Warehousing / Fulfilment / Distribution), GSAP-driven — Ken Burns on imagery, masked line-by-line text reveals, crossfade transitions, auto-advance (6.5s) with a filling amber progress bar.
- Controls: slide counter (01/04), labelled tabs (desktop), prev/next arrows, keyboard ←/→, touch swipe, pause-on-hover + pause-when-tab-hidden. Respects prefers-reduced-motion (no Ken Burns/autoplay, simple crossfade).
- Svelte 5 gotcha: `slideEls` must be `$state<HTMLElement[]>([])` for `bind:this={slideEls[i]}` (else dev warning binding_property_non_reactive). `paused` is a PLAIN let (not $state) on purpose — it's read in the setup $effect via startProgress, so making it reactive would re-run the whole effect on hover and re-init the slider.
- All transforms/opacity only (compositor-friendly); verified smooth, console clean, responsive 390px→desktop, svelte-check 0/0, prod build ✓.

## Pricing calculator (Phase 2)
- Engine in src/lib/pricing/ (pure computeQuote), verified == approved worked example. Rate card lives in pricing_config (versioned JSON), edited at /admin/pricing (Rate Manager w/ live preview + publish + version history — built partly via a spawned agent, scoped to admin/pricing).
- Public calculator is the centrepiece of /quote (now prerender=false, SSRs published config): src/lib/components/calculator/PricingCalculator.svelte + Slider.svelte. Navy estimate panel, amber sliders (custom-styled range inputs), Tween on the monthly total, capacity "Let's talk" state, capture modal → /api/quote.
- /api/quote re-computes the estimate server-side (authoritative) and stores it in quote_requests.estimate (source='calculator'); admin quote detail renders the breakdown.
- Shipping bands are placeholders — swap for Meridian's real courier rate card via the admin manager (no redeploy).
