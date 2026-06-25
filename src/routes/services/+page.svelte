<script lang="ts">
	import PageHero from '$lib/components/PageHero.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';
	import { resolve } from '$app/paths';
	import { SERVICES } from '$lib/data';
	import { reveal, clipReveal, parallax } from '$lib/motion';
</script>

<svelte:head>
	<title>Services — Warehousing, Fulfilment, Inventory & Distribution | Meridian 3PL</title>
	<meta
		name="description"
		content="Meridian 3PL's four service disciplines: secure warehousing, pick & pack fulfilment, real-time inventory management, and reliable shipping & distribution across Australia."
	/>
</svelte:head>

<PageHero
	eyebrow="Our services"
	description="Four tightly integrated disciplines that carry your product from receiving dock to customer doorstep — each one measurable, each one accountable."
>
	Four disciplines, <span class="serif-accent text-amber-500">one</span> operation.
</PageHero>

<!-- Sticky index nav -->
<nav
	class="sticky top-16 z-30 border-b border-navy-950/10 bg-bone-50/90 backdrop-blur-md lg:top-20"
	aria-label="Services index"
>
	<div class="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-5 sm:px-8">
		{#each SERVICES as service (service.slug)}
			<a
				href={`#${service.slug}`}
				class="group flex shrink-0 items-baseline gap-2 px-4 py-4 font-mono text-[11px] tracking-[0.18em] text-navy-950/60 uppercase transition-colors hover:text-navy-950"
			>
				<span class="text-amber-600">{service.index}</span>
				<span class="border-b border-transparent pb-0.5 transition-colors group-hover:border-amber-500">
					{service.short}
				</span>
			</a>
		{/each}
	</div>
</nav>

{#each SERVICES as service, i (service.slug)}
	<section
		id={service.slug}
		class={['scroll-mt-36 py-24 lg:py-32', i % 2 === 0 ? 'bg-bone-50' : 'bg-bone-100']}
	>
		<div class="mx-auto max-w-7xl px-5 sm:px-8">
			<div class="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
				<div class={['lg:col-span-6', i % 2 === 1 && 'lg:order-2']}>
					<div {@attach reveal({ targets: '[data-reveal]' })}>
						<p data-reveal class="eyebrow text-navy-950/40">Service {service.index} / 04</p>
						<h2 data-reveal class="display mt-5 text-4xl text-navy-950 sm:text-5xl">
							{service.title}
						</h2>
						<p data-reveal class="serif-accent mt-4 text-2xl text-navy-700">{service.tagline}</p>
						<p data-reveal class="mt-7 max-w-xl text-lg leading-relaxed text-navy-950/70">
							{service.description}
						</p>

						<div data-reveal class="mt-12 grid gap-10 sm:grid-cols-2">
							<div>
								<h3 class="eyebrow text-navy-700">What’s included</h3>
								<ul class="mt-5 space-y-3">
									{#each service.features as feature (feature)}
										<li class="flex items-start gap-3 text-sm text-navy-950/75">
											<span class="mt-1.5 h-1 w-1 shrink-0 rotate-45 bg-amber-500" aria-hidden="true"></span>
											{feature}
										</li>
									{/each}
								</ul>
							</div>
							<div>
								<h3 class="eyebrow text-navy-700">What it delivers</h3>
								<ul class="mt-5 space-y-3">
									{#each service.benefits as benefit (benefit)}
										<li class="flex items-start gap-3 text-sm text-navy-950/75">
											<svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" viewBox="0 0 14 14" fill="none" aria-hidden="true">
												<path d="m2 7.5 3.5 3.5L12 3.5" stroke="currentColor" stroke-width="1.5" />
											</svg>
											{benefit}
										</li>
									{/each}
								</ul>
							</div>
						</div>

						<a
							data-reveal
							href={resolve('/quote')}
							class="btn-label group mt-12 inline-flex items-center gap-3 bg-navy-700 px-8 py-4.5 text-white transition-colors duration-300 hover:bg-navy-950"
						>
							Quote {service.short}
							<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
								<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
							</svg>
						</a>
					</div>
				</div>

				<div class={['lg:sticky lg:top-48 lg:col-span-6', i % 2 === 1 && 'lg:order-1']}>
					<figure class="relative overflow-hidden" {@attach clipReveal()} {@attach parallax({ amount: 8 })}>
						<img
							src={service.image}
							alt={service.imageAlt}
							class="aspect-[16/11] w-full scale-105 object-cover"
							loading="lazy"
						/>
						<span class="display absolute right-4 bottom-2 z-10 text-7xl text-white/25 sm:text-8xl" aria-hidden="true">
							{service.index}
						</span>
					</figure>
					<p class="eyebrow mt-4 flex justify-between text-navy-950/45">
						<span>Fig. {service.index}</span>
						<span>{service.short}</span>
					</p>
				</div>
			</div>
		</div>
	</section>
{/each}

<CtaBand
	title="Need a combination"
	accent="of these?"
	description="Most clients do. Tell us what you sell and where it needs to go — we'll engineer the right blend of warehousing, fulfilment, inventory, and distribution."
/>
