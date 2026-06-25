<script lang="ts">
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';
	import { QUOTE_STATUSES, quoteStatusMeta, fmtDate } from '$lib/admin/format';
	import type { CalcResult } from '$lib/pricing/types';

	let { data } = $props();
	const quote = $derived(data.quote);

	const services = $derived((quote.services as string[] | null) ?? []);
	const channels = $derived((quote.channels as string[] | null) ?? []);
	const estimate = $derived(quote.estimate as CalcResult | null);

	const aud = (n: number, dp = 2) =>
		new Intl.NumberFormat('en-AU', {
			style: 'currency',
			currency: 'AUD',
			minimumFractionDigits: dp,
			maximumFractionDigits: dp
		}).format(n);
	const audWhole = (n: number) => aud(n, Number.isInteger(n) ? 0 : 2);

	const detailRows = $derived(
		[
			['Email', quote.email],
			['Phone', quote.phone],
			['Website', quote.website],
			['Industry', quote.industry],
			['Order volume', quote.orderVolume],
			['SKUs', quote.skuCount],
			['Storage', quote.storage],
			['Current setup', quote.currentSetup],
			['Timeline', quote.timeline]
		].filter(([, v]) => v) as [string, string][]
	);

	const mailto = $derived(
		`mailto:${quote.email}?subject=${encodeURIComponent(`Your Meridian 3PL quote — ${quote.reference}`)}`
	);
</script>

<svelte:head><title>{quote.reference} — Meridian 3PL Admin</title></svelte:head>

