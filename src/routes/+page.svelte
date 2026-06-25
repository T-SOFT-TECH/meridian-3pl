<script lang="ts">
	import { resolve } from '$app/paths';
	import { COMPANY, SERVICES, PROCESS, INDUSTRIES, WHY_CHOOSE, COMMITMENT } from '$lib/data';
	import { reveal, clipReveal, parallax, countUp, lineGrow } from '$lib/motion';
	import Marquee from '$lib/components/Marquee.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';
	import HeroSlider from '$lib/components/HeroSlider.svelte';

	const tickerItems = [
		'Warehousing',
		'Pick & Pack',
		'Inventory',
		'Distribution',
		'Melbourne',
		'Reliability',
		'Precision'
	];

	const stats = [
		{ value: 4, label: 'Core service lines', detail: 'Warehouse to doorstep' },
		{ value: 10, label: 'Industries served', detail: 'E-commerce to automotive' },
		{ value: 5, label: 'Step method', detail: 'Receive through report' }
	];
</script>

<svelte:head>
	<title>Meridian 3PL — Precision Third-Party Logistics, Melbourne</title>
	<meta
		name="description"
		content="Meridian 3PL is Melbourne's precision third-party logistics partner — warehousing, pick & pack fulfilment, inventory management, and distribution engineered to reduce costs and accelerate growth."
	/>
	<meta property="og:title" content="Meridian 3PL — Precision Third-Party Logistics, Melbourne" />
	<meta
		property="og:description"
		content="Warehousing, fulfilment, inventory, and distribution — engineered from Melbourne for businesses that intend to grow."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/images/port-aerial.jpg" />
</svelte:head>

<!-- ——— HERO SLIDER ————————————————————————————————————————— -->
<HeroSlider />

<!-- ——— TICKER ————————————————————————————————————————————— -->
<div class="border-y border-navy-950/10 bg-amber-500 py-5 text-navy-950">
	<Marquee items={tickerItems} />
</div>

