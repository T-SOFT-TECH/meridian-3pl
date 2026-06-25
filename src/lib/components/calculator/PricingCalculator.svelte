<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { computeQuote } from '$lib/pricing/calculate';
	import type { RateCard, CalcInputs } from '$lib/pricing/types';
	import { prefersReducedMotion } from '$lib/motion';
	import { COMPANY } from '$lib/data';
	import Slider from './Slider.svelte';

	let { config }: { config: RateCard } = $props();

	let inputs = $state<CalcInputs>({
		ordersPerMonth: 500,
		itemsPerOrder: 1.5,
		palletsStored: 10,
		palletsReceived: 4,
		skuCount: 50,
		avgWeightKg: 0.5,
		extras: { returns: 0, relabel: 0, kitting: 0, urgent: 0, customPackaging: false }
	});

	const result = $derived(computeQuote(inputs, config));

	// Smoothly roll the headline total as inputs change.
	const reduced = prefersReducedMotion();
	const totalTween = new Tween(0, { duration: reduced ? 0 : 500, easing: cubicOut });
	$effect(() => {
		totalTween.set(result.custom ? 0 : result.monthlyTotal);
	});

	// ── formatting ──
	const aud = (n: number, dp = 2) =>
		new Intl.NumberFormat('en-AU', {
			style: 'currency',
			currency: 'AUD',
			minimumFractionDigits: dp,
			maximumFractionDigits: dp
		}).format(n);
	const audWhole = (n: number) => aud(n, Number.isInteger(n) ? 0 : 2);

	function weightBandLabel(kg: number): string {
		let lower = 0;
		for (const b of config.shippingBands) {
			if (kg <= b.maxKg) return lower === 0 ? `up to ${b.maxKg} kg` : `${lower}–${b.maxKg} kg`;
			lower = b.maxKg;
		}
		const last = config.shippingBands.at(-1);
		return last ? `${last.maxKg} kg +` : '';
	}

	const storedCustom = $derived(inputs.palletsStored > config.storageCustomAbove);

	function adjust(key: 'returns' | 'relabel' | 'kitting' | 'urgent', delta: number) {
		inputs.extras[key] = Math.max(0, inputs.extras[key] + delta);
	}

	let showExtras = $state(false);

	// ── lead capture ──
	let showCapture = $state(false);
	let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let reference = $state('');
	let attempted = $state(false);
	let botcheck = $state(false);
	let form = $state({ company: '', contact: '', email: '', phone: '', message: '' });

	const emailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()));
	const captureValid = $derived(
		form.company.trim() !== '' && form.contact.trim() !== '' && emailValid
	);

	function openCapture() {
		showCapture = true;
		status = 'idle';
		attempted = false;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		attempted = true;
		if (!captureValid || status === 'submitting') return;
		status = 'submitting';
		try {
			const res = await fetch(`${base}/api/quote`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ ...form, calc: $state.snapshot(inputs), botcheck })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				reference = data.reference;
				status = 'success';
			} else {
				status = 'error';
			}
		} catch {
			status = 'error';
		}
	}

	const inputCls =
		'w-full border-navy-950/20 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-navy-950/35 focus:border-navy-700 focus:ring-1 focus:ring-navy-700';
	const errCls = 'mt-1.5 font-mono text-[11px] tracking-wide text-red-700';
</script>

