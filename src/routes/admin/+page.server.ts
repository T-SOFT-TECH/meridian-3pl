import type { PageServerLoad } from './$types';
import type { CalcResult } from '$lib/pricing/types';

const QUOTE_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
const WEEKS = 8;

export const load: PageServerLoad = async ({ locals }) => {
	const pb = locals.pb;

	const [quotesResult, messagesResult] = await Promise.all([
		pb.collection('quote_requests').getFullList({
			sort: '-created',
			fields: 'id,reference,company,status,source,industry,estimate,created'
		}),
		pb.collection('contact_messages').getFullList({
			sort: '-created',
			fields: 'id,name,status,created'
		})
	]);

	// ── Status breakdown + pipeline value + source split + industries ──
	const statusCounts: Record<string, number> = Object.fromEntries(
		QUOTE_STATUSES.map((s) => [s, 0])
	);
	const sourceCounts = { calculator: 0, quote_form: 0 };
	const industryMap = new Map<string, number>();
	let pipelineValue = 0;

	for (const q of quotesResult) {
		if (q.status in statusCounts) statusCounts[q.status]++;
		if (q.source === 'calculator') sourceCounts.calculator++;
		else sourceCounts.quote_form++;
		if (q.industry) industryMap.set(q.industry, (industryMap.get(q.industry) ?? 0) + 1);
		const est = q.estimate as CalcResult | null;
		if (est && !est.custom && q.status !== 'lost') pipelineValue += est.monthlyTotal ?? 0;
	}

	const industryTop = [...industryMap.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 6);

	// ── Quotes per week, last 8 weeks (bucketed in JS) ──
	const now = new Date();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const weekly = Array.from({ length: WEEKS }, (_, j) => {
		const d = new Date(today);
		d.setDate(d.getDate() - (WEEKS - 1 - j) * 7);
		return { label: d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }), value: 0 };
	});
	for (const q of quotesResult) {
		const days = Math.floor((now.getTime() - new Date(q.created).getTime()) / 86_400_000);
		const wk = Math.floor(days / 7);
		if (wk >= 0 && wk < WEEKS) weekly[WEEKS - 1 - wk].value++;
	}

	const won = statusCounts.won;
	const lost = statusCounts.lost;
	const messagesUnread = messagesResult.filter((m) => m.status === 'unread').length;

	const recentQuotes = quotesResult.slice(0, 6).map((q) => ({
		id: q.id,
		company: q.company,
		status: q.status,
		createdAt: q.created
	}));

	const recentMessages = messagesResult.slice(0, 6).map((m) => ({
		id: m.id,
		name: m.name,
		status: m.status,
		createdAt: m.created
	}));

	return {
		stats: {
			quotesTotal: quotesResult.length,
			quotesNew: statusCounts.new,
			won,
			lost,
			conversionRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0,
			pipelineValue: Math.round(pipelineValue),
			messagesTotal: messagesResult.length,
			messagesUnread
		},
		statusCounts,
		sourceCounts,
		industryTop,
		weekly,
		recentQuotes,
		recentMessages
	};
};
