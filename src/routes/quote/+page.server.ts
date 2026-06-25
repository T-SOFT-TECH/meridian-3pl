import { getPublishedConfig } from '$lib/server/pricing';
import type { PageServerLoad } from './$types';

// Dynamic so the calculator always reflects the currently published rate card.
export const prerender = false;

export const load: PageServerLoad = async () => {
	return { config: await getPublishedConfig() };
};
