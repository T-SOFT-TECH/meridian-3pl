import type { LayoutServerLoad } from './$types';

// The admin area is dynamic and authenticated — never prerender it.
export const prerender = false;
export const ssr = true;

export const load: LayoutServerLoad = async ({ locals }) => {
	return { user: locals.user };
};
