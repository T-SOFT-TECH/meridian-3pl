<script lang="ts">
	import { resolve } from '$app/paths';
	import { COMPANY, SERVICES, NAV_LINKS } from '$lib/data';

	const year = new Date().getFullYear();
</script>

<footer class="grain meridian-grid relative overflow-hidden bg-navy-950 text-white">
	<div class="relative z-10 mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8 lg:pt-28">
		<div class="grid gap-14 lg:grid-cols-12">
			<div class="lg:col-span-5">
				<img
					src="/logo/meridian-3pl-white-logo.webp"
					alt="Meridian 3PL"
					class="h-16 w-auto"
					width="430"
					height="376"
					loading="lazy"
				/>
				<p class="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
					A comprehensive third-party logistics partner — warehousing, fulfilment, inventory, and
					distribution, engineered from Melbourne for businesses that intend to grow.
				</p>
				<p class="eyebrow mt-8 text-white/30">{COMPANY.coordinates}</p>
			</div>

			<nav class="lg:col-span-3" aria-label="Footer — services">
				<h2 class="eyebrow text-amber-500">Services</h2>
				<ul class="mt-6 space-y-3.5">
					{#each SERVICES as service (service.slug)}
						<li>
							<a
								href={`${resolve('/services')}#${service.slug}`}
								class="text-sm text-white/70 transition-colors hover:text-white"
							>
								{service.title}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<nav class="lg:col-span-2" aria-label="Footer — company">
				<h2 class="eyebrow text-amber-500">Company</h2>
				<ul class="mt-6 space-y-3.5">
					{#each NAV_LINKS.filter((l) => l.href !== '/') as link (link.href)}
						<li>
							<a href={resolve(link.href)} class="text-sm text-white/70 transition-colors hover:text-white">
								{link.label}
							</a>
						</li>
					{/each}
					<li>
						<a href={resolve('/quote')} class="text-sm text-amber-500 transition-colors hover:text-amber-400">
							Get a Quote
						</a>
					</li>
				</ul>
			</nav>

			<div class="lg:col-span-2">
				<h2 class="eyebrow text-amber-500">Contact</h2>
				<ul class="mt-6 space-y-3.5 text-sm text-white/70">
					<li>
						<a href={COMPANY.phoneHref} class="transition-colors hover:text-white">{COMPANY.phone}</a>
					</li>
					<li>
						<a
							href={COMPANY.mapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="transition-colors hover:text-white"
						>
							{COMPANY.address}<br />{COMPANY.city}
						</a>
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-20 border-t border-white/10 pt-8">
			<p
				class="display select-none text-[clamp(2.4rem,8.6vw,8.25rem)] leading-[0.85] whitespace-nowrap text-white/[0.06]"
				aria-hidden="true"
			>
				Meridian 3PL
			</p>
			<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="font-mono text-[11px] tracking-wider text-white/35">
					© {year} Meridian 3PL. All rights reserved.
				</p>
				<p class="font-mono text-[11px] tracking-wider text-white/35">
					Proudly operated from Derrimut, Melbourne
				</p>
			</div>
		</div>
	</div>
</footer>
