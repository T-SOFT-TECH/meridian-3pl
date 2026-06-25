<script lang="ts">
	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		display: string;
		hint?: string;
	}

	let { label, value = $bindable(), min, max, step = 1, display, hint }: Props = $props();

	const pct = $derived(Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)));
</script>

<div class="select-none">
	<div class="flex items-baseline justify-between gap-3">
		<span class="eyebrow text-navy-950/55">{label}</span>
		<span class="font-mono text-base font-medium text-navy-950 tabular-nums">{display}</span>
	</div>
	<input
		type="range"
		{min}
		{max}
		{step}
		bind:value
		aria-label={label}
		style="--pct: {pct}%"
		class="range mt-2.5"
	/>
	{#if hint}
		<p class="mt-1.5 font-mono text-[10px] tracking-wide text-navy-950/35">{hint}</p>
	{/if}
</div>

<style>
	.range {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 5px;
		border-radius: 999px;
		cursor: pointer;
		background-color: rgb(7 10 38 / 0.12);
		background-image: linear-gradient(#f5a623, #f5a623);
		background-repeat: no-repeat;
		background-size: var(--pct) 100%;
		outline: none;
	}
	.range:focus-visible {
		box-shadow: 0 0 0 3px rgb(245 166 35 / 0.35);
	}
	.range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 19px;
		height: 19px;
		border-radius: 999px;
		background: #f5a623;
		border: 3px solid #fbfaf7;
		box-shadow: 0 2px 8px rgb(7 10 38 / 0.35);
		transition: transform 0.15s ease;
	}
	.range:active::-webkit-slider-thumb {
		transform: scale(1.15);
	}
	.range::-moz-range-thumb {
		width: 19px;
		height: 19px;
		border-radius: 999px;
		background: #f5a623;
		border: 3px solid #fbfaf7;
		box-shadow: 0 2px 8px rgb(7 10 38 / 0.35);
	}
	.range::-moz-range-track {
		height: 5px;
		border-radius: 999px;
		background: rgb(7 10 38 / 0.12);
	}
	.range::-moz-range-progress {
		height: 5px;
		border-radius: 999px;
		background: #f5a623;
	}
	@media (prefers-reduced-motion: reduce) {
		.range::-webkit-slider-thumb {
			transition: none;
		}
	}
</style>
