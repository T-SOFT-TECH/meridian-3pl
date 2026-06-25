<script lang="ts">
	interface Segment {
		label: string;
		value: number;
		color: string;
	}
	interface Props {
		data: Segment[];
		size?: number;
		thickness?: number;
		centerLabel?: string;
	}

	let { data, size = 168, thickness = 20, centerLabel = 'total' }: Props = $props();

	const total = $derived(data.reduce((s, d) => s + d.value, 0));
	const r = $derived((size - thickness) / 2);
	const circ = $derived(2 * Math.PI * r);

	const segments = $derived.by(() => {
		let acc = 0;
		return data
			.filter((d) => d.value > 0)
			.map((d) => {
				const frac = total > 0 ? d.value / total : 0;
				const seg = { ...d, dash: frac * circ, offset: -acc * circ };
				acc += frac;
				return seg;
			});
	});

	const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
</script>

<div class="flex flex-wrap items-center gap-6 sm:flex-nowrap">
	<svg
		width={size}
		height={size}
		viewBox="0 0 {size} {size}"
		class="shrink-0"
		role="img"
		aria-label="{centerLabel}: {total}"
	>
		<g transform="rotate(-90 {size / 2} {size / 2})">
			<circle cx={size / 2} cy={size / 2} {r} fill="none" stroke="rgb(7 10 38 / 0.06)" stroke-width={thickness} />
			{#each segments as s (s.label)}
				<circle
					cx={size / 2}
					cy={size / 2}
					{r}
					fill="none"
					stroke={s.color}
					stroke-width={thickness}
					stroke-dasharray="{s.dash} {circ - s.dash}"
					stroke-dashoffset={s.offset}
				/>
			{/each}
		</g>
		<text
			x={size / 2}
			y={size / 2 - 2}
			text-anchor="middle"
			fill="#1a1f6e"
			style="font-family:'Archivo Variable',sans-serif;font-weight:800;font-size:30px"
		>
			{total}
		</text>
		<text
			x={size / 2}
			y={size / 2 + 18}
			text-anchor="middle"
			fill="rgb(7 10 38 / 0.4)"
			style="font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase"
		>
			{centerLabel}
		</text>
	</svg>

	<ul class="min-w-0 flex-1 space-y-2.5">
		{#each data as d (d.label)}
			<li class="flex items-center gap-3 text-sm">
				<span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background:{d.color}"></span>
				<span class="flex-1 truncate text-navy-950/70">{d.label}</span>
				<span class="font-mono text-navy-950/85 tabular-nums">{d.value}</span>
				<span class="w-9 text-right font-mono text-[11px] text-navy-950/35">{pct(d.value)}%</span>
			</li>
		{/each}
	</ul>
</div>
