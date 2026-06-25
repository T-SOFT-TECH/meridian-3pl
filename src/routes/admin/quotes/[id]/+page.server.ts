import { error, fail } from '@sveltejs/kit';
import { QUOTE_STATUSES } from '$lib/admin/format';
import type { Actions, PageServerLoad } from './$types';

const VALID = QUOTE_STATUSES.map((s) => s.value);

export const load: PageServerLoad = async ({ locals, params }) => {
	const pb = locals.pb;
	const { id } = params;

	let raw: Record<string, unknown>;
	try {
		raw = await pb.collection('quote_requests').getOne(id);
	} catch {
		throw error(404, 'Quote not found');
	}

	const quote = {
		id: raw.id,
		reference: raw.reference as string,
		status: raw.status as string,
		company: raw.company as string,
		contactName: raw.contact_name as string,
		email: raw.email as string,
		phone: raw.phone as string | null,
		website: raw.website as string | null,
		industry: raw.industry as string | null,
		services: raw.services as string[] | null,
		orderVolume: raw.order_volume as string | null,
		skuCount: raw.sku_count as string | null,
		storage: raw.storage as string | null,
		channels: raw.channels as string[] | null,
		currentSetup: raw.current_setup as string | null,
		timeline: raw.timeline as string | null,
		message: raw.message as string | null,
		estimate: raw.estimate,
		assignedTo: raw.assigned_to as string | null,
		createdAt: raw.created as string
	};

	const notesResult = await pb.collection('quote_notes').getFullList({
		filter: `quote_id = "${id}"`,
		sort: '-created',
		expand: 'author_id'
	});

	const notes = notesResult.map((n) => ({
		id: n.id,
		body: n.body as string,
		createdAt: n.created,
		authorName: (n.expand as Record<string, { name?: string }> | undefined)?.author_id?.name ?? null
	}));

	const staffResult = await pb.collection('users').getFullList({ fields: 'id,name' });
	const staff = staffResult.map((u) => ({ id: u.id, name: u.name as string }));

	return { quote, notes, staff };
};

export const actions: Actions = {
	status: async ({ request, locals, params }) => {
		const status = String((await request.formData()).get('status') ?? '');
		if (!VALID.includes(status)) return fail(400, { error: 'Invalid status.' });
		await locals.pb.collection('quote_requests').update(params.id, { status });
		return { ok: true };
	},

	assign: async ({ request, locals, params }) => {
		const assignedTo = String((await request.formData()).get('assignedTo') ?? '');
		await locals.pb
			.collection('quote_requests')
			.update(params.id, { assigned_to: assignedTo || '' });
		return { ok: true };
	},

	note: async ({ request, locals, params }) => {
		const body = String((await request.formData()).get('body') ?? '').trim();
		if (!body) return fail(400, { noteError: 'Write something first.' });
		await locals.pb.collection('quote_notes').create({
			quote_id: params.id,
			author_id: locals.user?.id ?? '',
			body
		});
		return { ok: true };
	}
};
