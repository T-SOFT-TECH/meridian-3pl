<script lang="ts">
	import { base } from '$app/paths';
	import { QUOTE_STATUSES, quoteStatusMeta, fmtDateShort } from '$lib/admin/format';

	let { data } = $props();

	function qs(params: Record<string, string | number>) {
		const sp = new URLSearchParams();
		const merged = { status: data.filters.status, q: data.filters.q, ...params };
		for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, String(v));
		const s = sp.toString();
		return `${base}/admin/quotes${s ? `?${s}` : ''}`;
	}
</script>

<svelte:head><title>Quote Requests — Meridian 3PL Admin</title></svelte:head>

<div class="w-full">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="eyebrow text-amber-600">Quote requests</p>
			<h1 class="display mt-3 text-3xl text-navy-950 sm:text-4xl">
				Lead <span class="serif-accent text-navy-700">pipeline</span>
			</h1>
		</div>
		<a
			href={`${base}/admin/quotes/export${data.filters.status || data.filters.q ? '?' + new URLSearchParams({ ...(data.filters.status ? { status: data.filters.status } : {}), ...(data.filters.q ? { q: data.filters.q } : {}) }).toString() : ''}`}
			class="btn-label border border-navy-950/20 px-5 py-3 text-navy-950/70 transition-colors hover:border-navy-700 hover:text-navy-950"
		>
			Export CSV
		</a>
	</div>

	<!-- Filters -->
	<div class="mt-8 flex flex-wrap items-center gap-2">
		<a
			href={qs({ status: '', page: 1 })}
			class={[
				'border px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors',
				!data.filters.status ? 'border-navy-700 bg-navy-700 text-white' : 'border-navy-950/15 text-navy-950/60 hover:border-navy-950/40'
			]}
		>
			All ({data.all})
		</a>
		{#each QUOTE_STATUSES as s (s.value)}
			<a
				href={qs({ status: s.value, page: 1 })}
				class={[
					'border px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors',
					data.filters.status === s.value ? 'border-navy-700 bg-navy-700 text-white' : 'border-navy-950/15 text-navy-950/60 hover:border-navy-950/40'
				]}
			>
				{s.label} ({data.statusCounts[s.value] ?? 0})
			</a>
		{/each}
	</div>

	<form method="GET" action={`${base}/admin/quotes`} class="mt-4 flex gap-2">
		{#if data.filters.status}<input type="hidden" name="status" value={data.filters.status} />{/if}
		<input
			type="search"
			name="q"
			value={data.filters.q}
			placeholder="Search company, contact, email, reference…"
			class="w-full max-w-md border-navy-950/20 bg-white px-4 py-2.5 text-sm focus:border-navy-700 focus:ring-1 focus:ring-navy-700"
		/>
		<button type="submit" class="btn-label bg-navy-700 px-5 py-2.5 text-white transition-colors hover:bg-navy-950">Search</button>
	</form>

	<!-- Table -->
	<div class="mt-6 overflow-x-auto border border-navy-950/10 bg-bone-50">
		<table class="w-full min-w-[760px] text-sm">
			<thead>
				<tr class="border-b border-navy-950/10 bg-bone-100 text-left">
					{#each ['Reference', 'Company', 'Contact', 'Industry', 'Volume', 'Status', 'Received'] as h (h)}
						<th class="px-4 py-3 font-mono text-[10px] tracking-[0.14em] text-navy-950/50 uppercase">{h}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data.rows as row (row.id)}
					<tr class="group border-b border-navy-950/5 transition-colors hover:bg-bone-100">
						<td class="px-4 py-3">
							<a href={`${base}/admin/quotes/${row.id}`} class="font-mono text-xs font-medium text-navy-700 group-hover:text-amber-600">
								{row.reference}
							</a>
						</td>
						<td class="px-4 py-3">
							<a href={`${base}/admin/quotes/${row.id}`} class="font-medium text-navy-950">{row.company}</a>
						</td>
						<td class="px-4 py-3 text-navy-950/70">{row.contactName}</td>
						<td class="px-4 py-3 text-navy-950/60">{row.industry ?? '—'}</td>
						<td class="px-4 py-3 text-navy-950/60">{row.orderVolume ?? '—'}</td>
						<td class="px-4 py-3">
							<span class={['inline-block px-2.5 py-1 font-mono text-[10px] tracking-wide uppercase', quoteStatusMeta(row.status).badge]}>
								{quoteStatusMeta(row.status).label}
							</span>
						</td>
						<td class="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-navy-950/45">{fmtDateShort(row.createdAt)}</td>
					</tr>
				{:else}
					<tr><td colspan="7" class="px-4 py-16 text-center text-sm text-navy-950/45">No quote requests {data.filters.q || data.filters.status ? 'match your filters' : 'yet'}.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if data.totalPages > 1}
		<div class="mt-6 flex items-center justify-between">
			<p class="font-mono text-[11px] text-navy-950/50">Page {data.page} of {data.totalPages} · {data.total} total</p>
			<div class="flex gap-2">
				{#if data.page > 1}
					<a href={qs({ page: data.page - 1 })} class="btn-label border border-navy-950/20 px-4 py-2 text-navy-950/70 hover:border-navy-700">Prev</a>
				{/if}
				{#if data.page < data.totalPages}
					<a href={qs({ page: data.page + 1 })} class="btn-label border border-navy-950/20 px-4 py-2 text-navy-950/70 hover:border-navy-700">Next</a>
				{/if}
			</div>
		</div>
	{/if}
</div>
