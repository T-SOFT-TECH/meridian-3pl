import { fail, redirect } from '@sveltejs/kit';
import { getAdminPb } from '$lib/server/pb';
import type { Actions, PageServerLoad } from './$types';

async function hasUsers(): Promise<boolean> {
	const pb = await getAdminPb();
	const result = await pb.collection('users').getList(1, 1);
	return result.totalItems > 0;
}

export const load: PageServerLoad = async () => {
	if (await hasUsers()) throw redirect(303, '/admin/login');
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		if (await hasUsers()) throw redirect(303, '/admin/login');

		const fd = await request.formData();
		const name = String(fd.get('name') ?? '').trim();
		const email = String(fd.get('email') ?? '').trim().toLowerCase();
		const password = String(fd.get('password') ?? '');
		const confirm = String(fd.get('confirm') ?? '');

		const values = { name, email };

		if (!name || !email) return fail(400, { error: 'Name and email are required.', ...values });
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return fail(400, { error: 'Enter a valid email address.', ...values });
		if (password.length < 10)
			return fail(400, { error: 'Password must be at least 10 characters.', ...values });
		if (password !== confirm)
			return fail(400, { error: 'Passwords do not match.', ...values });

		try {
			const pb = await getAdminPb();
			await pb.collection('users').create({
				email,
				password,
				passwordConfirm: password,
				name,
				role: 'admin',
				emailVisibility: true
			});
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Could not create the account.';
			return fail(400, { error: message, ...values });
		}

		throw redirect(303, '/admin/login?welcome=1');
	}
};
