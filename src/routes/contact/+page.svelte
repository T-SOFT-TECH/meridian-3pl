<script lang="ts">
	import PageHero from '$lib/components/PageHero.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';
	import { resolve } from '$app/paths';
	import { COMPANY } from '$lib/data';
	import { reveal } from '$lib/motion';
	import { base } from '$app/paths';

	let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let attempted = $state(false);
	let botcheck = $state(false);

	let form = $state({ name: '', email: '', phone: '', message: '' });

	const emailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()));
	const errors = $derived({
		name: form.name.trim() ? '' : 'Your name is required.',
		email: form.email.trim()
			? emailValid
				? ''
				: 'That email address doesn’t look right.'
			: 'An email address is required.',
		message: form.message.trim() ? '' : 'Tell us a little about your enquiry.'
	});
	const valid = $derived(Object.values(errors).every((e) => !e));

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		attempted = true;
		if (!valid || status === 'submitting') return;

		status = 'submitting';
		try {
			const response = await fetch(`${base}/api/contact`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ ...form, botcheck })
			});
			const result = await response.json();
			status = response.ok && result.success ? 'success' : 'error';
		} catch {
			status = 'error';
		}
	}

	const inputClass =
		'w-full border-navy-950/20 bg-white px-4 py-3.5 text-sm text-navy-950 placeholder:text-navy-950/35 focus:border-navy-700 focus:ring-1 focus:ring-navy-700';
	const labelClass = 'eyebrow mb-2.5 block text-navy-950/70';
	const errorClass = 'mt-2 font-mono text-[11px] tracking-wide text-red-700';

	const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent('4/22 West Court, Derrimut VIC, Australia')}&z=14&output=embed`;
</script>

<svelte:head>
	<title>Contact Us — Meridian 3PL</title>
	<meta
		name="description"
		content="Contact Meridian 3PL — phone +61 487 295 376, or visit us at 4/22 West Court, Derrimut, Melbourne. Send a message and we'll respond within one business day."
	/>
</svelte:head>

<PageHero
	eyebrow="Contact"
	description="Questions about warehousing, fulfilment, or whether we're the right fit? Reach out — a logistics specialist will come back to you within one business day."
>
	Within <span class="serif-accent text-amber-500">reach.</span>
</PageHero>

<section class="bg-bone-50 py-20 lg:py-28">
	<div class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="grid gap-14 lg:grid-cols-12 lg:gap-16">
			<!-- ——— Channels ——— -->
			<div class="lg:col-span-5" {@attach reveal({ targets: '[data-reveal]' })}>
				<div data-reveal class="border-t-2 border-amber-500 pt-7">
					<p class="eyebrow text-navy-950/50">Call</p>
					<a
						href={COMPANY.phoneHref}
						class="display mt-3 inline-block text-3xl text-navy-950 transition-colors hover:text-navy-700 sm:text-4xl"
					>
						{COMPANY.phone}
					</a>
					<p class="mt-2 font-mono text-[11px] tracking-wide text-navy-950/45">
						Monday – Friday · 8:00 – 17:00 AEST
					</p>
				</div>

				<div data-reveal class="mt-12 border-t-2 border-amber-500 pt-7">
					<p class="eyebrow text-navy-950/50">Visit</p>
					<a
						href={COMPANY.mapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="display mt-3 inline-block text-2xl leading-snug text-navy-950 transition-colors hover:text-navy-700 sm:text-3xl"
					>
						{COMPANY.address},<br />Melbourne VIC
					</a>
					<p class="mt-2 font-mono text-[11px] tracking-wide text-navy-950/45">
						{COMPANY.coordinates} · Site visits by appointment
					</p>
				</div>

				<div data-reveal class="mt-12 overflow-hidden border border-navy-950/10">
					<iframe
						src={mapSrc}
						title="Map showing the Meridian 3PL facility at 4/22 West Court, Derrimut, Melbourne"
						class="h-72 w-full grayscale-[35%] contrast-[1.05]"
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
						allowfullscreen
					></iframe>
				</div>
			</div>

			<!-- ——— Message form ——— -->
			<div class="lg:col-span-7">
				<div class="border border-navy-950/10 bg-white p-7 sm:p-10 lg:p-12">
					{#if status === 'success'}
						<div aria-live="polite">
							<svg class="h-12 w-12 text-amber-600" viewBox="0 0 56 56" fill="none" aria-hidden="true">
								<circle cx="28" cy="28" r="27" stroke="currentColor" stroke-width="1.5" />
								<path d="m18 29 7 7 14-16" stroke="currentColor" stroke-width="2" />
							</svg>
							<h2 class="display mt-7 text-3xl text-navy-950">
								Message <span class="serif-accent text-navy-700">received.</span>
							</h2>
							<p class="mt-5 max-w-md leading-relaxed text-navy-950/70">
								Thanks, {form.name.split(' ')[0]} — we’ll be in touch at <strong>{form.email}</strong>
								within one business day.
							</p>
							<a
								href={resolve('/')}
								class="btn-label mt-9 inline-flex items-center gap-3 bg-navy-700 px-8 py-4.5 text-white transition-colors hover:bg-navy-950"
							>
								Back to home
							</a>
						</div>
					{:else}
						<h2 class="display text-2xl text-navy-950">Send a message</h2>
						<p class="mt-3 text-sm leading-relaxed text-navy-950/60">
							For quotes, use the <a href={resolve('/quote')} class="text-navy-700 underline decoration-amber-500 underline-offset-4">Get a Quote</a>
							form — it gets you a sharper answer, faster. For everything else, this inbox is open.
						</p>

						{#if status === 'error'}
							<div class="mt-7 border border-red-700/30 bg-red-50 p-5" role="alert">
								<p class="font-mono text-xs font-medium tracking-wide text-red-800 uppercase">
									Your message didn’t send.
								</p>
								<p class="mt-2 text-sm text-red-900/80">
									Please try again, or call us on
									<a href={COMPANY.phoneHref} class="font-medium underline">{COMPANY.phone}</a>.
								</p>
							</div>
						{/if}

						<form onsubmit={submit} novalidate class="mt-9">
							<input
								type="checkbox"
								name="botcheck"
								bind:checked={botcheck}
								class="hidden"
								tabindex="-1"
								autocomplete="off"
								aria-hidden="true"
							/>
							<div class="grid gap-7 sm:grid-cols-2">
								<div>
									<label class={labelClass} for="name">Name *</label>
									<input
										id="name"
										type="text"
										class={inputClass}
										bind:value={form.name}
										placeholder="Full name"
										autocomplete="name"
									/>
									{#if attempted && errors.name}<p class={errorClass}>{errors.name}</p>{/if}
								</div>
								<div>
									<label class={labelClass} for="email">Email *</label>
									<input
										id="email"
										type="email"
										class={inputClass}
										bind:value={form.email}
										placeholder="you@company.com.au"
										autocomplete="email"
									/>
									{#if attempted && errors.email}<p class={errorClass}>{errors.email}</p>{/if}
								</div>
								<div class="sm:col-span-2">
									<label class={labelClass} for="phone">Phone</label>
									<input
										id="phone"
										type="tel"
										class={inputClass}
										bind:value={form.phone}
										placeholder="+61 4xx xxx xxx"
										autocomplete="tel"
									/>
								</div>
								<div class="sm:col-span-2">
									<label class={labelClass} for="message">Message *</label>
									<textarea
										id="message"
										rows="6"
										class={inputClass}
										bind:value={form.message}
										placeholder="How can we help?"
									></textarea>
									{#if attempted && errors.message}<p class={errorClass}>{errors.message}</p>{/if}
								</div>
							</div>
							<button
								type="submit"
								disabled={status === 'submitting'}
								class="btn-label group mt-9 inline-flex items-center gap-3 bg-amber-500 px-9 py-4.5 text-navy-950 transition-colors duration-300 hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
							>
								{status === 'submitting' ? 'Sending…' : 'Send message'}
								{#if status !== 'submitting'}
									<svg class="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none" aria-hidden="true">
										<path d="M1 6h10m0 0L7 2m4 4-4 4" stroke="currentColor" stroke-width="1.5" />
									</svg>
								{/if}
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<CtaBand
	title="Rather start with"
	accent="numbers?"
	description="The quote form captures your volumes and channels in three short steps — and gets you a tailored proposal."
/>
