<script lang="ts">
	import { fmtDateShort } from '$lib/admin/format';
	let { data } = $props();
</script>

<svelte:head><title>Settings — Meridian 3PL Admin</title></svelte:head>

<div class="w-full">
	<p class="eyebrow text-amber-600">Settings</p>
	<h1 class="display mt-3 text-3xl text-navy-950 sm:text-4xl">
		Team &amp; <span class="serif-accent text-navy-700">configuration</span>
	</h1>

	<section class="mt-8">
		<h2 class="eyebrow text-navy-950/45">Staff accounts</h2>
		<div class="mt-4 overflow-x-auto border border-navy-950/10 bg-bone-50">
			<table class="w-full min-w-[520px] text-sm">
				<thead>
					<tr class="border-b border-navy-950/10 bg-bone-100 text-left">
						{#each ['Name', 'Email', 'Role', 'Added'] as h (h)}
							<th class="px-4 py-3 font-mono text-[10px] tracking-[0.14em] text-navy-950/50 uppercase">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data.staff as s (s.id)}
						<tr class="border-b border-navy-950/5">
							<td class="px-4 py-3 font-medium text-navy-950">{s.name}</td>
							<td class="px-4 py-3 text-navy-950/70">{s.email}</td>
							<td class="px-4 py-3">
								<span class={['px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase', s.role === 'admin' ? 'bg-amber-500 text-navy-950' : 'bg-navy-200 text-navy-900']}>{s.role}</span>
							</td>
							<td class="px-4 py-3 font-mono text-[11px] text-navy-950/45">{fmtDateShort(s.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-3 text-sm text-navy-950/50">
			Inviting and managing additional staff accounts (and notification settings) arrives in a later phase.
		</p>
	</section>
</div>
