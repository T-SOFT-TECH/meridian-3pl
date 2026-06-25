<script lang="ts">
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';
	import { fmtDate } from '$lib/admin/format';
	import { computeQuote } from '$lib/pricing/calculate';
	import { untrack } from 'svelte';
	import { slide } from 'svelte/transition';
	import { prefersReducedMotion } from '$lib/motion';
	import type { Band, CalcInputs, RateCard } from '$lib/pricing/types';

	let { data, form } = $props();

	// ── Editable rate card held in reactive state, cloned from the loaded config ──
	// `data.editing` is read once at mount; the whole editor is wrapped in a
	// {#key data.editingId} block below, so this component remounts (re-running this
	// initializer) whenever the admin loads a different version via ?edit=<id>.
	const card = $state<RateCard>(untrack(() => structuredClone(data.editing) as RateCard));

	// Stable ids let keyed {#each} rows animate (flip + fade) on add/remove. Bands
	// persisted before this editor had ids — and the seeded default — lack one, so
	// backfill any missing id once at mount.
	const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
	for (const b of card.storageBands) b.id ??= newId('band');
	for (const b of card.receivingBands) b.id ??= newId('band');
	for (const s of card.shippingBands) s.id ??= newId('ship');

	// Row add/remove timing; 0ms (no motion) when the user prefers reduced motion.
	// `slide` animates row height, so the row opens/closes and the surrounding card
	// grows/shrinks smoothly. (No `flip`: to reposition siblings it makes the leaving
	// row `position: absolute`, which collapses the card height instantly instead of
	// easing. These lists only add/remove — never reorder — so flip isn't needed.)
	const slideMs = prefersReducedMotion() ? 0 : 300;

	let note = $state('');

	// ── Field helpers ────────────────────────────────────────────────────────────
	const money = (n: number) =>
		new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);

	function addTier() {
		card.accountTiers.push({
			id: newId('tier'),
			label: 'New tier',
			maxOrders: null,
			fee: null
		});
	}
	function removeTier(i: number) {
		card.accountTiers.splice(i, 1);
	}

	function addBand(bands: Band[]) {
		const last = bands[bands.length - 1];
		const min = last ? (last.max ?? 0) + 1 : 1;
		bands.push({ id: newId('band'), min, max: null, rate: 0 });
	}
	function removeBand(bands: Band[], i: number) {
		bands.splice(i, 1);
	}

	function addShipping() {
		const last = card.shippingBands[card.shippingBands.length - 1];
		card.shippingBands.push({ id: newId('ship'), maxKg: last ? last.maxKg + 1 : 1, price: 0 });
	}
	function removeShipping(i: number) {
		card.shippingBands.splice(i, 1);
	}

	// Empty-string ⇄ null coercion for nullable numeric inputs (maxOrders / fee / band max)
	function nullableNum(v: string): number | null {
		const t = v.trim();
		if (t === '') return null;
		const n = Number(t);
		return Number.isFinite(n) ? n : null;
	}

	// ── Live preview: re-compute from current draft with a fixed sample input ─────
	const SAMPLE: CalcInputs = {
		ordersPerMonth: 600,
		itemsPerOrder: 1.8,
		palletsStored: 12,
		palletsReceived: 8,
		skuCount: 60,
		avgWeightKg: 1.2,
		extras: { returns: 30, relabel: 0, kitting: 0, urgent: 0, customPackaging: false }
	};
	const preview = $derived(computeQuote(SAMPLE, $state.snapshot(card)));

	// ── Lightweight client-side validation (server is authoritative) ─────────────
	const clientErrors = $derived.by(() => {
		const errs: string[] = [];
		if (card.accountTiers.length === 0) errs.push('Add at least one account tier.');

		const checkBands = (bands: Band[], name: string) => {
			for (let i = 0; i < bands.length; i++) {
				const b = bands[i];
				if (b.rate < 0) errs.push(`${name} band ${i + 1}: rate must be ≥ 0.`);
				if (i > 0) {
					const prev = bands[i - 1];
					if (prev.max === null) errs.push(`${name}: only the last band may be open-ended.`);
					else if (b.min !== prev.max + 1)
						errs.push(`${name} band ${i + 1}: min should be ${prev.max + 1}.`);
				}
				if (b.max !== null && b.max < b.min) errs.push(`${name} band ${i + 1}: max must be ≥ min.`);
			}
		};
		checkBands(card.storageBands, 'Storage');
		checkBands(card.receivingBands, 'Receiving');

		if (card.storageCustomAbove < 1) errs.push('Custom-above threshold must be ≥ 1.');
		if (card.skuSetupFee < 0) errs.push('SKU setup fee must be ≥ 0.');
		if (card.pickPack.firstItem < 0 || card.pickPack.additionalItem < 0)
			errs.push('Pick & pack fees must be ≥ 0.');

		let prevKg = -Infinity;
		for (let i = 0; i < card.shippingBands.length; i++) {
			const s = card.shippingBands[i];
			if (s.maxKg <= 0) errs.push(`Shipping band ${i + 1}: up-to-kg must be > 0.`);
			if (s.price < 0) errs.push(`Shipping band ${i + 1}: price must be ≥ 0.`);
			if (s.maxKg <= prevKg) errs.push(`Shipping band ${i + 1}: weights must ascend.`);
			prevKg = s.maxKg;
		}

		const ex = card.extras;
		if (ex.returns < 0 || ex.relabel < 0 || ex.kitting < 0 || ex.urgent < 0)
			errs.push('Extras rates must be ≥ 0.');
		return errs;
	});
	const canSave = $derived(clientErrors.length === 0);

	// Serialised payload submitted in the hidden `data` field of the save form
	const payload = $derived(JSON.stringify($state.snapshot(card)));

	const inputCls =
		'w-full border-navy-950/20 bg-white px-3 py-2 text-sm text-navy-950 focus:border-navy-700 focus:ring-1 focus:ring-navy-700';
	const thCls = 'px-3 py-2 text-left font-mono text-[10px] tracking-[0.12em] text-navy-950/50 uppercase';
