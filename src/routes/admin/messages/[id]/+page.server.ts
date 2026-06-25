import { error, fail } from '@sveltejs/kit';
import { MESSAGE_STATUSES } from '$lib/admin/format';
import type { Actions, PageServerLoad } from './$types';

const VALID = MESSAGE_STATUSES.map((s) => s.value);

export const load: PageServerLoad = async ({ locals, params }) => {
	const pb = locals.pb;
	const { id } = params;

	let raw: Record<string, unknown>;
	try {
		raw = await pb.collection('contact_messages').getOne(id);
	} catch {
		throw error(404, 'Message not found');
	}

	if (raw.status === 'unread') {
		await pb.collection('contact_messages').update(id, { status: 'read' });
		raw.status = 'read';
	}

	const message = {
		id: raw.id,
		name: raw.name as string,
		email: raw.email as string,
		phone: raw.phone as string | null,
		message: raw.message as string,
		status: raw.status as string,
		source: raw.source as string,
		createdAt: raw.created as string
	};

	return { message };
};

export const actions: Actions = {
	status: async ({ request, locals, params }) => {
		const status = String((await request.formData()).get('status') ?? '');
		if (!VALID.includes(status)) return fail(400, { error: 'Invalid status.' });
		await locals.pb.collection('contact_messages').update(params.id, { status });
		return { ok: true };
	}
};
