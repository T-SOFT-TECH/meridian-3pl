import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

// Canonical name is POCKETBASE_URL — it's what the deploy platform injects (alongside
// PUBLIC_POCKETBASE_URL) as the in-network service address, e.g. http://pocketbase:8090.
// PB_URL is kept as a legacy fallback so older .env files keep working.
export const POCKETBASE_URL = (
	env.POCKETBASE_URL ??
	env.PB_URL ??
	'http://127.0.0.1:8090'
).replace(/\/$/, '');

/** Create a fresh unauthenticated PocketBase instance (used in hooks.server.ts per request). */
export function createPb(): PocketBase {
	return new PocketBase(POCKETBASE_URL);
}

// Module-level service-account singleton, re-authenticated periodically.
let _servicePb: PocketBase | null = null;
let _serviceExpiry = 0;

/**
 * Returns a PocketBase instance authenticated as the dedicated **service account** — a normal
 * `users` record (NOT a superadmin). Used for server-side operations that have no end-user
 * context: the public quote/contact write endpoints and the pricing helpers.
 *
 * Least privilege by design: this token can only do what the collections' API rules allow
 * (create on the auth-gated quote/contact/pricing collections). It cannot touch schema, rules,
 * or the `users` table — so a leak is recoverable, unlike a leaked superadmin token.
 *
 * Requires `PB_SERVICE_EMAIL` / `PB_SERVICE_PASSWORD` for a staff account that exists in the
 * target PocketBase instance.
 */
export async function getServicePb(): Promise<PocketBase> {
	const now = Date.now();
	if (_servicePb && now < _serviceExpiry) return _servicePb;

	const pb = new PocketBase(POCKETBASE_URL);
	try {
		await pb
			.collection('users')
			.authWithPassword(env.PB_SERVICE_EMAIL ?? '', env.PB_SERVICE_PASSWORD ?? '');
	} catch (e) {
		// Surfaces the most common deploy mistake: env vars not present in the live process.
		console.error(
			`[pb] service-account auth failed against ${POCKETBASE_URL} ` +
				`(PB_SERVICE_EMAIL set=${!!env.PB_SERVICE_EMAIL}, PB_SERVICE_PASSWORD set=${!!env.PB_SERVICE_PASSWORD}): ` +
				(e instanceof Error ? e.message : String(e))
		);
		throw e;
	}

	_servicePb = pb;
	_serviceExpiry = now + 55 * 60 * 1000;
	return pb;
}
