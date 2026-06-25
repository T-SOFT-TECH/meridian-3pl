import { QUOTE_STATUSES } from '$lib/admin/format';
import type { RequestHandler } from './$types';

export const prerender = false;

const VALID = QUOTE_STATUSES.map((s) => s.value);

function cell(v: unknown): string {
	const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v);
	return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET: RequestHandler = async ({ locals, url }) => {
	const pb = locals.pb;
	const status = url.searchParams.get('status') ?? '';
	const q = (url.searchParams.get('q') ?? '').trim();

	const filterParts: string[] = [];
	if (VALID.includes(status)) filterParts.push(`status = "${status}"`);
	if (q) {
		const escaped = q.replace(/"/g, '\\"');
		filterParts.push(
			`(company ~ "${escaped}" || contact_name ~ "${escaped}" || email ~ "${escaped}" || reference ~ "${escaped}")`
		);
	}
	const filter = filterParts.join(' && ') || undefined;

	const rows = await pb.collection('quote_requests').getFullList({ filter, sort: '-created' });

	const headers = [
		'Reference', 'Status', 'Company', 'Contact', 'Email', 'Phone', 'Website',
		'Industry', 'Services', 'Order volume', 'SKUs', 'Storage', 'Channels',
		'Current setup', 'Timeline', 'Message', 'Received'
	];
	const lines = [headers.join(',')];
	for (const r of rows) {
		lines.push(
			[
				r.reference, r.status, r.company, r.contact_name, r.email, r.phone, r.website,
				r.industry, r.services, r.order_volume, r.sku_count, r.storage, r.channels,
				r.current_setup, r.timeline, r.message,
				r.created ? new Date(r.created).toISOString() : ''
			]
				.map(cell)
				.join(',')
		);
	}

	const csv = '﻿' + lines.join('\r\n');
	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="meridian-quotes-${new Date().toISOString().slice(0, 10)}.csv"`
		}
	});
};
