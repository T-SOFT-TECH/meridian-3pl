<script lang="ts">
	import PageHero from '$lib/components/PageHero.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';
	import { resolve } from '$app/paths';
	import { INDUSTRIES } from '$lib/data';
	import { reveal } from '$lib/motion';
</script>

<svelte:head>
	<title>Industries We Serve — Meridian 3PL</title>
	<meta
		name="description"
		content="Customised logistics for e-commerce, retail, manufacturing, healthcare, FMCG, electronics, fashion, industrial, food & beverage, and automotive businesses across Australia."
	/>
</svelte:head>

<PageHero
	eyebrow="Industries we serve"
	description="No two categories move alike. We tune storage, handling, and fulfilment to the rhythms of your sector — its peaks, its compliance demands, its customers."
>
	Fluent in <span class="serif-accent text-amber-500">your</span> category.
</PageHero>

<section class="bg-bone-50 py-20 lg:py-28">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ targets: 'li', stagger: 0.06, start: 'top 92%' })}>
			{#each INDUSTRIES as industry, i (industry.name)}
				<li class={['group', (i === 0 || i === INDUSTRIES.length - 1) && 'lg:col-span-2']}>
					<article
						class={[
							'relative h-full overflow-hidden bg-navy-950',
							i === 0 || i === INDUSTRIES.length - 1 ? 'aspect-[4/3] sm:aspect-[2/1] lg:aspect-[8/3]' : 'aspect-[4/3]'
						]}
					>
						<img
							src={industry.image}
							alt={industry.imageAlt}
							class="h-full w-full object-cover opacity-80 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-50"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-transparent"></div>
						<div class="absolute inset-x-0 bottom-0 p-7">
							<p class="eyebrow text-amber-500">{String(i + 1).padStart(2, '0')}</p>
							<h2 class="display mt-3 text-2xl text-white">{industry.name}</h2>
							<p class="mt-3 max-w-md text-sm leading-relaxed text-white/75 transition-colors duration-500 lg:text-white/0 lg:group-hover:text-white/75">
								{industry.blurb}
							</p>
						</div>
					</article>
				</li>
			{/each}
		</ul>

		<div class="mt-20 border border-navy-950/10 bg-bone-100 p-10 lg:p-14" {@attach reveal({ targets: '[data-reveal]' })}>
			<div class="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
				<div>
					<p data-reveal class="eyebrow text-navy-700">A different sector?</p>
					<h2 data-reveal class="display mt-4 max-w-xl text-3xl text-navy-950 sm:text-4xl">
						If it can be stored, picked, and shipped — <span class="serif-accent text-navy-700">talk to us.</span>
					</h2>
				</div>
				<a
					data-reveal
					href={resolve('/contact')}
					class="btn-label group inline-flex shrink-0 items-center gap-3 bg-navy-700 px-8 py-5 text-white transition-colors duration-300 hover:bg-navy-950"
				>
					Contact the team
					<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
						<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
					</svg>
				</a>
			</div>
		</div>
	</div>
</section>

<CtaBand
	title="Your sector,"
	accent="served."
	description="Get a quote shaped around your category's volumes, channels, and handling requirements."
/>
