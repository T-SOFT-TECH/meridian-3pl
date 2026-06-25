import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const pb = locals.pb;
	const staffResult = await pb.collection('users').getFullList({ sort: '+created' });
	const staff = staffResult.map((u) => ({
		id: u.id,
		name: u.name as string,
		email: u.email as string,
		role: u.role as string,
		createdAt: u.created
	}));
	return { staff };
};
