/**
 * Idempotent: ensures the dedicated **service account** exists — a normal `users` (staff)
 * record the SvelteKit server authenticates as via getServicePb() for public quote/contact
 * writes and pricing reads. NOT a superadmin (least privilege).
 *
 * Creating a `users` record requires the superadmin (users.create is superuser-only), so this
 * one-off provisioning script uses it; the running app never does.
 *
 * Run from the project root:  node backend/setup-service-account.mjs
 */
import PocketBase from 'pocketbase';

const PB_URL = process.env.POCKETBASE_URL || process.env.PB_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'info@tsoftechnologies.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'Cove186haw041!!@@##';
const SERVICE_EMAIL = process.env.PB_SERVICE_EMAIL || 'service@meridian3pl.com.au';
const SERVICE_PASSWORD = process.env.PB_SERVICE_PASSWORD || 'Sv-Meridian-3PL-2026';

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

async function main() {
	await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
	console.log('✓ Authenticated as superadmin');

	const existing = await pb
		.collection('users')
		.getList(1, 1, { filter: `email = "${SERVICE_EMAIL}"` });

	if (existing.totalItems > 0) {
		console.log(`• service account already exists: ${SERVICE_EMAIL} (id ${existing.items[0].id})`);
		return;
	}

	const rec = await pb.collection('users').create({
		email: SERVICE_EMAIL,
		password: SERVICE_PASSWORD,
		passwordConfirm: SERVICE_PASSWORD,
		name: 'Service Account',
		role: 'staff',
		emailVisibility: false,
		verified: true
	});
	console.log(`✓ created service account: ${SERVICE_EMAIL} (id ${rec.id})`);
}

main().catch((err) => {
	console.error('\n❌ Failed:', err?.message ?? err);
	if (err?.response) console.error(JSON.stringify(err.response, null, 2));
	process.exit(1);
});
