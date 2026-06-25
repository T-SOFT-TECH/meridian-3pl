<script lang="ts">
	interface Props {
		items: readonly string[];
		class?: string;
	}

	let { items, class: className = '' }: Props = $props();
</script>

<!--
	Infinite ticker: the track holds two copies of the list and translates -50%.
	Under prefers-reduced-motion the animation stops and the duplicate is hidden.
-->
<div class={['overflow-hidden whitespace-nowrap', className]}>
	<div class="flex w-max motion-safe:animate-marquee motion-reduce:w-full motion-reduce:flex-wrap">
		{#each [0, 1] as copy (copy)}
			<ul
				class={['flex shrink-0 items-center', copy === 1 && 'motion-reduce:hidden']}
				aria-hidden={copy === 1}
			>
				{#each items as item, i (i)}
					<li class="flex items-center">
						<span class="display px-6 text-2xl text-current sm:text-3xl">{item}</span>
						<svg class="h-2.5 w-2.5 text-amber-500" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
							<path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" />
						</svg>
					</li>
				{/each}
			</ul>
		{/each}
	</div>
</div>
