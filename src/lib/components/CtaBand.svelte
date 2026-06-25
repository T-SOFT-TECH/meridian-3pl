<script lang="ts">
	import { resolve } from '$app/paths';
	import { COMPANY } from '$lib/data';
	import { reveal } from '$lib/motion';

	interface Props {
		title?: string;
		accent?: string;
		description?: string;
	}

	let {
		title = 'Ready to move',
		accent = 'forward?',
		description = 'Tell us about your operation and receive a tailored logistics proposal — typically within one business day.'
	}: Props = $props();
</script>

<section class="grain relative overflow-hidden bg-navy-700">
	<!-- Compass watermark -->
	<svg
		class="pointer-events-none absolute -right-24 -bottom-32 h-[28rem] w-[28rem] text-white/[0.05] motion-safe:animate-spin-slow"
		viewBox="0 0 100 100"
		fill="none"
		aria-hidden="true"
	>
		<circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="0.5" />
		<circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width="0.5" />
		<path d="M50 2v16M50 82v16M2 50h16M82 50h16" stroke="currentColor" stroke-width="1" />
		<path d="M50 22 58 50 50 78 42 50Z" fill="currentColor" />
	</svg>

	<div
		class="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-10 px-5 py-24 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-32"
		{@attach reveal({ targets: '[data-reveal]' })}
	>
		<div class="max-w-2xl">
			<p data-reveal class="eyebrow text-amber-500">Get started</p>
			<h2 data-reveal class="display mt-5 text-4xl text-white sm:text-5xl lg:text-6xl">
				{title} <span class="serif-accent text-amber-500">{accent}</span>
			</h2>
			<p data-reveal class="mt-6 max-w-xl text-base leading-relaxed text-white/65">
				{description}
			</p>
		</div>
		<div data-reveal class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
			<a
				href={resolve('/quote')}
				class="btn-label group inline-flex items-center gap-3 bg-amber-500 px-8 py-5 text-navy-950 transition-all duration-300 hover:bg-amber-400"
			>
				Get a Quote
				<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
					<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
				</svg>
			</a>
			<a
				href={COMPANY.phoneHref}
				class="btn-label inline-flex items-center gap-3 border border-white/25 px-8 py-5 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-navy-950"
			>
				{COMPANY.phone}
			</a>
		</div>
	</div>
</section>
