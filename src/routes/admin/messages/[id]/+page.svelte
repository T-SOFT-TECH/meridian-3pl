<script lang="ts">
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';
	import { MESSAGE_STATUSES, messageStatusMeta, fmtDate } from '$lib/admin/format';

	let { data } = $props();
	const m = $derived(data.message);

	const mailto = $derived(
		`mailto:${m.email}?subject=${encodeURIComponent('RE: your enquiry — Meridian 3PL')}`
	);
</script>

<svelte:head><title>Message from {m.name} — Meridian 3PL Admin</title></svelte:head>

<div class="w-full">
	<a href={`${base}/admin/messages`} class="btn-label text-navy-950/50 transition-colors hover:text-navy-950">← Back to inbox</a>

	<div class="mt-5 flex flex-wrap items-start justify-between gap-4">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="display text-3xl text-navy-950">{m.name}</h1>
				<span class={['inline-block px-2.5 py-1 font-mono text-[10px] tracking-wide uppercase', messageStatusMeta(m.status).badge]}>{messageStatusMeta(m.status).label}</span>
			</div>
			<p class="mt-1 text-navy-950/60">
				<a href={mailto} class="text-navy-700 underline decoration-amber-500 underline-offset-2">{m.email}</a>
				{#if m.phone}· {m.phone}{/if}
			</p>
			<p class="mt-1 font-mono text-[11px] text-navy-950/45">Received {fmtDate(m.createdAt)}</p>
		</div>
		<a href={mailto} class="btn-label bg-navy-700 px-5 py-2.5 text-white transition-colors hover:bg-navy-950">Reply</a>
	</div>

	<div class="mt-6 border border-navy-950/10 bg-bone-50 p-6">
		<p class="text-sm leading-relaxed whitespace-pre-wrap text-navy-950/85">{m.message}</p>
	</div>

	<div class="mt-6 flex flex-wrap gap-2">
		{#each MESSAGE_STATUSES as s (s.value)}
			<form method="POST" action="?/status" use:enhance>
				<input type="hidden" name="status" value={s.value} />
				<button type="submit" class={['btn-label border px-4 py-2.5 transition-colors', m.status === s.value ? 'border-navy-700 bg-navy-700 text-white' : 'border-navy-950/15 text-navy-950/60 hover:border-navy-700']}>
					Mark {s.label}
				</button>
			</form>
		{/each}
	</div>
</div>