<div class="w-full">
	<a href={`${base}/admin/quotes`} class="btn-label no-print text-navy-950/50 transition-colors hover:text-navy-950">← Back to pipeline</a>

	<div class="mt-5 flex flex-wrap items-start justify-between gap-4">
		<div>
			<div class="flex items-center gap-3">
				<span class="font-mono text-sm font-medium text-navy-700">{quote.reference}</span>
				<span class={['inline-block px-2.5 py-1 font-mono text-[10px] tracking-wide uppercase', quoteStatusMeta(quote.status).badge]}>
					{quoteStatusMeta(quote.status).label}
				</span>
			</div>
			<h1 class="display mt-3 text-3xl text-navy-950">{quote.company}</h1>
			<p class="mt-1 text-navy-950/60">{quote.contactName} · received {fmtDate(quote.createdAt)}</p>
		</div>
		<div class="no-print flex gap-2">
			<a href={mailto} class="btn-label border border-navy-950/20 px-4 py-2.5 text-navy-950/70 transition-colors hover:border-navy-700 hover:text-navy-950">Email</a>
			<button type="button" onclick={() => window.print()} class="btn-label bg-navy-700 px-4 py-2.5 text-white transition-colors hover:bg-navy-950">Print / PDF</button>
		</div>
	</div>

	<div class="mt-8 grid gap-6 lg:grid-cols-3">
		<!-- Details -->
		<div class="lg:col-span-2">
			<div class="border border-navy-950/10 bg-bone-50 p-6">
				<h2 class="eyebrow text-navy-950/45">Submission</h2>
				<dl class="mt-4 divide-y divide-navy-950/5">
					{#each detailRows as [label, value] (label)}
						<div class="flex gap-4 py-2.5">
							<dt class="w-36 shrink-0 font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">{label}</dt>
							<dd class="text-sm text-navy-950">{value}</dd>
						</div>
					{/each}
				</dl>

				{#if services.length}
					<div class="mt-5">
						<p class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">Services</p>
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each services as s (s)}<span class="border border-navy-700/30 bg-navy-700/5 px-2.5 py-1 font-mono text-[11px] text-navy-700">{s}</span>{/each}
						</div>
					</div>
				{/if}
				{#if channels.length}
					<div class="mt-4">
						<p class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">Channels</p>
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each channels as c (c)}<span class="border border-navy-950/15 px-2.5 py-1 font-mono text-[11px] text-navy-950/70">{c}</span>{/each}
						</div>
					</div>
				{/if}
				{#if quote.message}
					<div class="mt-5">
						<p class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">Notes from prospect</p>
						<p class="mt-2 border-l-2 border-amber-500 pl-4 text-sm leading-relaxed text-navy-950/80">{quote.message}</p>
					</div>
				{/if}
			</div>

			{#if estimate}
				<div class="mt-6 border border-navy-950/10 bg-navy-950 p-6 text-white">
					<div class="flex items-center justify-between">
						<h2 class="eyebrow text-amber-500">Estimate · calculator</h2>
						<span class="font-mono text-[10px] tracking-wide text-white/40 uppercase">AUD · ex-GST</span>
					</div>
					{#if estimate.custom}
						<p class="mt-4 text-sm text-white/70">Custom pricing — volumes beyond standard tiers.</p>
						<ul class="mt-2 space-y-1">
							{#each estimate.notes as n (n)}<li class="font-mono text-[11px] text-amber-300/80">{n}</li>{/each}
						</ul>
					{:else}
						<div class="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
							<span class="display text-3xl text-white">{audWhole(estimate.monthlyTotal)}<span class="text-base text-white/40"> /mo</span></span>
							<span class="display text-2xl text-amber-500">{aud(estimate.perOrderTotal)}<span class="text-xs text-white/40"> /order</span></span>
						</div>
						<ul class="mt-5 space-y-2">
							{#each estimate.lines as line (line.key)}
								<li class="flex items-baseline justify-between gap-3 text-sm">
									<span class="text-white/55">{line.label}</span>
									<span class="flex items-baseline gap-2">
										<span class="font-mono text-[10px] text-white/30">{aud(line.perOrder)}/o</span>
										<span class="font-mono text-white/85 tabular-nums">{audWhole(line.monthly)}</span>
									</span>
								</li>
							{/each}
						</ul>
						{#if estimate.oneOffSetup > 0}
							<p class="mt-3 border-t border-white/10 pt-3 font-mono text-[11px] text-white/45">+ {audWhole(estimate.oneOffSetup)} one-off SKU setup</p>
						{/if}
					{/if}
				</div>
			{/if}

			<!-- Internal notes -->
			<div class="no-print mt-6 border border-navy-950/10 bg-bone-50 p-6">
				<h2 class="eyebrow text-navy-950/45">Internal notes</h2>
				<form method="POST" action="?/note" use:enhance class="mt-4 flex gap-2">
					<input name="body" placeholder="Add a follow-up note…" class="w-full border-navy-950/20 bg-white px-4 py-2.5 text-sm focus:border-navy-700 focus:ring-1 focus:ring-navy-700" />
					<button type="submit" class="btn-label bg-navy-700 px-4 py-2.5 text-white transition-colors hover:bg-navy-950">Add</button>
				</form>
				<ul class="mt-5 space-y-3">
					{#each data.notes as note (note.id)}
						<li class="border-l-2 border-navy-950/15 pl-4">
							<p class="text-sm text-navy-950/85">{note.body}</p>
							<p class="mt-1 font-mono text-[10px] tracking-wide text-navy-950/40">{note.authorName ?? 'Staff'} · {fmtDate(note.createdAt)}</p>
						</li>
					{:else}
						<li class="text-sm text-navy-950/40">No notes yet.</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Actions sidebar -->
		<div class="no-print space-y-6">
			<div class="border border-navy-950/10 bg-bone-50 p-6">
				<h2 class="eyebrow text-navy-950/45">Status</h2>
				<form method="POST" action="?/status" use:enhance class="mt-4 space-y-2">
					{#each QUOTE_STATUSES as s (s.value)}
						<button
							type="submit"
							name="status"
							value={s.value}
							class={[
								'block w-full px-3 py-2.5 text-left font-mono text-[11px] tracking-wide uppercase transition-colors',
								quote.status === s.value ? s.badge : 'border border-navy-950/15 text-navy-950/60 hover:border-navy-700'
							]}
						>
							{s.label}
						</button>
					{/each}
				</form>
			</div>

			<div class="border border-navy-950/10 bg-bone-50 p-6">
				<h2 class="eyebrow text-navy-950/45">Assigned to</h2>
				<form method="POST" action="?/assign" use:enhance class="mt-4 space-y-2">
					<select name="assignedTo" class="w-full border-navy-950/20 bg-white px-3 py-2.5 text-sm focus:border-navy-700 focus:ring-1 focus:ring-navy-700">
						<option value="" selected={!quote.assignedTo}>Unassigned</option>
						{#each data.staff as member (member.id)}
							<option value={member.id} selected={quote.assignedTo === member.id}>{member.name}</option>
						{/each}
					</select>
					<button type="submit" class="btn-label w-full bg-navy-700 py-2.5 text-white transition-colors hover:bg-navy-950">Save</button>
				</form>
			</div>
		</div>
	</div>
</div>
