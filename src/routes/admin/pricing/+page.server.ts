import { fail } from '@sveltejs/kit';
import {
	getPublishedConfig,
	getVersion,
	listVersions,
	publish,
	saveDraft,
	seedIfEmpty
} from '$lib/server/pricing';
import type { RateCard } from '$lib/pricing/types';
import type { Actions, PageServerLoad } from './$types';

function validateRateCard(card: unknown): string | null {
	if (!card || typeof card !== 'object') return 'Invalid rate card payload.';
	const c = card as Record<string, unknown>;

	const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
	const nonNeg = (v: unknown) => isNum(v) && v >= 0;

	if (!Array.isArray(c.accountTiers) || c.accountTiers.length === 0)
		return 'At least one account tier is required.';
	for (const [i, t] of (c.accountTiers as Record<string, unknown>[]).entries()) {
		if (!t || typeof t !== 'object') return `Account tier ${i + 1} is invalid.`;
		if (typeof t.label !== 'string' || !t.label.trim()) return `Account tier ${i + 1} needs a label.`;
		if (t.maxOrders !== null && !(isNum(t.maxOrders) && t.maxOrders >= 0))
			return `Account tier ${i + 1}: max orders must be ≥ 0 or empty.`;
		if (t.fee !== null && !nonNeg(t.fee)) return `Account tier ${i + 1}: fee must be ≥ 0 or empty.`;
	}

	const checkBands = (bands: unknown, name: string): string | null => {
		if (!Array.isArray(bands) || bands.length === 0) return `${name} bands are required.`;
		let prevMax: number | null = 0;
		for (const [i, raw] of (bands as Record<string, unknown>[]).entries()) {
			if (!raw || typeof raw !== 'object') return `${name} band ${i + 1} is invalid.`;
			const { min, max, rate } = raw;
			if (!nonNeg(rate)) return `${name} band ${i + 1}: rate must be ≥ 0.`;
			if (!isNum(min)) return `${name} band ${i + 1}: min is required.`;
			const expectedMin = i === 0 ? min : (prevMax as number) + 1;
			if (i === 0) {
				if (min < 0) return `${name} band 1: min must be ≥ 0.`;
			} else if (min !== expectedMin) {
				return `${name} bands must be contiguous — band ${i + 1} min should be ${expectedMin}.`;
			}
			if (max !== null) {
				if (!isNum(max)) return `${name} band ${i + 1}: max must be a number or empty.`;
				if (max < min) return `${name} band ${i + 1}: max must be ≥ min.`;
			} else if (i !== bands.length - 1) {
				return `${name}: only the last band may be open-ended.`;
			}
			prevMax = max as number | null;
		}
		return null;
	};
	const storageErr = checkBands(c.storageBands, 'Storage');
	if (storageErr) return storageErr;
	const receivingErr = checkBands(c.receivingBands, 'Receiving');
	if (receivingErr) return receivingErr;

	if (!(isNum(c.storageCustomAbove) && c.storageCustomAbove >= 1))
		return 'Custom-above pallet threshold must be ≥ 1.';
	if (!nonNeg(c.skuSetupFee)) return 'SKU setup fee must be ≥ 0.';

	const pp = c.pickPack as Record<string, unknown> | undefined;
	if (!pp || !nonNeg(pp.firstItem) || !nonNeg(pp.additionalItem))
		return 'Pick & pack fees must be ≥ 0.';

	if (!Array.isArray(c.shippingBands) || c.shippingBands.length === 0)
		return 'At least one shipping band is required.';
	let prevKg = -Infinity;
	for (const [i, raw] of (c.shippingBands as Record<string, unknown>[]).entries()) {
		if (!raw || typeof raw !== 'object') return `Shipping band ${i + 1} is invalid.`;
		if (!(isNum(raw.maxKg) && raw.maxKg > 0)) return `Shipping band ${i + 1}: up-to-kg must be > 0.`;
		if (!nonNeg(raw.price)) return `Shipping band ${i + 1}: price must be ≥ 0.`;
		if (raw.maxKg <= prevKg) return `Shipping bands must ascend by weight — band ${i + 1} is out of order.`;
		prevKg = raw.maxKg;
	}

	const ex = c.extras as Record<string, unknown> | undefined;
	if (!ex || !nonNeg(ex.returns) || !nonNeg(ex.relabel) || !nonNeg(ex.kitting) || !nonNeg(ex.urgent))
		return 'Extras rates must be ≥ 0.';

	return null;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	await seedIfEmpty(locals.user?.id);

	const [published, versions] = await Promise.all([getPublishedConfig(), listVersions()]);

	const editId = url.searchParams.get('edit') ?? '';
	let editing: RateCard = published;
	let editingId: string | null = null;
	if (editId) {
		const row = await getVersion(editId);
		if (row) {
			editing = row.data as RateCard;
			editingId = row.id;
		}
	}

	return { published, versions, editing, editingId };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const fd = await request.formData();
		const raw = String(fd.get('data') ?? '');
		const note = String(fd.get('note') ?? '').trim() || null;

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return fail(400, { error: 'Could not read the rate card data.', data: raw });
		}

		const err = validateRateCard(parsed);
		if (err) return fail(400, { error: err, data: raw });

		const version = await saveDraft(parsed as RateCard, locals.user?.id ?? null, note);
		return { saved: true, version };
	},

	publish: async ({ request }) => {
		const fd = await request.formData();
		const id = String(fd.get('id') ?? '');
		if (!id) return fail(400, { error: 'Invalid version id.' });
		await publish(id);
		return { published: true };
	}
};
