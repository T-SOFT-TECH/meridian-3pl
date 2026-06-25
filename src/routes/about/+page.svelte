<script lang="ts">
	import PageHero from '$lib/components/PageHero.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';
	import { VALUES, MISSION, VISION, COMMITMENT, COMPANY } from '$lib/data';
	import { reveal, clipReveal, parallax, lineGrow } from '$lib/motion';
</script>

<svelte:head>
	<title>About Us — Meridian 3PL</title>
	<meta
		name="description"
		content="Meridian 3PL is a comprehensive third-party logistics provider based in Derrimut, Melbourne — combining industry expertise, technology-driven processes, and customer-focused service."
	/>
</svelte:head>

<PageHero
	eyebrow="About Meridian 3PL"
	description="A comprehensive third-party logistics provider dedicated to helping businesses streamline their supply chains — so they can focus on sales, marketing, and growth while we manage the complexity."
>
	Navigated by <span class="serif-accent text-amber-500">principle.</span>
</PageHero>

<!-- ——— WHO WE ARE ————————————————————————————————————————— -->
<section class="bg-bone-50 py-24 lg:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="grid items-start gap-16 lg:grid-cols-12">
			<div class="lg:col-span-6" {@attach reveal({ targets: '[data-reveal]' })}>
				<p data-reveal class="eyebrow text-navy-700">Who we are</p>
				<h2 data-reveal class="display mt-6 text-4xl text-navy-950 sm:text-5xl">
					Logistics, treated as a
					<span class="serif-accent text-navy-700">craft.</span>
				</h2>
				<div data-reveal class="mt-8 space-y-6 text-lg leading-relaxed text-navy-950/70">
					<p>
						Meridian 3PL is a comprehensive third-party logistics provider dedicated to helping
						businesses streamline their supply chain operations through efficient warehousing,
						fulfilment, inventory management, and distribution solutions.
					</p>
					<p>
						We understand that modern businesses need more than just storage space — they need a
						logistics partner capable of ensuring products move efficiently from warehouse shelves
						to customers’ doorsteps. Our solutions are designed to reduce operational costs, improve
						order accuracy, increase delivery speed, and support business growth.
					</p>
				</div>
				<p data-reveal class="eyebrow mt-10 text-navy-950/40">
					Est. Derrimut, Melbourne — {COMPANY.coordinates}
				</p>
			</div>

			<div class="lg:col-span-6">
				<div class="grid grid-cols-2 gap-5">
					<figure class="relative mt-12 overflow-hidden" {@attach clipReveal()} {@attach parallax({ amount: 7 })}>
						<img
							src="/images/planning.jpg"
							alt="Logistics planning session with route documents"
							class="aspect-[3/4] w-full scale-105 object-cover"
							loading="lazy"
						/>
					</figure>
					<figure class="relative overflow-hidden" {@attach clipReveal({ delay: 0.15 })} {@attach parallax({ amount: 10 })}>
						<img
							src="/images/parcel-handover.jpg"
							alt="Parcel handed to a customer at the door"
							class="aspect-[3/4] w-full scale-105 object-cover"
							loading="lazy"
						/>
					</figure>
				</div>
				<p class="eyebrow mt-4 flex justify-between text-navy-950/45">
					<span>Fig. 02 — Planned. Delivered.</span>
					<span>EST. MMXXVI</span>
				</p>
			</div>
		</div>
	</div>
</section>

<!-- ——— MISSION / VISION ————————————————————————————————————— -->
<section class="grain meridian-grid relative overflow-hidden bg-navy-950 text-white">
	<div class="mx-auto grid max-w-7xl gap-px px-0 lg:grid-cols-2">
		<div class="px-5 py-20 sm:px-8 lg:py-28 lg:pr-16" {@attach reveal({ targets: '[data-reveal]' })}>
			<p data-reveal class="eyebrow text-amber-500">Mission</p>
			<h2 data-reveal class="display mt-6 text-3xl sm:text-4xl">
				Why we <span class="serif-accent text-amber-500">operate.</span>
			</h2>
			<p data-reveal class="mt-8 text-lg leading-relaxed text-white/70">{MISSION}</p>
		</div>
		<div class="border-t border-white/10 px-5 py-20 sm:px-8 lg:border-t-0 lg:border-l lg:py-28 lg:pl-16" {@attach reveal({ targets: '[data-reveal]', delay: 0.1 })}>
			<p data-reveal class="eyebrow text-amber-500">Vision</p>
			<h2 data-reveal class="display mt-6 text-3xl sm:text-4xl">
				Where we’re <span class="serif-accent text-amber-500">headed.</span>
			</h2>
			<p data-reveal class="mt-8 text-lg leading-relaxed text-white/70">{VISION}</p>
		</div>
	</div>
</section>

<!-- ——— VALUES ————————————————————————————————————————————— -->
<section class="bg-bone-50 py-24 lg:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="max-w-2xl" {@attach reveal({ targets: '[data-reveal]' })}>
			<p data-reveal class="eyebrow text-navy-700">Core values</p>
			<h2 data-reveal class="display mt-6 text-4xl text-navy-950 sm:text-5xl">
				Six fixed <span class="serif-accent text-navy-700">bearings.</span>
			</h2>
			<p data-reveal class="mt-6 text-lg leading-relaxed text-navy-950/65">
				Like the meridian we’re named for, these don’t shift with conditions. Every client
				engagement is run against them.
			</p>
		</div>

		<div class="mt-16 h-px w-full bg-navy-950/15" {@attach lineGrow()} aria-hidden="true"></div>

		<ul class="grid gap-x-10 gap-y-14 pt-14 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ targets: 'li', stagger: 0.08 })}>
			{#each VALUES as value, i (value.title)}
				<li class="relative pl-6">
					<span class="absolute top-1 left-0 h-10 w-px bg-amber-500" aria-hidden="true"></span>
					<p class="eyebrow text-navy-950/40">0{i + 1}</p>
					<h3 class="display mt-3 text-xl text-navy-950">{value.title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-navy-950/60">{value.description}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- ——— COMMITMENT ————————————————————————————————————————— -->
<section class="grain relative overflow-hidden bg-navy-700 py-24 text-white lg:py-36">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="grid items-center gap-14 lg:grid-cols-12">
			<figure class="relative overflow-hidden lg:col-span-5" {@attach clipReveal()} {@attach parallax({ amount: 8 })}>
				<img
					src="/images/handshake.jpg"
					alt="Partnership handshake between two business people"
					class="aspect-[4/3] w-full scale-105 object-cover"
					loading="lazy"
				/>
			</figure>
			<div class="lg:col-span-7" {@attach reveal({ targets: '[data-reveal]' })}>
				<p data-reveal class="eyebrow text-amber-500">Our commitment</p>
				<blockquote data-reveal class="mt-8">
					<p class="font-serif text-3xl leading-snug italic sm:text-4xl lg:text-[2.75rem]">
						“{COMMITMENT}”
					</p>
				</blockquote>
				<p data-reveal class="mt-8 max-w-xl leading-relaxed text-white/65">
					We are committed to delivering dependable logistics solutions that help our clients
					improve efficiency, reduce costs, and exceed customer expectations.
				</p>
			</div>
		</div>
	</div>
</section>

<CtaBand
	title="Partner with"
	accent="meridian."
	description="Talk to our team about where your supply chain is today — and where it should be."
/>
