export function fmtDate(d: Date | string | null | undefined): string {
	if (!d) return '—';
	const date = typeof d === 'string' ? new Date(d) : d;
	return date.toLocaleString('en-AU', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function fmtDateShort(d: Date | string | null | undefined): string {
	if (!d) return '—';
	const date = typeof d === 'string' ? new Date(d) : d;
	return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

export interface StatusMeta {
	value: string;
	label: string;
	badge: string;
}

export const QUOTE_STATUSES: StatusMeta[] = [
	{ value: 'new', label: 'New', badge: 'bg-amber-500 text-navy-950' },
	{ value: 'contacted', label: 'Contacted', badge: 'bg-navy-200 text-navy-900' },
	{ value: 'quoted', label: 'Quoted', badge: 'bg-navy-700 text-white' },
	{ value: 'won', label: 'Won', badge: 'bg-green-600 text-white' },
	{ value: 'lost', label: 'Lost', badge: 'bg-navy-950/15 text-navy-950/60' }
];

export const MESSAGE_STATUSES: StatusMeta[] = [
	{ value: 'unread', label: 'Unread', badge: 'bg-amber-500 text-navy-950' },
	{ value: 'read', label: 'Read', badge: 'bg-navy-200 text-navy-900' },
	{ value: 'archived', label: 'Archived', badge: 'bg-navy-950/15 text-navy-950/60' },
	{ value: 'spam', label: 'Spam', badge: 'bg-red-600 text-white' }
];

export const quoteStatusMeta = (v: string): StatusMeta =>
	QUOTE_STATUSES.find((s) => s.value === v) ?? QUOTE_STATUSES[0];

export const messageStatusMeta = (v: string): StatusMeta =>
	MESSAGE_STATUSES.find((s) => s.value === v) ?? MESSAGE_STATUSES[0];