<!-- ——— POSITIONING ————————————————————————————————————————— -->
<section class="relative overflow-hidden bg-bone-50 py-24 lg:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="grid items-start gap-16 lg:grid-cols-12">
			<div class="lg:col-span-7" {@attach reveal({ targets: '[data-reveal]' })}>
				<p data-reveal class="eyebrow text-navy-700">Who we are</p>
				<h2 data-reveal class="display mt-6 text-4xl text-navy-950 sm:text-5xl lg:text-6xl">
					More than storage —
					<span class="serif-accent text-navy-700">a partner</span>
					in motion.
				</h2>
				<p data-reveal class="mt-8 max-w-xl text-lg leading-relaxed text-navy-950/70">
					Modern businesses need more than space on a shelf — they need a logistics partner capable
					of moving product from warehouse to doorstep, efficiently and accountably. Meridian 3PL
					combines industry expertise, technology-driven processes, and customer-focused service so
					you can stay focused on sales, marketing, and growth.
				</p>
				<a
					data-reveal
					href={resolve('/about')}
					class="btn-label group mt-10 inline-flex items-center gap-3 text-navy-700 transition-colors hover:text-navy-950"
				>
					<span class="border-b border-amber-500 pb-1">About Meridian</span>
					<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
						<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
					</svg>
				</a>

				<div class="mt-16 grid grid-cols-3 gap-6 border-t border-navy-950/15 pt-8">
					{#each stats as stat (stat.label)}
						<div>
							<p class="display text-4xl text-navy-700 sm:text-5xl">
								<span {@attach countUp(stat.value)}>{stat.value}</span>
							</p>
							<p class="eyebrow mt-3 text-navy-950/85">{stat.label}</p>
							<p class="mt-1.5 font-mono text-[11px] text-navy-950/45">{stat.detail}</p>
						</div>
					{/each}
				</div>
			</div>

			<div class="relative lg:col-span-5">
				<figure class="relative overflow-hidden" {@attach clipReveal()} {@attach parallax({ amount: 7 })}>
					<img
						src="/images/hero-warehouse.jpg"
						alt="High-bay warehouse aisle stacked with palletised inventory"
						class="aspect-[3/4] w-full scale-105 object-cover"
						loading="lazy"
					/>
				</figure>
				<p class="eyebrow mt-4 flex flex-wrap justify-between gap-x-6 gap-y-2 text-navy-950/45">
					<span>Fig. 01 — Racked storage</span>
					<span>{COMPANY.coordinates}</span>
				</p>
				<div class="absolute -top-6 -left-6 hidden h-12 w-12 border-t border-l border-amber-500 lg:block" aria-hidden="true"></div>
			</div>
		</div>
	</div>
</section>

<!-- ——— SERVICES ————————————————————————————————————————————— -->
<section class="grain meridian-grid relative overflow-hidden bg-navy-950 py-24 text-white lg:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="flex flex-wrap items-end justify-between gap-6" {@attach reveal({ targets: '[data-reveal]' })}>
			<div>
				<p data-reveal class="eyebrow text-amber-500">What we do</p>
				<h2 data-reveal class="display mt-6 text-4xl sm:text-5xl lg:text-6xl">
					Four disciplines.
					<span class="serif-accent text-amber-500">one</span>
					operation.
				</h2>
			</div>
			<a
				data-reveal
				href={resolve('/services')}
				class="btn-label group inline-flex items-center gap-3 text-white/70 transition-colors hover:text-white"
			>
				<span class="border-b border-amber-500 pb-1">All services</span>
				<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
					<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
				</svg>
			</a>
		</div>

		<div class="mt-20 space-y-24 lg:space-y-32">
			{#each SERVICES as service, i (service.slug)}
				<article class="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
					<figure
						class={['relative overflow-hidden lg:col-span-6', i % 2 === 1 && 'lg:order-2']}
						{@attach clipReveal()}
						{@attach parallax({ amount: 9 })}
					>
						<img
							src={service.image}
							alt={service.imageAlt}
							class="aspect-[16/11] w-full scale-105 object-cover"
							loading="lazy"
						/>
						<span class="eyebrow absolute top-4 left-4 z-10 bg-navy-950/80 px-3 py-2 text-amber-500 backdrop-blur-sm">
							{service.index}
						</span>
					</figure>

					<div
						class={['lg:col-span-6', i % 2 === 1 && 'lg:order-1']}
						{@attach reveal({ targets: '[data-reveal]' })}
					>
						<p data-reveal class="eyebrow text-white/40">Service {service.index} / 04</p>
						<h3 data-reveal class="display mt-4 text-3xl sm:text-4xl">{service.title}</h3>
						<p data-reveal class="serif-accent mt-3 text-xl text-amber-500/90 sm:text-2xl">{service.tagline}</p>
						<p data-reveal class="mt-6 max-w-lg leading-relaxed text-white/65">{service.description}</p>
						<ul data-reveal class="mt-8 grid max-w-lg grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
							{#each service.features.slice(0, 4) as feature (feature)}
								<li class="flex items-center gap-3 font-mono text-xs tracking-wide text-white/55">
									<span class="h-1 w-1 shrink-0 rotate-45 bg-amber-500" aria-hidden="true"></span>
									{feature}
								</li>
							{/each}
						</ul>
						<a
							data-reveal
							href={`${resolve('/services')}#${service.slug}`}
							class="btn-label group mt-9 inline-flex items-center gap-3 text-amber-500 transition-colors hover:text-amber-400"
						>
							<span class="border-b border-amber-500/50 pb-1 group-hover:border-amber-400">Explore {service.short}</span>
							<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
								<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
							</svg>
						</a>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- ——— PROCESS ————————————————————————————————————————————— -->
<section class="relative overflow-hidden bg-bone-100 py-24 lg:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="max-w-2xl" {@attach reveal({ targets: '[data-reveal]' })}>
			<p data-reveal class="eyebrow text-navy-700">Our logistics process</p>
			<h2 data-reveal class="display mt-6 text-4xl text-navy-950 sm:text-5xl">
				The Meridian
				<span class="serif-accent text-navy-700">method.</span>
			</h2>
			<p data-reveal class="mt-6 text-lg leading-relaxed text-navy-950/65">
				Five disciplined steps, repeated thousands of times a week — the same rigour from the first
				carton received to the last report delivered.
			</p>
		</div>

		<div class="mt-16 h-px w-full bg-navy-950/15" {@attach lineGrow()} aria-hidden="true"></div>

		<ol class="grid gap-x-8 gap-y-12 pt-12 sm:grid-cols-2 lg:grid-cols-5" {@attach reveal({ targets: 'li', stagger: 0.12 })}>
			{#each PROCESS as step (step.index)}
				<li class="relative">
					<p class="display text-5xl text-navy-200">{step.index}</p>
					<h3 class="display mt-5 text-xl text-navy-950">{step.title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-navy-950/60">{step.description}</p>
					<span class="absolute -top-12 left-0 h-6 w-px bg-amber-500" aria-hidden="true"></span>
				</li>
			{/each}
		</ol>
	</div>
</section>

<!-- ——— INDUSTRIES BAND ————————————————————————————————————— -->
<section class="grain relative overflow-hidden bg-navy-700 py-24 text-white lg:py-32">
	<div class="mx-auto max-w-7xl px-5 sm:px-8" {@attach reveal({ targets: '[data-reveal]' })}>
		<div class="flex flex-wrap items-end justify-between gap-6">
			<div>
				<p data-reveal class="eyebrow text-amber-500">Industries we serve</p>
				<h2 data-reveal class="display mt-6 max-w-3xl text-4xl sm:text-5xl">
					Built for the way
					<span class="serif-accent text-amber-500">your</span>
					sector moves.
				</h2>
			</div>
			<a
				data-reveal
				href={resolve('/industries')}
				class="btn-label group inline-flex items-center gap-3 text-white/70 transition-colors hover:text-white"
			>
				<span class="border-b border-amber-500 pb-1">All industries</span>
				<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
					<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
				</svg>
			</a>
		</div>

		<ul data-reveal class="mt-14 flex flex-wrap gap-x-3 gap-y-3">
			{#each INDUSTRIES as industry (industry.name)}
				<li>
					<a
						href={resolve('/industries')}
						class="inline-block border border-white/20 px-5 py-3 font-mono text-xs tracking-[0.15em] text-white/75 uppercase transition-all duration-300 hover:border-amber-500 hover:bg-amber-500 hover:text-navy-950"
					>
						{industry.name}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- ——— WHY MERIDIAN ————————————————————————————————————————— -->
<section class="bg-bone-50 py-24 lg:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="grid gap-16 lg:grid-cols-12">
			<div class="lg:col-span-4" {@attach reveal({ targets: '[data-reveal]' })}>
				<p data-reveal class="eyebrow text-navy-700">Why choose Meridian</p>
				<h2 data-reveal class="display mt-6 text-4xl text-navy-950 sm:text-5xl">
					The standard,
					<span class="serif-accent text-navy-700">held.</span>
				</h2>
				<p data-reveal class="mt-6 leading-relaxed text-navy-950/65">
					{COMMITMENT}
				</p>
				<figure data-reveal class="relative mt-10 overflow-hidden" {@attach parallax({ amount: 6 })}>
					<img
						src="/images/melbourne-flinders.jpg"
						alt="Flinders Street Station, Melbourne"
						class="aspect-[4/3] w-full scale-110 object-cover object-left"
						loading="lazy"
					/>
					<figcaption class="eyebrow absolute bottom-3 left-3 z-10 bg-navy-950/80 px-3 py-2 text-white/80 backdrop-blur-sm">
						Melbourne — home base
					</figcaption>
				</figure>
			</div>

			<ul class="grid gap-px border border-navy-950/10 bg-navy-950/10 sm:grid-cols-2 lg:col-span-8" {@attach reveal({ targets: 'li', stagger: 0.07 })}>
				{#each WHY_CHOOSE as reason, i (reason.title)}
					<li class="group bg-bone-50 p-8 transition-colors duration-300 hover:bg-navy-950 lg:p-10">
						<p class="eyebrow text-amber-600 group-hover:text-amber-500">0{i + 1}</p>
						<h3 class="display mt-4 text-lg text-navy-950 transition-colors duration-300 group-hover:text-white">
							{reason.title}
						</h3>
						<p class="mt-3 text-sm leading-relaxed text-navy-950/60 transition-colors duration-300 group-hover:text-white/65">
							{reason.description}
						</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<CtaBand />
