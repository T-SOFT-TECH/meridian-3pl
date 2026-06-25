<script lang="ts">
	interface Row {
		label: string;
		value: number;
	}
	interface Props {
		data: Row[];
		color?: string;
		empty?: string;
	}

	let { data, color = '#1a1f6e', empty = 'No data yet.' }: Props = $props();

	const max = $derived(Math.max(1, ...data.map((d) => d.value)));
</script>

{#if data.length === 0}
	<p class="py-8 text-center text-sm text-navy-950/40">{empty}</p>
{:else}
	<ul class="space-y-3.5">
		{#each data as d (d.label)}
			<li>
				<div class="flex items-baseline justify-between gap-3 text-sm">
					<span class="truncate text-navy-950/75">{d.label}</span>
					<span class="font-mono text-navy-950/55 tabular-nums">{d.value}</span>
				</div>
				<div class="mt-1.5 h-2 w-full overflow-hidden bg-navy-950/8">
					<div class="hbar h-full" style="width:{(d.value / max) * 100}%; background:{color}"></div>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.hbar {
		transform-origin: left;
		animation: slide 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes slide {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hbar {
			animation: none;
		}
	}
</style>
