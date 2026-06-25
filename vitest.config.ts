import { defineConfig } from 'vitest/config';

// Standalone Vitest config — deliberately does NOT load the SvelteKit plugin.
// The pricing engine is pure TypeScript with no Svelte/`$lib` dependencies, so
// running it bare keeps the suite fast and avoids a full `svelte-kit sync`.
export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.ts'],
		environment: 'node'
	}
});