<section class="relative bg-bone-100 py-20 lg:py-28">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="max-w-2xl">
			<p class="eyebrow text-navy-700">Instant quote</p>
			<h2 class="display mt-4 text-4xl text-navy-950 sm:text-5xl">
				Price it <span class="serif-accent text-navy-700">yourself.</span>
			</h2>
			<p class="mt-5 text-base leading-relaxed text-navy-950/65">
				Move the sliders to match your operation and watch the numbers update live — shown both per
				order and per month. Transparent rates, no waiting for a sales call.
			</p>
		</div>

		<div class="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
			<!-- ── Inputs ── -->
			<div class="border border-navy-950/10 bg-bone-50 p-7 lg:col-span-7 lg:p-10">
				<h3 class="eyebrow text-navy-950/45">Your operation</h3>

				<div class="mt-7 grid gap-7 sm:grid-cols-2 sm:gap-x-10">
					<Slider
						label="Orders / month"
						bind:value={inputs.ordersPerMonth}
						min={50}
						max={5000}
						step={25}
						display={inputs.ordersPerMonth.toLocaleString('en-AU')}
					/>
					<Slider
						label="Avg items / order"
						bind:value={inputs.itemsPerOrder}
						min={1}
						max={10}
						step={0.1}
						display={inputs.itemsPerOrder.toFixed(1)}
					/>
					<Slider
						label="Pallets stored"
						bind:value={inputs.palletsStored}
						min={0}
						max={config.storageCustomAbove + 5}
						step={1}
						display={storedCustom ? `${config.storageCustomAbove}+` : String(inputs.palletsStored)}
						hint={storedCustom ? 'Beyond facility capacity — custom' : undefined}
					/>
					<Slider
						label="Pallets received / month"
						bind:value={inputs.palletsReceived}
						min={0}
						max={50}
						step={1}
						display={String(inputs.palletsReceived)}
					/>
					<Slider
						label="Unique SKUs"
						bind:value={inputs.skuCount}
						min={1}
						max={1000}
						step={1}
						display={inputs.skuCount.toLocaleString('en-AU')}
						hint="One-off onboarding setup"
					/>
					<Slider
						label="Avg order weight"
						bind:value={inputs.avgWeightKg}
						min={0.1}
						max={22}
						step={0.1}
						display={`${inputs.avgWeightKg.toFixed(1)} kg`}
						hint={`Shipping band: ${weightBandLabel(inputs.avgWeightKg)}`}
					/>
				</div>

				<!-- Extras -->
				<div class="mt-9 border-t border-navy-950/10 pt-6">
					<button
						type="button"
						onclick={() => (showExtras = !showExtras)}
						class="flex w-full items-center justify-between"
						aria-expanded={showExtras}
					>
						<span class="eyebrow text-navy-950/45">Optional add-ons</span>
						<span class="font-mono text-xs text-navy-700">{showExtras ? '– hide' : '+ add'}</span>
					</button>

					{#if showExtras}
						<div class="mt-5 grid gap-5 sm:grid-cols-2" transition:fly={{ y: -8, duration: 200 }}>
							{#each [['returns', 'Returns / month'], ['relabel', 'Relabel (units)'], ['kitting', 'Kitting (units)'], ['urgent', 'Urgent dispatches']] as [key, label] (key)}
								<div class="flex items-center justify-between gap-3">
									<span class="text-sm text-navy-950/70">{label}</span>
									<div class="flex items-center">
										<button type="button" onclick={() => adjust(key as 'returns', -1)} class="flex h-9 w-9 items-center justify-center border border-navy-950/20 text-navy-950/70 hover:border-navy-700" aria-label={`decrease ${label}`}>–</button>
										<input
											type="number"
											min="0"
											bind:value={inputs.extras[key as 'returns']}
											class="h-9 w-14 border-y border-navy-950/20 bg-white text-center font-mono text-sm text-navy-950 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
										/>
										<button type="button" onclick={() => adjust(key as 'returns', 1)} class="flex h-9 w-9 items-center justify-center border border-navy-950/20 text-navy-950/70 hover:border-navy-700" aria-label={`increase ${label}`}>+</button>
									</div>
								</div>
							{/each}
							<label class="flex items-center gap-3 text-sm text-navy-950/70">
								<input type="checkbox" bind:checked={inputs.extras.customPackaging} class="h-4 w-4 border-navy-950/30 text-amber-500 focus:ring-amber-500" />
								Custom packaging (quoted separately)
							</label>
						</div>
					{/if}
				</div>
			</div>

			<!-- ── Estimate ── -->
			<div class="lg:col-span-5">
				<div class="grain meridian-grid sticky top-28 overflow-hidden border border-navy-950/10 bg-navy-950 text-white">
					<div class="relative z-10 p-7 lg:p-9">
						<p class="eyebrow flex items-center justify-between text-amber-500">
							<span>Your estimate</span>
							<span class="text-white/35">AUD · ex-GST</span>
						</p>

						{#if result.custom}
							<!-- Custom / capacity state -->
							<div class="mt-7">
								<h3 class="display text-3xl">
									Let's <span class="serif-accent text-amber-500">talk.</span>
								</h3>
								<p class="mt-4 text-sm leading-relaxed text-white/65">
									Your volumes are beyond our standard published tiers — which means we can tailor
									sharper pricing than a calculator should promise.
								</p>
								<ul class="mt-4 space-y-1.5">
									{#each result.notes as note (note)}
										<li class="flex gap-2 font-mono text-[11px] tracking-wide text-amber-300/80">
											<span aria-hidden="true">›</span>{note}
										</li>
									{/each}
								</ul>
							</div>
						{:else}
							<!-- Numeric estimate -->
							<div class="mt-6">
								<p class="display text-[clamp(2.75rem,7vw,4rem)] leading-none text-white tabular-nums">
									{reduced ? audWhole(result.monthlyTotal) : audWhole(Math.round(totalTween.current))}
								</p>
								<p class="mt-2 font-mono text-xs tracking-[0.18em] text-white/45 uppercase">per month</p>
							</div>

							<div class="mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10">
								<div class="bg-navy-950 p-4">
									<p class="display text-2xl text-amber-500">{aud(result.perOrderTotal)}</p>
									<p class="mt-1 font-mono text-[10px] tracking-wide text-white/40 uppercase">all-in / order</p>
								</div>
								<div class="bg-navy-950 p-4">
									<p class="display text-2xl text-white">{aud(result.fulfilmentPerOrder)}</p>
									<p class="mt-1 font-mono text-[10px] tracking-wide text-white/40 uppercase">fulfilment / order</p>
								</div>
							</div>

							<!-- Breakdown -->
							<ul class="mt-6 space-y-2.5">
								{#each result.lines as line (line.key)}
									<li class="flex items-baseline justify-between gap-3 text-sm">
										<span class="text-white/60">{line.label}</span>
										<span class="flex items-baseline gap-2">
											<span class="font-mono text-[10px] text-white/30">{aud(line.perOrder)}/o</span>
											<span class="font-mono text-white/85 tabular-nums">{audWhole(line.monthly)}</span>
										</span>
									</li>
								{/each}
							</ul>

							{#if result.oneOffSetup > 0}
								<p class="mt-4 border-t border-white/10 pt-4 font-mono text-[11px] tracking-wide text-white/45">
									+ {audWhole(result.oneOffSetup)} one-off SKU setup
								</p>
							{/if}
						{/if}

						<button
							type="button"
							onclick={openCapture}
							class="btn-label group mt-7 flex w-full items-center justify-center gap-3 bg-amber-500 px-6 py-4.5 text-navy-950 transition-colors hover:bg-amber-400"
						>
							{result.custom ? 'Request custom pricing' : 'Get this quote in writing'}
							<svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" /></svg>
						</button>
						<p class="mt-4 text-center font-mono text-[10px] leading-relaxed tracking-wide text-white/35">
							Indicative estimate — final quote confirmed after a short call.<br />Shipping rates indicative.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ── Capture modal ── -->
{#if showCapture}
	<div
		class="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm sm:p-6"
		role="dialog"
		aria-modal="true"
		aria-label="Request your quote"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="relative w-full max-w-lg bg-bone-50 shadow-2xl"
			transition:fly={{ y: 20, duration: 300, easing: cubicOut }}
		>
			{#if status === 'success'}
				<div class="p-8 text-center sm:p-12">
					<svg class="mx-auto h-14 w-14 text-amber-600" viewBox="0 0 56 56" fill="none" aria-hidden="true"><circle cx="28" cy="28" r="27" stroke="currentColor" stroke-width="1.5" /><path d="m18 29 7 7 14-16" stroke="currentColor" stroke-width="2" /></svg>
					<h3 class="display mt-7 text-3xl text-navy-950">On its <span class="serif-accent text-navy-700">way.</span></h3>
					<p class="mt-4 leading-relaxed text-navy-950/70">
						Thanks, {form.contact.split(' ')[0] || 'there'} — your estimate for <strong>{form.company}</strong>
						is with our team. We'll confirm a tailored quote within one business day.
					</p>
					<div class="mt-6 inline-block border border-navy-950/15 bg-bone-100 px-6 py-3">
						<p class="eyebrow text-navy-950/45">Reference</p>
						<p class="mt-1 font-mono text-lg tracking-widest text-navy-700">{reference}</p>
					</div>
					<div class="mt-8">
						<a href={resolve('/')} class="btn-label inline-flex bg-navy-700 px-8 py-4 text-white transition-colors hover:bg-navy-950">Back to home</a>
					</div>
				</div>
			{:else}
				<button
					type="button"
					onclick={() => (showCapture = false)}
					class="absolute top-4 right-4 flex h-9 w-9 items-center justify-center text-navy-950/40 transition-colors hover:text-navy-950"
					aria-label="Close"
				>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" /></svg>
				</button>

				<div class="p-7 sm:p-9">
					<p class="eyebrow text-amber-600">Almost there</p>
					<h3 class="display mt-3 text-2xl text-navy-950 sm:text-3xl">Send me this quote</h3>

					{#if !result.custom}
						<div class="mt-5 flex items-baseline gap-3 border border-navy-950/10 bg-bone-100 px-4 py-3">
							<span class="display text-2xl text-navy-700">{audWhole(result.monthlyTotal)}</span>
							<span class="font-mono text-[11px] tracking-wide text-navy-950/50 uppercase">/mo · {aud(result.perOrderTotal)}/order</span>
						</div>
					{/if}

					{#if status === 'error'}
						<div class="mt-5 border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
							Something went wrong. Please try again, or call us on
							<a href={COMPANY.phoneHref} class="font-medium underline">{COMPANY.phone}</a>.
						</div>
					{/if}

					<form onsubmit={submit} novalidate class="mt-6 space-y-4">
						<input type="checkbox" name="botcheck" bind:checked={botcheck} class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label class="eyebrow mb-2 block text-navy-950/55" for="c-company">Company *</label>
								<input id="c-company" class={inputCls} bind:value={form.company} autocomplete="organization" />
								{#if attempted && !form.company.trim()}<p class={errCls}>Required.</p>{/if}
							</div>
							<div>
								<label class="eyebrow mb-2 block text-navy-950/55" for="c-contact">Your name *</label>
								<input id="c-contact" class={inputCls} bind:value={form.contact} autocomplete="name" />
								{#if attempted && !form.contact.trim()}<p class={errCls}>Required.</p>{/if}
							</div>
							<div>
								<label class="eyebrow mb-2 block text-navy-950/55" for="c-email">Work email *</label>
								<input id="c-email" type="email" class={inputCls} bind:value={form.email} autocomplete="email" />
								{#if attempted && !emailValid}<p class={errCls}>Enter a valid email.</p>{/if}
							</div>
							<div>
								<label class="eyebrow mb-2 block text-navy-950/55" for="c-phone">Phone</label>
								<input id="c-phone" type="tel" class={inputCls} bind:value={form.phone} autocomplete="tel" />
							</div>
						</div>
						<div>
							<label class="eyebrow mb-2 block text-navy-950/55" for="c-msg">Anything else?</label>
							<textarea id="c-msg" rows="2" class={inputCls} bind:value={form.message} placeholder="Product type, peak seasons, integrations…"></textarea>
						</div>
						<button
							type="submit"
							disabled={status === 'submitting'}
							class="btn-label w-full bg-amber-500 px-6 py-4 text-navy-950 transition-colors hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
						>
							{status === 'submitting' ? 'Sending…' : 'Send my quote'}
						</button>
						<p class="text-center font-mono text-[10px] tracking-wide text-navy-950/40">
							Your inputs and estimate are attached automatically.
						</p>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}
