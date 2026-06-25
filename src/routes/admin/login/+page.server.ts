import { fail, redirect } from '@sveltejs/kit';
import { ClientResponseError } from 'pocketbase';
import { POCKETBASE_URL } from '$lib/server/pb';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const fd = await request.formData();
		const email = String(fd.get('email') ?? '');
		const password = String(fd.get('password') ?? '');

		try {
			await locals.pb.collection('users').authWithPassword(email, password);
		} catch (e) {
			// Log the *real* cause server-side (auth never touches the browser, so this is the
			// only place to trace it). A status of 0 means the request never reached PocketBase
			// — i.e. a POCKETBASE_URL / connectivity problem, not wrong credentials.
			const reason =
				e instanceof ClientResponseError && e.status === 0
					? `could not reach PocketBase at ${POCKETBASE_URL} (check POCKETBASE_URL + that PocketBase is running)`
					: e instanceof Error
						? e.message
						: String(e);
			console.error(`[admin/login] auth failed for "${email}": ${reason}`);
			return fail(400, { error: 'Invalid email or password.' });
		}

		throw redirect(303, '/admin');
	}
};
