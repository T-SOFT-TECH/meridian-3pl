import { json, type RequestHandler } from '@sveltejs/kit';
import { quoteSchema, calcQuoteSchema } from '$lib/schemas';
import { sendNotification, emailTable } from '$lib/server/email';
import { getPublishedConfig } from '$lib/server/pricing';
import { getServicePb } from '$lib/server/pb';
import { computeQuote } from '$lib/pricing/calculate';

export const prerender = false;

const ref = () => 'MER-' + Date.now().toString(36).toUpperCase().slice(-6);
const orNull = (s?: string) => (s && s.trim() ? s.trim() : null);
const aud = (n: number) =>
	new Intl.NumberFormat('en-AU', {
		style: 'currency',
		currency: 'AUD',
		maximumFractionDigits: 2
	}).format(n);

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request.' }, { status: 400 });
	}

	if (body?.botcheck) return json({ success: true, reference: ref() });

	// ── Calculator submission ──
	if (body?.calc) {
		const c = calcQuoteSchema.safeParse(body);
		if (!c.success) {
			return json({ success: false, error: 'Please check the form and try again.' }, { status: 422 });
		}
		const d = c.data;
		const reference = ref();
		const config = await getPublishedConfig();
		const estimate = computeQuote(d.calc, config);

		try {
			const pb = await getServicePb();
			await pb.collection('quote_requests').create({
				reference,
				status: 'new',
				company: d.company,
				contact_name: d.contact,
				email: d.email,
				phone: orNull(d.phone) ?? '',
				services: [],
				order_volume: `${d.calc.ordersPerMonth.toLocaleString('en-AU')} orders/mo`,
				sku_count: String(d.calc.skuCount),
				storage: `${d.calc.palletsStored} pallets`,
				message: orNull(d.message) ?? '',
				estimate,
				source: 'calculator'
			});
		} catch (e) {
			console.error('[api/quote:calc] create failed:', e);
			return json(
				{ success: false, error: 'We could not save your request. Please try again.' },
				{ status: 500 }
			);
		}

		await sendNotification({
			subject: `New quote (calculator) — ${d.company} (${reference})`,
			replyTo: d.email,
			html: emailTable([
				['Reference', reference],
				['Company', d.company],
				['Contact', d.contact],
				['Email', d.email],
				['Phone', d.phone || '—'],
				['Source', 'Instant calculator'],
				['Orders / month', d.calc.ordersPerMonth.toLocaleString('en-AU')],
				['Items / order', String(d.calc.itemsPerOrder)],
				['Pallets stored', String(d.calc.palletsStored)],
				['Pallets received', String(d.calc.palletsReceived)],
				['Unique SKUs', String(d.calc.skuCount)],
				['Avg weight (kg)', String(d.calc.avgWeightKg)],
				['Monthly total', estimate.custom ? 'Custom — quoted' : aud(estimate.monthlyTotal)],
				['Per order', estimate.custom ? '—' : aud(estimate.perOrderTotal)],
				['One-off SKU setup', aud(estimate.oneOffSetup)],
				['Notes', estimate.notes.join(' · ') || '—'],
				['Message', d.message || '—']
			])
		});

		return json({ success: true, reference });
	}

	// ── Standard quote form ──
	const parsed = quoteSchema.safeParse(body);
	if (!parsed.success) {
		return json({ success: false, error: 'Please check the form and try again.' }, { status: 422 });
	}
	const d = parsed.data;
	const reference = ref();

	try {
		const pb = await getServicePb();
		await pb.collection('quote_requests').create({
			reference,
			status: 'new',
			company: d.company,
			contact_name: d.contact,
			email: d.email,
			phone: orNull(d.phone) ?? '',
			website: orNull(d.website) ?? '',
			industry: d.industry,
			services: d.services,
			order_volume: d.orderVolume,
			sku_count: orNull(d.skuCount) ?? '',
			storage: orNull(d.storage) ?? '',
			channels: d.channels ?? [],
			current_setup: orNull(d.currentSetup) ?? '',
			timeline: d.timeline,
			message: orNull(d.message) ?? '',
			source: 'quote_form'
		});
	} catch (e) {
		console.error('[api/quote] create failed:', e);
		return json(
			{ success: false, error: 'We could not save your request. Please try again.' },
			{ status: 500 }
		);
	}

	await sendNotification({
		subject: `New quote request — ${d.company} (${reference})`,
		replyTo: d.email,
		html: emailTable([
			['Reference', reference],
			['Company', d.company],
			['Contact', d.contact],
			['Email', d.email],
			['Phone', d.phone || '—'],
			['Website', d.website || '—'],
			['Industry', d.industry],
			['Services', d.services.join(', ')],
			['Order volume', d.orderVolume],
			['SKUs', d.skuCount || '—'],
			['Storage', d.storage || '—'],
			['Channels', (d.channels ?? []).join(', ') || '—'],
			['Current setup', d.currentSetup || '—'],
			['Timeline', d.timeline],
			['Notes', d.message || '—']
		])
	});

	return json({ success: true, reference });
};
