import { MESSAGE_STATUSES } from '$lib/admin/format';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 25;
const VALID = MESSAGE_STATUSES.map((s) => s.value);

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const status = url.searchParams.get('status') ?? '';
	const q = (url.searchParams.get('q') ?? '').trim();
	const pageNum = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);

	const filterParts: string[] = [];
	if (VALID.includes(status)) filterParts.push(`status = "${status}"`);
	if (q) {
		const escaped = q.replace(/"/g, '\\"');
		filterParts.push(`(name ~ "${escaped}" || email ~ "${escaped}" || message ~ "${escaped}")`);
	}
	const filter = filterParts.join(' && ') || undefined;

	const result = await pb.collection('contact_messages').getList(pageNum, PAGE_SIZE, {
		filter,
		sort: '-created'
	});

	const allForCounts = await pb.collection('contact_messages').getFullList({
		filter,
		fields: 'status'
	});
	const statusCounts: Record<string, number> = {};
	for (const r of allForCounts) {
		statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
	}

	const rows = result.items.map((r) => ({
		id: r.id,
		name: r.name as string,
		email: r.email as string,
		phone: r.phone as string | null,
		message: r.message as string,
		status: r.status as string,
		source: r.source as string,
		createdAt: r.created
	}));

	return {
		rows,
		total: result.totalItems,
		all: allForCounts.length,
		statusCounts,
		page: pageNum,
		totalPages: result.totalPages,
		filters: { status, q }
	};
};
