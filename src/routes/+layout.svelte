<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/state';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { prefersReducedMotion } from '$lib/motion';
	import Lenis from 'lenis';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	let { children } = $props();

	// The admin area renders its own chrome — skip the marketing shell + smooth scroll there.
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	// Held at component scope so afterNavigate can reset the scroll position.
	// Null whenever smooth scroll is inactive (admin area or reduced-motion),
	// in which case SvelteKit's native scroll restoration already works.
	let lenis: Lenis | null = null;

	// Smooth scroll driven by GSAP's ticker so ScrollTrigger and Lenis share one clock.
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
	// This also runs on browser back/forward, so it intentionally overrides
	// SvelteKit's scroll *restoration* (back lands at the top) while Lenis is active.
	afterNavigate(({ to }) => {
		if (lenis) lenis.scrollTo(to?.url.hash || 0, { immediate: true });
		requestAnimationFrame(() => ScrollTrigger.refresh());
	});

	// Cross-fade between pages where the View Transitions API is available.
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion()) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href="/logo/meridian-icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/logo/meridian-icon.png" />
	<meta name="theme-color" content="#1a1f6e" />
</svelte:head>

{#if isAdmin}
	{@render children()}
{:else}
	<a
		href="#main"
		class="btn-label fixed top-3 left-3 z-100 -translate-y-20 bg-amber-500 px-5 py-3 text-navy-950 transition-transform focus:translate-y-0"
	>
		Skip to content
	</a>

	<Header />

	<main id="main">
		{@render children()}
	</main>

	<Footer />
{/if}
