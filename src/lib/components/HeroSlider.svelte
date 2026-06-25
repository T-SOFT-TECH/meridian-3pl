<script lang="ts">
	import { gsap } from 'gsap';
	import { base, resolve } from '$app/paths';
	import { prefersReducedMotion } from '$lib/motion';

	interface Token {
		text: string;
		accent?: boolean;
	}
	interface Slide {
		image: string;
		alt: string;
		eyebrow: string;
		nav: string;
		lines: Token[][];
		sub: string;
		tag: string;
		secondary: { label: string; hash?: string };
	}

	const DURATION = 6.5; // seconds per slide

	const slides: Slide[] = [
		{
			image: '/images/port-aerial.jpg',
			alt: 'Aerial view of an intermodal container terminal at dusk',
			eyebrow: 'Third-party logistics · Derrimut, Melbourne',
			nav: 'Meridian',
			lines: [
				[{ text: 'Precision logistics' }],
				[{ text: 'for businesses that ' }, { text: 'move.', accent: true }]
			],
			sub: 'Warehousing, fulfilment, inventory, and distribution — one complete supply-chain operation, run to the standard your customers already expect.',
			tag: '37.7833° S / 144.7667° E',
			secondary: { label: 'Explore Services' }
		},
		{
			image: '/images/hero-warehouse.jpg',
			alt: 'High-bay warehouse aisle stacked with palletised inventory',
			eyebrow: 'Warehousing solutions',
			nav: 'Warehousing',
			lines: [
				[{ text: 'Secure space' }],
				[{ text: 'that ' }, { text: 'scales', accent: true }, { text: ' with you.' }]
			],
			sub: 'Short or long term, racked, tracked, and inspected on arrival — flexible storage with full inventory visibility.',
			tag: 'Service 01 / 04',
			secondary: { label: 'Warehousing', hash: 'warehousing' }
		},
		{
			image: '/images/fulfillment-floor.jpg',
			alt: 'Fulfilment floor with organised pick bins and packing stations',
			eyebrow: 'Pick & pack fulfilment',
			nav: 'Fulfilment',
			lines: [
				[{ text: 'Every order, out' }],
				[{ text: 'the door ' }, { text: 'accurately.', accent: true }]
			],
			sub: 'From order received to shipment ready — picked, packed, quality-checked, and on its way, fast.',
			tag: 'Service 02 / 04',
			secondary: { label: 'Fulfilment', hash: 'fulfillment' }
		},
		{
			image: '/images/road-train.jpg',
			alt: 'Australian road train hauling freight across the outback',
			eyebrow: 'Shipping & distribution',
			nav: 'Distribution',
			lines: [
				[{ text: 'Across the city.' }],
				[{ text: 'Across the ' }, { text: 'continent.', accent: true }]
			],
			sub: 'Reliable networks and last-mile coordination that put product where it needs to be — safely, and on time.',
			tag: 'Service 03 / 04',
			secondary: { label: 'Distribution', hash: 'distribution' }
		}
	];

	let current = $state(0);
	let animating = false;

	let slideEls = $state<HTMLElement[]>([]);
	let progressBar: HTMLElement;
	let progressTween: gsap.core.Tween | undefined;
	const kbTweens: (gsap.core.Tween | undefined)[] = [];
	let reduced = false;

	const pad = (n: number) => String(n + 1).padStart(2, '0');

	function content(el: HTMLElement) {
		return el.querySelectorAll<HTMLElement>('[data-anim]');
	}
	function media(el: HTMLElement) {
		return el.querySelector<HTMLElement>('.kb');
	}

	function startKenBurns(i: number) {
		if (reduced) return;
		const img = slideEls[i]?.querySelector<HTMLElement>('.kb img');
		if (!img) return;
		kbTweens[i]?.kill();
		kbTweens[i] = gsap.fromTo(
			img,
			{ scale: 1.06, xPercent: -1.5, yPercent: -1 },
			{ scale: 1.2, xPercent: 1.5, yPercent: 1, duration: DURATION + 4, ease: 'none' }
		);
	}

	function startProgress() {
		progressTween?.kill();
		if (reduced) {
			gsap.set(progressBar, { scaleX: 0 });
			return;
		}
		gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' });
		progressTween = gsap.to(progressBar, {
			scaleX: 1,
			duration: DURATION,
			ease: 'none',
			onComplete: () => goTo((current + 1) % slides.length)
		});
	}

	function goTo(next: number, { user = false } = {}) {
		if (next === current || animating) return;
		const cur = slideEls[current];
		const nxt = slideEls[next];
		if (!cur || !nxt) return;

		progressTween?.kill();

		if (reduced) {
			gsap.to(cur, { autoAlpha: 0, duration: 0.4 });
			gsap.fromTo(nxt, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
			current = next;
			return;
		}

		animating = true;
		gsap.set(nxt, { autoAlpha: 1, zIndex: 2 });
		gsap.set(cur, { zIndex: 1 });

		const tl = gsap.timeline({
			onComplete: () => {
				gsap.set(cur, { autoAlpha: 0 });
				kbTweens[current]?.kill();
				animating = false;
				startKenBurns(next);
				startProgress();
			}
		});

		// Outgoing copy lifts away
		tl.to(
			content(cur),
			{ yPercent: -115, opacity: 0, duration: 0.5, stagger: 0.035, ease: 'power3.in' },
			0
		);
		// Incoming image settles from a slight zoom
		tl.fromTo(
			media(nxt),
			{ scale: 1.25, autoAlpha: 0 },
			{ scale: 1.06, autoAlpha: 1, duration: 1.1, ease: 'power2.out' },
			0.05
		);
		tl.to(media(cur), { autoAlpha: 0, duration: 0.8, ease: 'power1.inOut' }, 0.25);
		// Incoming copy masks up line by line
		tl.fromTo(
			content(nxt),
			{ yPercent: 120, opacity: 0 },
			{ yPercent: 0, opacity: 1, duration: 0.95, stagger: 0.075, ease: 'power4.out' },
			0.32
		);

		current = next;
		void user;
	}

	function next() {
		goTo((current + 1) % slides.length, { user: true });
	}
	function prev() {
		goTo((current - 1 + slides.length) % slides.length, { user: true });
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			next();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			prev();
		}
	}

	// Touch / pointer swipe
	let pointerX = 0;
	let pointerActive = false;
	function onPointerDown(event: PointerEvent) {
		if (event.pointerType === 'mouse') return;
		pointerActive = true;
		pointerX = event.clientX;
	}
	function onPointerUp(event: PointerEvent) {
		if (!pointerActive) return;
		pointerActive = false;
		const dx = event.clientX - pointerX;
		if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
	}

	$effect(() => {
		reduced = prefersReducedMotion();

		// Initial state: stack slides, reveal the first.
		slideEls.forEach((el, i) => {
			gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 });
		});

		if (reduced) {
			startKenBurns(0); // no-op under reduced
		} else {
			gsap.from(content(slideEls[0]), {
				yPercent: 120,
				opacity: 0,
				duration: 1,
				stagger: 0.085,
				delay: 0.15,
				ease: 'power4.out'
			});
			startKenBurns(0);
			startProgress();
		}

		const onVisibility = () => {
			if (document.hidden) {
				progressTween?.pause();
			} else if (!reduced) {
				progressTween?.resume();
			}
		};
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			progressTween?.kill();
			kbTweens.forEach((t) => t?.kill());
		};
	});

