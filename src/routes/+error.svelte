<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';

	const is404 = $derived(page.status === 404);
	const accent = $derived(is404 ? 'off the map.' : 'off course.');
	const message = $derived(
		page.error?.message ||
			(is404
				? 'The page you’re looking for has moved or never existed.'
				: 'Something went wrong on our end. Please try again.')
	);
</script>

<svelte:head><title>{page.status} — Meridian 3PL</title></svelte:head>

<section
	class="grain meridian-grid relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-navy-950 px-5 py-32 text-center text-white"
>
	<p class="eyebrow relative z-10 text-amber-500">Error {page.status}</p>
	<h1 class="display relative z-10 mt-6 text-[clamp(5rem,22vw,16rem)] leading-[0.85]">
		{page.status}
	</h1>
	<p class="serif-accent relative z-10 -mt-3 text-3xl text-amber-500 sm:text-4xl">{accent}</p>
	<p class="relative z-10 mt-6 max-w-md leading-relaxed text-white/65">{message}</p>

	<div class="relative z-10 mt-10 flex flex-col gap-3 sm:flex-row">
		<a
			href={`${base}/`}
			class="btn-label inline-flex items-center justify-center bg-amber-500 px-8 py-4 text-navy-950 transition-colors hover:bg-amber-400"
		>
			Back to home
		</a>
		<a
			href={`${base}/contact`}
			class="btn-label inline-flex items-center justify-center border border-white/25 px-8 py-4 text-white transition-colors hover:border-white hover:bg-white hover:text-navy-950"
		>
			Contact us
		</a>
	</div>
</section>
