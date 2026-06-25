import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';

export const PB_URL = (env.PB_URL ?? 'http://127.0.0.1:8090').replace(/\/$/, '');

/** Create a fresh unauthenticated PocketBase instance (used in hooks.server.ts per request). */
export function createPb(): PocketBase {
	return new PocketBase(PB_URL);
}

// Module-level superadmin singleton — re-authenticates 5 min before the 1-hour JWT expires.
let _adminPb: PocketBase | null = null;
let _adminExpiry = 0;

/**
 * Returns a PocketBase instance authenticated as the PocketBase superadmin.
 * Used for server-side operations that don't have a user context:
 * public API endpoints, the first-run setup route, and pricing helpers.
 */
export async function getAdminPb(): Promise<PocketBase> {
	const now = Date.now();
	if (_adminPb && now < _adminExpiry) return _adminPb;

	const pb = new PocketBase(PB_URL);
	await pb.admins.authWithPassword(env.PB_ADMIN_EMAIL ?? '', env.PB_ADMIN_PASSWORD ?? '');

	_adminPb = pb;
	_adminExpiry = now + 55 * 60 * 1000;
	return pb;
}
