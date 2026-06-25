import { QUOTE_STATUSES } from '$lib/admin/format';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 20;
const VALID = QUOTE_STATUSES.map((s) => s.value);

export const load: PageServerLoad = async ({ locals, url }) => {
	const pb = locals.pb;
	const status = url.searchParams.get('status') ?? '';
	const q = (url.searchParams.get('q') ?? '').trim();
	const pageNum = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);

	const filterParts: string[] = [];
	if (VALID.includes(status)) filterParts.push(`status = "${status}"`);
	if (q) {
		const escaped = q.replace(/"/g, '\\"');
		filterParts.push(
			`(company ~ "${escaped}" || contact_name ~ "${escaped}" || email ~ "${escaped}" || reference ~ "${escaped}")`
		);
	}
	const filter = filterParts.join(' && ') || undefined;

	const result = await pb.collection('quote_requests').getList(pageNum, PAGE_SIZE, {
		filter,
		sort: '-created'
	});

	// Status count breakdown — fetch all matching records (without pagination) for counts.
	const allForCounts = await pb.collection('quote_requests').getFullList({
		filter,
		fields: 'status'
	});
	const statusCounts: Record<string, number> = {};
	for (const r of allForCounts) {
		statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
	}

	const rows = result.items.map((r) => ({
		id: r.id,
		reference: r.reference as string,
		company: r.company as string,
		contactName: r.contact_name as string,
		email: r.email as string,
		phone: r.phone as string | null,
		website: r.website as string | null,
		industry: r.industry as string | null,
		services: r.services as string[] | null,
		orderVolume: r.order_volume as string | null,
		skuCount: r.sku_count as string | null,
		storage: r.storage as string | null,
		channels: r.channels as string[] | null,
		currentSetup: r.current_setup as string | null,
		timeline: r.timeline as string | null,
		message: r.message as string | null,
		estimate: r.estimate,
		source: r.source as string,
		assignedTo: r.assigned_to as string | null,
		status: r.status as string,
		createdAt: r.created
	}));

	return {
		rows,
		total: result.totalItems,
		all: allForCounts.length,
		statusCounts,
		page: pageNum,
		pageSize: PAGE_SIZE,
		totalPages: result.totalPages,
		filters: { status, q }
	};
};
