<script lang="ts">
	import { page } from '$app/state';

	let { children, data } = $props();

	const pathname = $derived(page.url.pathname);
	const bare = $derived(pathname === '/admin/login' || pathname === '/admin/setup');

	const NAV = [
		{ href: '/admin', label: 'Dashboard', exact: true },
		{ href: '/admin/quotes', label: 'Quote Requests' },
		{ href: '/admin/messages', label: 'Messages' },
		{ href: '/admin/pricing', label: 'Pricing' },
		{ href: '/admin/settings', label: 'Settings' }
	];

	function active(href: string, exact = false) {
		return exact ? pathname === href : pathname.startsWith(href);
	}
</script>

{#if bare}
	<div class="grain min-h-svh bg-navy-950 text-white">
		{@render children()}
	</div>
{:else}
	<div class="flex min-h-svh bg-bone-100 text-navy-950">
		<!-- Sidebar -->
		<aside class="no-print sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-navy-950/10 bg-navy-950 text-white lg:flex">
			<div class="flex h-20 items-center gap-3 border-b border-white/10 px-6">
				<img src="/logo/meridian-3pl-white-logo.webp" alt="Meridian 3PL" class="h-9 w-auto" />
				<span class="eyebrow text-amber-500">Admin</span>
			</div>
			<nav class="flex-1 space-y-1 px-3 py-6">
				{#each NAV as item (item.href)}
					<a
						href={item.href}
						class={[
							'block rounded px-3 py-2.5 font-mono text-xs tracking-[0.14em] uppercase transition-colors',
							active(item.href, item.exact)
								? 'bg-amber-500 text-navy-950'
								: 'text-white/65 hover:bg-white/5 hover:text-white'
						]}
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<div class="border-t border-white/10 p-4">
				<p class="truncate text-sm text-white/80">{data.user?.name}</p>
				<p class="truncate font-mono text-[11px] text-white/40">{data.user?.email}</p>
				<form method="POST" action="/admin/signout">
					<button
						type="submit"
						class="btn-label mt-3 w-full border border-white/20 py-2.5 text-white/80 transition-colors hover:border-white hover:text-white"
					>
						Sign out
					</button>
				</form>
			</div>
		</aside>

		<!-- Main -->
		<div class="flex min-w-0 flex-1 flex-col">
			<header class="no-print flex h-16 items-center justify-between border-b border-navy-950/10 bg-bone-50 px-5 lg:px-8">
				<div class="flex items-center gap-3 lg:hidden">
					<img src="/logo/meridian-3pl-logo.webp" alt="Meridian 3PL" class="h-8 w-auto" />
					<span class="eyebrow text-amber-600">Admin</span>
				</div>
				<nav class="flex gap-1 overflow-x-auto lg:hidden">
					{#each NAV as item (item.href)}
						<a
							href={item.href}
							class={[
								'shrink-0 px-2.5 py-2 font-mono text-[10px] tracking-[0.1em] uppercase',
								active(item.href, item.exact) ? 'text-amber-600' : 'text-navy-950/55'
							]}
						>
							{item.label}
						</a>
					{/each}
				</nav>
				<a href="/" target="_blank" class="btn-label hidden text-navy-950/55 transition-colors hover:text-navy-950 lg:block">
					View site ↗
				</a>
			</header>

			<main class="flex-1 p-5 lg:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
