<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { NAV_LINKS, COMPANY } from '$lib/data';

	let scrollY = $state(0);
	let menuOpen = $state(false);

	const scrolled = $derived(scrollY > 24);
	/** Light chrome (navy text/logo) when scrolled; white chrome over dark heroes at top. */
	const light = $derived(scrolled && !menuOpen);
	const pathname = $derived(page.url.pathname);

	afterNavigate(() => {
		menuOpen = false;
	});

	$effect(() => {
		if (!menuOpen) return;
		document.documentElement.classList.add('overflow-hidden');
		return () => document.documentElement.classList.remove('overflow-hidden');
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') menuOpen = false;
	}

	function isActive(href: string): boolean {
		return href === '/' ? pathname === '/' : pathname.startsWith(href);
	}
</script>

<svelte:window bind:scrollY onkeydown={onKeydown} />

<header
	class={[
		'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500',
		light
			? 'border-b border-navy-950/10 bg-bone-50/90 shadow-[0_1px_30px_rgb(7_10_38/0.06)] backdrop-blur-md'
			: 'border-b border-transparent bg-transparent'
	]}
>
	<div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-24">
		<a href={resolve('/')} class="relative z-50 flex items-center gap-3" aria-label="Meridian 3PL — home">
			<img
				src={light ? '/logo/meridian-3pl-logo.webp' : '/logo/meridian-3pl-white-logo.webp'}
				alt="Meridian 3PL"
				class="h-12 w-auto lg:h-14"
				width="430"
				height="376"
			/>
		</a>

		<nav class="hidden items-center gap-9 lg:flex" aria-label="Primary">
			{#each NAV_LINKS as link (link.href)}
				<a
					href={resolve(link.href)}
					class={[
						'group relative font-mono text-[11px] font-medium tracking-[0.24em] uppercase transition-colors duration-300',
						light ? 'text-navy-900 hover:text-navy-700' : 'text-white/85 hover:text-white',
						isActive(link.href) && 'text-amber-500!'
					]}
					aria-current={isActive(link.href) ? 'page' : undefined}
				>
					{link.label}
					<span
						class={[
							'absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-amber-500 transition-transform duration-300 ease-out group-hover:scale-x-100',
							isActive(link.href) && 'scale-x-100'
						]}
					></span>
				</a>
			{/each}
			<a
				href={resolve('/quote')}
				class="btn-label group relative ml-2 inline-flex items-center gap-2 overflow-hidden bg-amber-500 px-6 py-3.5 text-navy-950 transition-colors duration-300 hover:bg-amber-400"
			>
				Get a Quote
				<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
					<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
				</svg>
			</a>
		</nav>

		<button
			type="button"
			class={[
				'relative z-50 -mr-2 flex h-12 w-12 items-center justify-center lg:hidden',
				menuOpen || !light ? 'text-white' : 'text-navy-950'
			]}
			aria-expanded={menuOpen}
			aria-controls="mobile-menu"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span class="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
			<span class="relative block h-3.5 w-7" aria-hidden="true">
				<span
					class={[
						'absolute left-0 top-0 h-0.5 w-full bg-current transition-transform duration-300',
						menuOpen && 'translate-y-[6.5px] rotate-45'
					]}
				></span>
				<span
					class={[
						'absolute bottom-0 left-0 h-0.5 w-full bg-current transition-[transform,opacity] duration-300',
						menuOpen && '-translate-y-[6.5px] -rotate-45'
					]}
				></span>
			</span>
		</button>
	</div>
</header>

{#if menuOpen}
	<div
		id="mobile-menu"
		class="grain meridian-grid fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-navy-950 px-5 pt-32 pb-10 sm:px-8 lg:hidden"
		role="dialog"
		aria-modal="true"
		aria-label="Site menu"
		transition:fade={{ duration: 250 }}
	>
		<nav aria-label="Mobile">
			<ul class="space-y-1">
				{#each NAV_LINKS as link, i (link.href)}
					<li in:fly={{ y: 28, duration: 500, delay: 80 + i * 60, easing: quintOut }}>
						<a
							href={resolve(link.href)}
							class="group flex items-baseline gap-4 py-2.5"
							aria-current={isActive(link.href) ? 'page' : undefined}
						>
							<span class="eyebrow text-amber-500">0{i + 1}</span>
							<span
								class={[
									'display text-4xl sm:text-5xl',
									isActive(link.href) ? 'text-amber-500' : 'text-white group-hover:text-amber-500'
								]}
							>
								{link.label}
							</span>
						</a>
					</li>
				{/each}
				<li in:fly={{ y: 28, duration: 500, delay: 80 + NAV_LINKS.length * 60, easing: quintOut }}>
					<a href={resolve('/quote')} class="group flex items-baseline gap-4 py-2.5">
						<span class="eyebrow text-amber-500">0{NAV_LINKS.length + 1}</span>
						<span class="display text-4xl text-amber-500 sm:text-5xl">Get a Quote</span>
					</a>
				</li>
			</ul>
		</nav>

		<div
			class="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6"
			in:fade={{ duration: 400, delay: 450 }}
		>
			<a href={COMPANY.phoneHref} class="font-mono text-sm text-white/70 hover:text-white">{COMPANY.phone}</a>
			<p class="font-mono text-xs text-white/40">{COMPANY.address} · {COMPANY.city}</p>
			<p class="eyebrow mt-2 text-white/30">{COMPANY.coordinates}</p>
		</div>
	</div>
{/if}
