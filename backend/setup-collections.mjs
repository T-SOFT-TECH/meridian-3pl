/**
 * One-off setup script: creates all Meridian 3PL collections in PocketBase.
 * Idempotent — skips collections that already exist, and only adds missing
 * fields to the existing `users` auth collection.
 *
 * Run from the project root:  node backend/setup-collections.mjs
 */
import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'info@tsoftechnologies.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'Cove186haw041!!@@##';

const AUTH_RULE = '@request.auth.id != ""';
const text = (name, required = false) => ({ name, type: 'text', required, max: 0 });
const json = (name, required = false) => ({ name, type: 'json', required, maxSize: 2000000 });
const autodate = (name, onUpdate) => ({ name, type: 'autodate', onCreate: true, onUpdate });

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

async function main() {
	await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
	console.log('✓ Authenticated as superadmin');

	// ── 1. users (existing auth collection) — add name + role, tighten rules ────
	const users = await pb.collections.getOne('users');
	const userFieldNames = new Set(users.fields.map((f) => f.name));
	const newUserFields = [...users.fields];
	if (!userFieldNames.has('name')) newUserFields.push(text('name', true));
	if (!userFieldNames.has('role'))
		newUserFields.push({ name: 'role', type: 'select', required: false, maxSelect: 1, values: ['staff', 'admin'] });
	await pb.collections.update(users.id, {
		fields: newUserFields,
		// Any authenticated staff can list/view staff (assignment dropdown + settings list).
		listRule: AUTH_RULE,
		viewRule: AUTH_RULE,
		// Block public self-registration — accounts are created only by the superadmin
		// (via the /admin/setup route, which uses getAdminPb()).
		createRule: null,
		updateRule: null,
		deleteRule: null
	});
	console.log('✓ users — name/role fields + staff-only rules');
	const usersId = users.id;

	// helper: create a base collection if it doesn't exist ----------------------
	async function ensure(name, fields, { indexes = [] } = {}) {
		try {
			const existing = await pb.collections.getOne(name);
			console.log(`• ${name} — already exists (id ${existing.id})`);
			return existing.id;
		} catch {
			/* not found → create */
		}
		const created = await pb.collections.create({
			name,
			type: 'base',
			listRule: AUTH_RULE,
			viewRule: AUTH_RULE,
			createRule: AUTH_RULE,
			updateRule: AUTH_RULE,
			deleteRule: AUTH_RULE,
			fields: [...fields, autodate('created', false), autodate('updated', true)],
			indexes
		});
		console.log(`✓ ${name} — created (id ${created.id})`);
		return created.id;
	}

	// ── 2. quote_requests ──────────────────────────────────────────────────────
	const quoteRequestsId = await ensure(
		'quote_requests',
		[
			text('reference', true),
			{ name: 'status', type: 'select', required: true, maxSelect: 1, values: ['new', 'contacted', 'quoted', 'won', 'lost'] },
			text('company', true),
			text('contact_name', true),
			{ name: 'email', type: 'email', required: true },
			text('phone'),
			{ name: 'website', type: 'url', required: false },
			text('industry'),
			json('services'),
			text('order_volume'),
			text('sku_count'),
			text('storage'),
			json('channels'),
			text('current_setup'),
			text('timeline'),
			text('message'),
			json('estimate'),
			text('source'),
			{ name: 'assigned_to', type: 'relation', required: false, maxSelect: 1, collectionId: usersId, cascadeDelete: false }
		],
		{ indexes: ['CREATE UNIQUE INDEX `idx_quote_reference` ON `quote_requests` (`reference`)'] }
	);

	// ── 3. quote_notes ─────────────────────────────────────────────────────────
	await ensure('quote_notes', [
		{ name: 'quote_id', type: 'relation', required: true, maxSelect: 1, collectionId: quoteRequestsId, cascadeDelete: true },
		{ name: 'author_id', type: 'relation', required: false, maxSelect: 1, collectionId: usersId, cascadeDelete: false },
		text('body', true)
	]);

	// ── 4. contact_messages ────────────────────────────────────────────────────
	await ensure('contact_messages', [
		text('name', true),
		{ name: 'email', type: 'email', required: true },
		text('phone'),
		text('message', true),
		{ name: 'status', type: 'select', required: true, maxSelect: 1, values: ['unread', 'read', 'archived', 'spam'] },
		text('source')
	]);

	// ── 5. pricing_config ──────────────────────────────────────────────────────
	await ensure('pricing_config', [
		{ name: 'version', type: 'number', required: true },
		json('data', true),
		{ name: 'is_published', type: 'bool', required: false },
		{ name: 'effective_from', type: 'date', required: false },
		text('note'),
		{ name: 'created_by', type: 'relation', required: false, maxSelect: 1, collectionId: usersId, cascadeDelete: false }
	]);

	// ── 6. settings ────────────────────────────────────────────────────────────
	await ensure('settings', [text('key', true), json('value')], {
		indexes: ['CREATE UNIQUE INDEX `idx_settings_key` ON `settings` (`key`)']
	});

	console.log('\n✅ All collections ready.');
}

main().catch((err) => {
	console.error('\n❌ Setup failed:', err?.message ?? err);
	if (err?.response) console.error(JSON.stringify(err.response, null, 2));
	process.exit(1);
});
