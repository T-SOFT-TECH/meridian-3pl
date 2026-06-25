<script lang="ts">
	import { base } from '$app/paths';
	import { quoteStatusMeta, messageStatusMeta, fmtDateShort } from '$lib/admin/format';
	import Donut from '$lib/components/admin/charts/Donut.svelte';
	import BarChart from '$lib/components/admin/charts/BarChart.svelte';
	import HBarList from '$lib/components/admin/charts/HBarList.svelte';

	let { data } = $props();

	const aud = (n: number) =>
		new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n);

	const cards = $derived([
		{ label: 'Quote requests', value: String(data.stats.quotesTotal), sub: `${data.stats.quotesNew} new`, href: '/admin/quotes' },
		{ label: 'Pipeline value', value: aud(data.stats.pipelineValue), sub: 'active monthly est.', href: '/admin/quotes' },
		{ label: 'Conversion', value: `${data.stats.conversionRate}%`, sub: `${data.stats.won} won · ${data.stats.lost} lost`, href: '/admin/quotes?status=won' },
		{ label: 'Messages', value: String(data.stats.messagesTotal), sub: `${data.stats.messagesUnread} unread`, href: '/admin/messages' }
	]);

	const statusData = $derived([
		{ label: 'New', value: data.statusCounts.new, color: '#f5a623' },
		{ label: 'Contacted', value: data.statusCounts.contacted, color: '#6b73cd' },
		{ label: 'Quoted', value: data.statusCounts.quoted, color: '#1a1f6e' },
		{ label: 'Won', value: data.statusCounts.won, color: '#16a34a' },
		{ label: 'Lost', value: data.statusCounts.lost, color: '#c0c4ec' }
	]);

	const sourceData = $derived([
		{ label: 'Calculator', value: data.sourceCounts.calculator, color: '#f5a623' },
		{ label: 'Quote form', value: data.sourceCounts.quote_form, color: '#1a1f6e' }
	]);

	const card = 'border border-navy-950/10 bg-bone-50 p-6';
</script>

<svelte:head><title>Dashboard — Meridian 3PL Admin</title></svelte:head>

<div class="w-full">
	<p class="eyebrow text-amber-600">Dashboard</p>
	<h1 class="display mt-3 text-3xl text-navy-950 sm:text-4xl">
		Operations <span class="serif-accent text-navy-700">overview</span>
	</h1>

	<!-- KPI cards -->
	<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each cards as c (c.label)}
			<a href={`${base}${c.href}`} class="group {card} transition-colors hover:border-navy-700">
				<p class="eyebrow text-navy-950/45">{c.label}</p>
				<p class="display mt-4 text-4xl text-navy-700">{c.value}</p>
				<p class="mt-2 font-mono text-[11px] tracking-wide text-navy-950/45">{c.sub}</p>
			</a>
		{/each}
	</div>

	<!-- Charts: trend + status -->
	<div class="mt-6 grid gap-5 lg:grid-cols-3">
		<section class="{card} lg:col-span-2">
			<div class="flex items-center justify-between">
				<h2 class="eyebrow text-navy-950/45">Quote requests</h2>
				<span class="font-mono text-[10px] tracking-wide text-navy-950/35 uppercase">Last 8 weeks</span>
			</div>
			<div class="mt-6">
				<BarChart data={data.weekly} unit=" quotes" />
			</div>
		</section>

		<section class={card}>
			<h2 class="eyebrow text-navy-950/45">Pipeline by status</h2>
			<div class="mt-6">
				<Donut data={statusData} centerLabel="quotes" />
			</div>
		</section>
	</div>

	<!-- Charts: industries + source -->
	<div class="mt-5 grid gap-5 lg:grid-cols-3">
		<section class="{card} lg:col-span-2">
			<h2 class="eyebrow text-navy-950/45">Top industries</h2>
			<div class="mt-6">
				<HBarList data={data.industryTop} empty="No industry data yet — calculator leads don't capture industry." />
			</div>
		</section>

		<section class={card}>
			<h2 class="eyebrow text-navy-950/45">Lead source</h2>
			<div class="mt-6">
				<Donut data={sourceData} centerLabel="leads" size={150} />
			</div>
		</section>
	</div>

	<!-- Recent activity -->
	<div class="mt-8 grid gap-8 lg:grid-cols-2">
		<section>
			<div class="flex items-center justify-between">
				<h2 class="eyebrow text-navy-950/45">Recent quote requests</h2>
				<a href={`${base}/admin/quotes`} class="btn-label text-navy-700 hover:text-amber-600">View all</a>
			</div>
			<ul class="mt-4 divide-y divide-navy-950/8 border border-navy-950/10 bg-bone-50">
				{#each data.recentQuotes as q (q.id)}
					<li>
						<a href={`${base}/admin/quotes/${q.id}`} class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bone-100">
							<span class={['shrink-0 px-2 py-0.5 font-mono text-[9px] tracking-wide uppercase', quoteStatusMeta(q.status).badge]}>{quoteStatusMeta(q.status).label}</span>
							<span class="min-w-0 flex-1 truncate text-sm text-navy-950">{q.company}</span>
							<span class="shrink-0 font-mono text-[10px] text-navy-950/40">{fmtDateShort(q.createdAt)}</span>
						</a>
					</li>
				{:else}
					<li class="px-4 py-10 text-center text-sm text-navy-950/45">No quote requests yet.</li>
				{/each}
			</ul>
		</section>

		<section>
			<div class="flex items-center justify-between">
				<h2 class="eyebrow text-navy-950/45">Recent messages</h2>
				<a href={`${base}/admin/messages`} class="btn-label text-navy-700 hover:text-amber-600">View all</a>
			</div>
			<ul class="mt-4 divide-y divide-navy-950/8 border border-navy-950/10 bg-bone-50">
				{#each data.recentMessages as m (m.id)}
					<li>
						<a href={`${base}/admin/messages/${m.id}`} class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bone-100">
							<span class={['shrink-0 px-2 py-0.5 font-mono text-[9px] tracking-wide uppercase', messageStatusMeta(m.status).badge]}>{messageStatusMeta(m.status).label}</span>
							<span class="min-w-0 flex-1 truncate text-sm text-navy-950">{m.name}</span>
							<span class="shrink-0 font-mono text-[10px] text-navy-950/40">{fmtDateShort(m.createdAt)}</span>
						</a>
					</li>
				{:else}
					<li class="px-4 py-10 text-center text-sm text-navy-950/45">No messages yet.</li>
				{/each}
			</ul>
		</section>
	</div>
</div>
