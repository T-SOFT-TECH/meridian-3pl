<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { form } = $props();
	let loading = $state(false);

	const welcomed = $derived(page.url.searchParams.get('welcome') === '1');
</script>

<svelte:head><title>Sign in — Meridian 3PL Admin</title></svelte:head>

<div class="flex min-h-svh items-center justify-center px-5 py-16">
	<div class="w-full max-w-md">
		<img src="/logo/meridian-3pl-white-logo.webp" alt="Meridian 3PL" class="mx-auto h-14 w-auto" />
		<p class="eyebrow mt-8 text-center text-amber-500">Admin access</p>
		<h1 class="display mt-4 text-center text-3xl text-white">
			Welcome <span class="serif-accent text-amber-500">back.</span>
		</h1>

		{#if welcomed}
			<p class="mt-6 border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-200">
				Account created — sign in to continue.
			</p>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="mt-8 space-y-5"
		>
			{#if form?.error}
				<p class="border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">{form.error}</p>
			{/if}
			<div>
				<label class="eyebrow mb-2 block text-white/60" for="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					autocomplete="email"
					class="w-full border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
					placeholder="you@meridian3pl.com.au"
				/>
			</div>
			<div>
				<label class="eyebrow mb-2 block text-white/60" for="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autocomplete="current-password"
					class="w-full border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
					placeholder="••••••••••"
				/>
			</div>
			<button
				type="submit"
				disabled={loading}
				class="btn-label w-full bg-amber-500 py-4 text-navy-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
			>
				{loading ? 'Signing in…' : 'Sign in'}
			</button>
		</form>
	</div>
</div>
