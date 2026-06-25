<script lang="ts">
	interface Bar {
		label: string;
		value: number;
	}
	interface Props {
		data: Bar[];
		height?: number;
		base?: string;
		highlight?: string;
		unit?: string;
	}

	let { data, height = 170, base = '#1a1f6e', highlight = '#f5a623', unit = '' }: Props = $props();

	const max = $derived(Math.max(1, ...data.map((d) => d.value)));
</script>

<div>
	<div class="flex items-end gap-1.5 border-b border-navy-950/10" style="height:{height}px">
		{#each data as d, i (i)}
			<div class="group relative flex h-full flex-1 flex-col justify-end">
				<div
					class="bar w-full rounded-t-[2px]"
					style="height:{(d.value / max) * 100}%; background:{i === data.length - 1 ? highlight : base}"
				></div>
				<!-- tooltip -->
				<div
					class="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap border border-navy-950/10 bg-white px-2 py-1 font-mono text-[10px] text-navy-950 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
				>
					{d.value}{unit}
				</div>
			</div>
		{/each}
	</div>
	<div class="mt-2 flex gap-1.5">
		{#each data as d, i (i)}
			<span class="flex-1 text-center font-mono text-[9px] tracking-wide text-navy-950/40">{d.label}</span>
		{/each}
	</div>
</div>

<style>
	.bar {
		min-height: 1px;
		transform-origin: bottom;
		animation: grow 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes grow {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.bar {
			animation: none;
		}
	}
</style>