</script>

<svelte:head><title>Pricing — Meridian 3PL Admin</title></svelte:head>

<div class="w-full">
	<!-- Header -->
	<p class="eyebrow text-amber-600">Pricing calculator</p>
	<h1 class="display mt-3 text-3xl text-navy-950 sm:text-4xl">
		Rate <span class="serif-accent text-navy-700">manager</span>
	</h1>
	<p class="mt-3 text-sm text-navy-950/60">
		Currently published:
		<span class="font-medium text-navy-950">v{data.published.version}</span>
		· effective {fmtDate(data.versions.find((v) => v.isPublished)?.effectiveFrom)}
		{#if data.versions.find((v) => v.isPublished)?.note}
			· <span class="text-navy-950/50">{data.versions.find((v) => v.isPublished)?.note}</span>
		{/if}
	</p>
	{#if data.editingId}
		<p class="mt-2 inline-block bg-amber-500/15 px-3 py-1 font-mono text-[11px] tracking-wide text-amber-700 uppercase">
			Editing version {data.versions.find((v) => v.id === data.editingId)?.version} ·
			<a href={`${base}/admin/pricing`} class="underline hover:text-amber-800">reset to published</a>
		</p>
	{/if}

	{#if form?.error}
		<div class="mt-5 border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</div>
	{/if}
	{#if form?.saved}
		<div class="mt-5 border border-green-600/30 bg-green-50 px-4 py-3 text-sm text-green-700">
			Draft saved as version {form.version}. Publish it from the version history below to make it live.
		</div>
	{/if}
	{#if form?.published}
		<div class="mt-5 border border-green-600/30 bg-green-50 px-4 py-3 text-sm text-green-700">Version published.</div>
	{/if}

	<!-- Remount the editor (re-cloning the rate card) whenever a different version is loaded -->
	{#key data.editingId}
	<div class="mt-8 grid gap-6 lg:grid-cols-3">
		<!-- ── Editor (2 cols) ── -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Account tiers -->
			<section class="border border-navy-950/10 bg-bone-50 p-6">
				<div class="flex items-center justify-between">
					<h2 class="eyebrow text-navy-950/45">Account tiers</h2>
					<button type="button" onclick={addTier} class="btn-label border border-navy-950/20 px-3 py-1.5 text-navy-950/70 hover:border-navy-700">+ Tier</button>
				</div>
				<p class="mt-2 text-xs text-navy-950/50">Flat monthly fee chosen by order volume. Leave max orders or fee empty for an open-ended / quoted (Custom) tier.</p>
				<div class="mt-4 overflow-x-auto">
					<div class="w-full min-w-[460px] text-sm">
						<div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-navy-950/10">
							<span class={thCls}>Label</span><span class={thCls}>Max orders</span><span class={thCls}>Fee $/mo</span><span class={thCls}></span>
						</div>
						{#each card.accountTiers as tier, i (tier.id)}
							<div class="overflow-hidden" transition:slide={{ duration: slideMs }}>
								<div class="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b border-navy-950/5 py-2">
									<input class={inputCls} bind:value={tier.label} />
									<input class={inputCls} type="number" min="0" placeholder="Custom" value={tier.maxOrders ?? ''} oninput={(e) => (tier.maxOrders = nullableNum(e.currentTarget.value))} />
									<input class={inputCls} type="number" min="0" step="0.01" placeholder="Quoted" value={tier.fee ?? ''} oninput={(e) => (tier.fee = nullableNum(e.currentTarget.value))} />
									<button type="button" onclick={() => removeTier(i)} class="justify-self-end font-mono text-xs text-red-600/70 hover:text-red-700">Remove</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<!-- Storage bands -->
			<section class="border border-navy-950/10 bg-bone-50 p-6">
				<div class="flex items-center justify-between">
					<h2 class="eyebrow text-navy-950/45">Storage bands</h2>
					<button type="button" onclick={() => addBand(card.storageBands)} class="btn-label border border-navy-950/20 px-3 py-1.5 text-navy-950/70 hover:border-navy-700">+ Band</button>
				</div>
				<p class="mt-2 text-xs text-navy-950/50">Per pallet / month. Bands must be contiguous; leave the last band's max empty for open-ended.</p>
				<div class="mt-4 overflow-x-auto">
					<div class="w-full min-w-[420px] text-sm">
						<div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-navy-950/10"><span class={thCls}>Min pallets</span><span class={thCls}>Max pallets</span><span class={thCls}>Rate $/pallet</span><span class={thCls}></span></div>
						{#each card.storageBands as band, i (band.id)}
							<div class="overflow-hidden" transition:slide={{ duration: slideMs }}>
								<div class="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b border-navy-950/5 py-2">
									<input class={inputCls} type="number" min="0" bind:value={band.min} />
									<input class={inputCls} type="number" min="0" placeholder="Open" value={band.max ?? ''} oninput={(e) => (band.max = nullableNum(e.currentTarget.value))} />
									<input class={inputCls} type="number" min="0" step="0.01" bind:value={band.rate} />
									<button type="button" onclick={() => removeBand(card.storageBands, i)} class="justify-self-end font-mono text-xs text-red-600/70 hover:text-red-700">Remove</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<label class="mt-4 block">
					<span class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">Custom above (pallets)</span>
					<input class={`${inputCls} mt-1 max-w-[160px]`} type="number" min="1" bind:value={card.storageCustomAbove} />
				</label>
			</section>

			<!-- Receiving bands -->
			<section class="border border-navy-950/10 bg-bone-50 p-6">
				<div class="flex items-center justify-between">
					<h2 class="eyebrow text-navy-950/45">Receiving bands</h2>
					<button type="button" onclick={() => addBand(card.receivingBands)} class="btn-label border border-navy-950/20 px-3 py-1.5 text-navy-950/70 hover:border-navy-700">+ Band</button>
				</div>
				<p class="mt-2 text-xs text-navy-950/50">Inbound, per pallet received / month. Bands must be contiguous.</p>
				<div class="mt-4 overflow-x-auto">
					<div class="w-full min-w-[420px] text-sm">
						<div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 border-b border-navy-950/10"><span class={thCls}>Min pallets</span><span class={thCls}>Max pallets</span><span class={thCls}>Rate $/pallet</span><span class={thCls}></span></div>
						{#each card.receivingBands as band, i (band.id)}
							<div class="overflow-hidden" transition:slide={{ duration: slideMs }}>
								<div class="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 border-b border-navy-950/5 py-2">
									<input class={inputCls} type="number" min="0" bind:value={band.min} />
									<input class={inputCls} type="number" min="0" placeholder="Open" value={band.max ?? ''} oninput={(e) => (band.max = nullableNum(e.currentTarget.value))} />
									<input class={inputCls} type="number" min="0" step="0.01" bind:value={band.rate} />
									<button type="button" onclick={() => removeBand(card.receivingBands, i)} class="justify-self-end font-mono text-xs text-red-600/70 hover:text-red-700">Remove</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<label class="mt-4 block">
					<span class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">SKU setup fee $/SKU (one-off)</span>
					<input class={`${inputCls} mt-1 max-w-[160px]`} type="number" min="0" step="0.01" bind:value={card.skuSetupFee} />
				</label>
			</section>

			<!-- Pick & pack -->
			<section class="border border-navy-950/10 bg-bone-50 p-6">
				<h2 class="eyebrow text-navy-950/45">Pick &amp; pack</h2>
				<div class="mt-4 grid max-w-md gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">First item $</span>
						<input class={`${inputCls} mt-1`} type="number" min="0" step="0.01" bind:value={card.pickPack.firstItem} />
					</label>
					<label class="block">
						<span class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">Additional item $</span>
						<input class={`${inputCls} mt-1`} type="number" min="0" step="0.01" bind:value={card.pickPack.additionalItem} />
					</label>
				</div>
			</section>

			<!-- Shipping bands -->
			<section class="border border-navy-950/10 bg-bone-50 p-6">
				<div class="flex items-center justify-between">
					<h2 class="eyebrow text-navy-950/45">Shipping bands</h2>
					<button type="button" onclick={addShipping} class="btn-label border border-navy-950/20 px-3 py-1.5 text-navy-950/70 hover:border-navy-700">+ Band</button>
				</div>
				<p class="mt-2 border-l-2 border-amber-500 pl-3 text-xs text-navy-950/60">
					Placeholder rates — replace with Meridian's courier rate card. Fixed price per order by weight, ascending by up-to-kg.
				</p>
				<div class="mt-4 overflow-x-auto">
					<div class="w-full min-w-[360px] text-sm">
						<div class="grid grid-cols-[1fr_1fr_auto] gap-2 border-b border-navy-950/10"><span class={thCls}>Up to (kg)</span><span class={thCls}>Price $/order</span><span class={thCls}></span></div>
						{#each card.shippingBands as sb, i (sb.id)}
							<div class="overflow-hidden" transition:slide={{ duration: slideMs }}>
								<div class="grid grid-cols-[1fr_1fr_auto] items-center gap-2 border-b border-navy-950/5 py-2">
									<input class={inputCls} type="number" min="0" step="0.1" bind:value={sb.maxKg} />
									<input class={inputCls} type="number" min="0" step="0.01" bind:value={sb.price} />
									<button type="button" onclick={() => removeShipping(i)} class="justify-self-end font-mono text-xs text-red-600/70 hover:text-red-700">Remove</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<!-- Extras -->
			<section class="border border-navy-950/10 bg-bone-50 p-6">
				<h2 class="eyebrow text-navy-950/45">Extras</h2>
				<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each [['Returns $', 'returns'], ['Relabel $', 'relabel'], ['Kitting $', 'kitting'], ['Urgent $', 'urgent']] as [label, key] (key)}
						<label class="block">
							<span class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">{label}</span>
							<input class={`${inputCls} mt-1`} type="number" min="0" step="0.01" bind:value={card.extras[key as keyof typeof card.extras]} />
						</label>
					{/each}
				</div>
			</section>
		</div>

		<!-- ── Right rail: live preview + actions ── -->
		<div class="space-y-6">
			<div class="sticky top-6 space-y-6">
				<!-- Live preview -->
				<section class="border border-navy-700/30 bg-navy-950 p-6 text-white">
					<h2 class="eyebrow text-amber-500">Live preview</h2>
					<p class="mt-2 text-[11px] text-white/50">
						Sample: 600 orders · 1.8 items · 12 stored · 8 received · 60 SKUs · 1.2 kg · 30 returns. Reflects the current draft, before publishing.
					</p>
					{#if preview.custom}
						<p class="mt-4 text-lg font-medium text-amber-400">Custom — let's talk</p>
					{:else}
						<div class="mt-4 flex items-baseline justify-between">
							<span class="text-sm text-white/60">Monthly total</span>
							<span class="display text-2xl text-white">{money(preview.monthlyTotal)}</span>
						</div>
						<div class="mt-1 flex items-baseline justify-between">
							<span class="text-sm text-white/60">Per order</span>
							<span class="text-lg text-amber-400">{money(preview.perOrderTotal)}</span>
						</div>
					{/if}
					<dl class="mt-4 space-y-1.5 border-t border-white/10 pt-4">
						{#each preview.lines as line (line.key)}
							<div class="flex justify-between text-[13px]">
								<dt class="text-white/55">{line.label}</dt>
								<dd class="font-mono text-white/85">{money(line.monthly)}</dd>
							</div>
						{/each}
						<div class="flex justify-between border-t border-white/10 pt-2 text-[13px]">
							<dt class="text-white/55">One-off SKU setup</dt>
							<dd class="font-mono text-white/85">{money(preview.oneOffSetup)}</dd>
						</div>
					</dl>
					{#if preview.notes.length}
						<ul class="mt-3 space-y-1">
							{#each preview.notes as n (n)}<li class="text-[11px] text-amber-300/80">{n}</li>{/each}
						</ul>
					{/if}
				</section>

				<!-- Save draft -->
				<section class="border border-navy-950/10 bg-bone-50 p-6">
					<h2 class="eyebrow text-navy-950/45">Save changes</h2>
					{#if clientErrors.length}
						<ul class="mt-3 space-y-1">
							{#each clientErrors as e (e)}<li class="text-xs text-red-600">{e}</li>{/each}
						</ul>
					{/if}
					<form method="POST" action="?/save" use:enhance class="mt-4 space-y-3">
						<input type="hidden" name="data" value={payload} />
						<label class="block">
							<span class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">Note (optional)</span>
							<input name="note" bind:value={note} placeholder="What changed…" class={`${inputCls} mt-1`} />
						</label>
						<button type="submit" disabled={!canSave} class="btn-label w-full bg-navy-700 px-5 py-2.5 text-white transition-colors hover:bg-navy-950 disabled:cursor-not-allowed disabled:opacity-50">
							Save draft
						</button>
						<p class="text-[11px] text-navy-950/45">Saving creates a new unpublished version. Publish it from the history below.</p>
					</form>
				</section>
			</div>
		</div>
	</div>
	{/key}

	<!-- ── Version history ── -->
	<section class="mt-8 border border-navy-950/10 bg-bone-50 p-6">
		<h2 class="eyebrow text-navy-950/45">Version history</h2>
		<div class="mt-4 overflow-x-auto">
			<table class="w-full min-w-[640px] text-sm">
				<thead><tr class="border-b border-navy-950/10 bg-bone-100">
					<th class={thCls}>Version</th><th class={thCls}>Note</th><th class={thCls}>Status</th><th class={thCls}>Created</th><th class={thCls}></th>
				</tr></thead>
				<tbody>
					{#each data.versions as v (v.id)}
						<tr class="border-b border-navy-950/5">
							<td class="px-3 py-3 font-mono font-medium text-navy-700">v{v.version}</td>
							<td class="px-3 py-3 text-navy-950/70">{v.note ?? '—'}</td>
							<td class="px-3 py-3">
								{#if v.isPublished}
									<span class="bg-green-600 px-2 py-0.5 font-mono text-[10px] tracking-wide text-white uppercase">Published</span>
								{:else}
									<span class="bg-navy-950/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-navy-950/55 uppercase">Draft</span>
								{/if}
							</td>
							<td class="px-3 py-3 font-mono text-[11px] text-navy-950/45">{fmtDate(v.createdAt)}</td>
							<td class="px-3 py-3">
								<div class="flex items-center justify-end gap-3">
									<a href={`${base}/admin/pricing?edit=${v.id}`} class="font-mono text-xs text-navy-700 hover:text-navy-950">Edit</a>
									{#if !v.isPublished}
										<form method="POST" action="?/publish" use:enhance>
											<input type="hidden" name="id" value={v.id} />
											<button type="submit" class="btn-label bg-navy-700 px-3 py-1.5 text-white transition-colors hover:bg-navy-950">Publish</button>
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>
