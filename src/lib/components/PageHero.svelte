<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/motion';

	interface Props {
		eyebrow: string;
		description?: string;
		children: Snippet;
	}

	let { eyebrow, description, children }: Props = $props();
</script>

<section class="grain meridian-grid relative overflow-hidden bg-navy-950 text-white">
	<!-- Vertical meridian rule -->
	<div class="pointer-events-none absolute inset-y-0 left-5 w-px bg-white/10 sm:left-8 lg:left-1/2" aria-hidden="true"></div>

	<div
		class="relative z-10 mx-auto max-w-7xl px-5 pt-40 pb-20 sm:px-8 lg:pt-52 lg:pb-28"
		{@attach reveal({ targets: '[data-reveal]', immediate: true, delay: 0.15 })}
	>
		<p data-reveal class="eyebrow text-amber-500">{eyebrow}</p>
		<h1 data-reveal class="display mt-6 max-w-5xl text-5xl text-balance sm:text-6xl lg:text-7xl xl:text-8xl">
			{@render children()}
		</h1>
		{#if description}
			<p data-reveal class="mt-8 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
				{description}
			</p>
		{/if}
	</div>
</section>
