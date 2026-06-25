import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const fd = await request.formData();
		const email = String(fd.get('email') ?? '');
		const password = String(fd.get('password') ?? '');

		try {
			await locals.pb.collection('users').authWithPassword(email, password);
		} catch {
			return fail(400, { error: 'Invalid email or password.' });
		}

		throw redirect(303, '/admin');
	}
};