</script>

<svelte:window onkeydown={onKeydown} />

<section
	class="grain relative flex min-h-svh flex-col justify-end overflow-hidden bg-navy-950 text-white"
	aria-roledescription="carousel"
	aria-label="Meridian 3PL — featured"
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
>
	<!-- Slides -->
	<div class="absolute inset-0">
		{#each slides as slide, i (slide.image)}
			<article
				bind:this={slideEls[i]}
				class="absolute inset-0"
				aria-hidden={current !== i}
				aria-roledescription="slide"
				aria-label={`${i + 1} of ${slides.length}`}
				style:opacity={i === 0 ? 1 : 0}
			>
				<!-- Ken Burns media -->
				<div class="kb absolute inset-0">
					<img
						src={base + slide.image}
						alt={slide.alt}
						class="h-full w-full scale-105 object-cover"
						fetchpriority={i === 0 ? 'high' : 'auto'}
						loading={i === 0 ? 'eager' : 'lazy'}
						decoding="async"
					/>
				</div>
				<div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-900/50"></div>
				<div class="meridian-grid absolute inset-0"></div>

				<!-- Copy -->
				<div class="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-5 pt-32 pb-[clamp(6rem,14vh,11rem)] sm:px-8">
					<div class="overflow-hidden">
						<p data-anim class="eyebrow text-amber-500">{slide.eyebrow}</p>
					</div>

					<h1 class="display mt-6 max-w-5xl text-[clamp(2.5rem,min(8.5vw,10vh),6.5rem)] leading-[0.95] text-balance">
						{#each slide.lines as line, li (li)}
							<span class="block overflow-hidden pb-[0.08em]">
								<span data-anim class="block">
									{#each line as token, ti (ti)}
										{#if token.accent}<span class="serif-accent text-amber-500">{token.text}</span
											>{:else}{token.text}{/if}
									{/each}
								</span>
							</span>
						{/each}
					</h1>

					<div class="mt-7 max-w-xl overflow-hidden">
						<p data-anim class="text-base leading-relaxed text-white/70 sm:text-lg">{slide.sub}</p>
					</div>

					<div class="mt-9 overflow-hidden">
						<div data-anim class="flex flex-col gap-4 sm:flex-row sm:items-center">
							<a
								href={resolve('/quote')}
								class="btn-label group inline-flex items-center justify-center gap-3 bg-amber-500 px-9 py-5 text-navy-950 transition-colors duration-300 hover:bg-amber-400"
							>
								Get a Quote
								<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
									<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
								</svg>
							</a>
							<a
								href={resolve('/services') + (slide.secondary.hash ? `#${slide.secondary.hash}` : '')}
								class="btn-label inline-flex items-center justify-center gap-3 border border-white/25 px-9 py-5 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-navy-950"
							>
								{slide.secondary.label}
							</a>
						</div>
					</div>
				</div>
			</article>
		{/each}
	</div>

	<!-- Vertical meridian rule + diamond -->
	<div class="pointer-events-none absolute inset-y-0 right-[14%] hidden w-px bg-white/10 lg:block" aria-hidden="true">
		<div class="absolute top-1/3 -left-1 h-2 w-2 rotate-45 border border-amber-500"></div>
	</div>

	<!-- Controls -->
	<div class="relative z-20 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8">
		<div class="flex items-end justify-between gap-6 border-t border-white/15 pt-6">
			<!-- Counter -->
			<div class="flex items-baseline gap-2" aria-live="polite">
				<span class="display text-4xl text-white sm:text-5xl">{pad(current)}</span>
				<span class="font-mono text-xs tracking-widest text-white/45">/ {pad(slides.length - 1)}</span>
			</div>

			<!-- Tabs -->
			<nav class="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Choose slide">
				{#each slides as slide, i (slide.nav)}
					<button
						type="button"
						onclick={() => goTo(i, { user: true })}
						class={[
							'group relative px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors',
							current === i ? 'text-amber-500' : 'text-white/45 hover:text-white'
						]}
						aria-current={current === i ? 'true' : undefined}
					>
						{slide.nav}
						<span
							class={[
								'absolute -bottom-px left-0 h-px w-full origin-left bg-amber-500 transition-transform duration-300',
								current === i ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
							]}
						></span>
					</button>
				{/each}
			</nav>

			<!-- Arrows + play/pause -->
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={prev}
					aria-label="Previous slide"
					class="flex h-11 w-11 items-center justify-center border border-white/25 text-white transition-colors hover:border-amber-500 hover:text-amber-500"
				>
					<svg class="h-4 w-4 rotate-180" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" /></svg>
				</button>
				<button
					type="button"
					onclick={next}
					aria-label="Next slide"
					class="flex h-11 w-11 items-center justify-center border border-white/25 text-white transition-colors hover:border-amber-500 hover:text-amber-500"
				>
					<svg class="h-4 w-4" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" /></svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Progress bar -->
	<div class="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/10">
		<span bind:this={progressBar} class="block h-full w-full origin-left scale-x-0 bg-amber-500"></span>
	</div>
</section>
