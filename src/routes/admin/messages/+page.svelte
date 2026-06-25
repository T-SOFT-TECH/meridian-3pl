<script lang="ts">
	import { base } from '$app/paths';
	import { MESSAGE_STATUSES, messageStatusMeta, fmtDateShort } from '$lib/admin/format';

	let { data } = $props();

	function qs(params: Record<string, string | number>) {
		const sp = new URLSearchParams();
		const merged = { status: data.filters.status, q: data.filters.q, ...params };
		for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, String(v));
		const s = sp.toString();
		return `${base}/admin/messages${s ? `?${s}` : ''}`;
	}

	const snippet = (m: string) => (m.length > 90 ? m.slice(0, 90) + '…' : m);
</script>

<svelte:head><title>Messages — Meridian 3PL Admin</title></svelte:head>

<div class="w-full">
	<p class="eyebrow text-amber-600">Contact messages</p>
	<h1 class="display mt-3 text-3xl text-navy-950 sm:text-4xl">
		The <span class="serif-accent text-navy-700">inbox</span>
	</h1>

	<div class="mt-8 flex flex-wrap items-center gap-2">
		<a href={qs({ status: '', page: 1 })} class={['border px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors', !data.filters.status ? 'border-navy-700 bg-navy-700 text-white' : 'border-navy-950/15 text-navy-950/60 hover:border-navy-950/40']}>
			All ({data.all})
		</a>
		{#each MESSAGE_STATUSES as s (s.value)}
			<a href={qs({ status: s.value, page: 1 })} class={['border px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors', data.filters.status === s.value ? 'border-navy-700 bg-navy-700 text-white' : 'border-navy-950/15 text-navy-950/60 hover:border-navy-950/40']}>
				{s.label} ({data.statusCounts[s.value] ?? 0})
			</a>
		{/each}
	</div>

	<form method="GET" action={`${base}/admin/messages`} class="mt-4 flex gap-2">
		{#if data.filters.status}<input type="hidden" name="status" value={data.filters.status} />{/if}
		<input type="search" name="q" value={data.filters.q} placeholder="Search name, email, message…" class="w-full max-w-md border-navy-950/20 bg-white px-4 py-2.5 text-sm focus:border-navy-700 focus:ring-1 focus:ring-navy-700" />
		<button type="submit" class="btn-label bg-navy-700 px-5 py-2.5 text-white transition-colors hover:bg-navy-950">Search</button>
	</form>

	<div class="mt-6 divide-y divide-navy-950/8 border border-navy-950/10 bg-bone-50">
		{#each data.rows as m (m.id)}
			<a href={`${base}/admin/messages/${m.id}`} class="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bone-100">
				<span class={['shrink-0 px-2.5 py-1 font-mono text-[10px] tracking-wide uppercase', messageStatusMeta(m.status).badge]}>{messageStatusMeta(m.status).label}</span>
				<div class="min-w-0 flex-1">
					<p class={['truncate text-sm', m.status === 'unread' ? 'font-semibold text-navy-950' : 'text-navy-950/85']}>{m.name} <span class="font-normal text-navy-950/45">· {m.email}</span></p>
					<p class="truncate text-sm text-navy-950/55">{snippet(m.message)}</p>
				</div>
				<span class="shrink-0 font-mono text-[11px] text-navy-950/40">{fmtDateShort(m.createdAt)}</span>
			</a>
		{:else}
			<p class="px-5 py-16 text-center text-sm text-navy-950/45">No messages {data.filters.q || data.filters.status ? 'match your filters' : 'yet'}.</p>
		{/each}
	</div>

	{#if data.totalPages > 1}
		<div class="mt-6 flex items-center justify-between">
			<p class="font-mono text-[11px] text-navy-950/50">Page {data.page} of {data.totalPages} · {data.total} total</p>
			<div class="flex gap-2">
				{#if data.page > 1}<a href={qs({ page: data.page - 1 })} class="btn-label border border-navy-950/20 px-4 py-2 text-navy-950/70 hover:border-navy-700">Prev</a>{/if}
				{#if data.page < data.totalPages}<a href={qs({ page: data.page + 1 })} class="btn-label border border-navy-950/20 px-4 py-2 text-navy-950/70 hover:border-navy-700">Next</a>{/if}
			</div>
		</div>
	{/if}
</div>
