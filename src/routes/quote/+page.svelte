<script lang="ts">
	import { reveal } from '$lib/motion';
	import { COMPANY } from '$lib/data';
	import PricingCalculator from '$lib/components/calculator/PricingCalculator.svelte';

	let { data } = $props();

	const steps = [
		{ n: '01', t: 'We review', d: 'Your estimate lands directly with our logistics team — typically reviewed within one business day.' },
		{ n: '02', t: 'We talk', d: 'A short call to confirm volumes, channels, and any special handling your product needs.' },
		{ n: '03', t: 'You decide', d: 'You receive a tailored proposal — clear scope, clear pricing, no obligation.' }
	];
</script>

<svelte:head>
	<title>Get a Quote — Instant Pricing Calculator | Meridian 3PL</title>
	<meta
		name="description"
		content="Price your 3PL in seconds. Move the sliders to match your operation and see a transparent estimate — per order and per month — then send it to Meridian's team for a tailored quote."
	/>
</svelte:head>

<!-- ——— HERO ————————————————————————————————————————————— -->
<section class="grain meridian-grid relative overflow-hidden bg-navy-950 text-white">
	<div class="pointer-events-none absolute inset-y-0 left-5 w-px bg-white/10 sm:left-8 lg:left-1/2" aria-hidden="true"></div>
	<div
		class="relative z-10 mx-auto max-w-7xl px-5 pt-40 pb-16 sm:px-8 lg:pt-48 lg:pb-20"
		{@attach reveal({ targets: '[data-reveal]', immediate: true, delay: 0.15 })}
	>
		<p data-reveal class="eyebrow text-amber-500">Get a quote · response within one business day</p>
		<h1 data-reveal class="display mt-6 max-w-4xl text-5xl text-balance sm:text-6xl lg:text-7xl">
			Let's map <span class="serif-accent text-amber-500">your</span> route.
		</h1>
		<p data-reveal class="mt-7 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
			Get a transparent estimate in seconds — then send it to our team for a tailored quote. No phone
			tag, no "contact us for pricing", no hidden fees.
		</p>
	</div>
</section>

<!-- ——— CALCULATOR ————————————————————————————————————————— -->
<PricingCalculator config={data.config} />

<!-- ——— WHAT HAPPENS NEXT ————————————————————————————————— -->
<section class="bg-bone-50 py-20 lg:py-28">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="grid gap-12 lg:grid-cols-12 lg:gap-16">
			<div class="lg:col-span-7" {@attach reveal({ targets: '[data-reveal]' })}>
				<p data-reveal class="eyebrow text-navy-700">What happens next</p>
				<h2 data-reveal class="display mt-5 text-3xl text-navy-950 sm:text-4xl">
					From estimate to <span class="serif-accent text-navy-700">answer.</span>
				</h2>
				<ol class="mt-9 space-y-7">
					{#each steps as step (step.n)}
						<li data-reveal class="flex gap-5">
							<span class="display text-2xl text-amber-500">{step.n}</span>
							<div>
								<h3 class="display text-lg text-navy-950">{step.t}</h3>
								<p class="mt-1.5 max-w-md text-sm leading-relaxed text-navy-950/60">{step.d}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>

			<div class="lg:col-span-5" {@attach reveal({ targets: '[data-reveal]', delay: 0.15 })}>
				<div data-reveal class="border border-navy-950/15 bg-bone-100 p-8">
					<p class="eyebrow text-amber-600">Prefer to talk first?</p>
					<a href={COMPANY.phoneHref} class="display mt-4 block text-3xl text-navy-950 transition-colors hover:text-navy-700">
						{COMPANY.phone}
					</a>
					<p class="mt-4 font-mono text-[11px] leading-relaxed tracking-wide text-navy-950/45">
						{COMPANY.address} · {COMPANY.city}<br />Mon–Fri · 8:00–17:00 AEST
					</p>
					<p class="eyebrow mt-6 text-navy-950/30">{COMPANY.coordinates}</p>
				</div>
			</div>
		</div>
	</div>
</section>
