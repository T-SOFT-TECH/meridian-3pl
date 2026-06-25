import { describe, it, expect } from 'vitest';
import { computeQuote } from './calculate';
import { DEFAULT_RATE_CARD } from './default-config';
import type { CalcInputs } from './types';

/**
 * Acceptance tests for the pricing engine (Phase 2A / 2D gate).
 *
 * The headline test reproduces the approved worked example from the
 * implementation plan exactly — monthly AND per-order — and the build is not
 * "done" until these numbers match. The remaining tests pin the band edges and
 * the custom-pricing flags the plan calls out by name.
 *
 * All cases run against DEFAULT_RATE_CARD (the approved formula v1).
 */

/** Build CalcInputs from the worked-example baseline, with per-test overrides. */
function inputs(overrides: Partial<CalcInputs> = {}): CalcInputs {
	return {
		ordersPerMonth: 600,
		itemsPerOrder: 1.8,
		palletsStored: 12,
		palletsReceived: 8,
		skuCount: 60,
		avgWeightKg: 1.2,
		extras: { returns: 30, relabel: 0, kitting: 0, urgent: 0, customPackaging: false },
		...overrides
	};
}

/** Pull a single line out of the result by key. */
const line = (r: ReturnType<typeof computeQuote>, key: string) =>
	r.lines.find((l) => l.key === key)!;

describe('computeQuote — approved worked example', () => {
	// 600 orders/mo · 1.8 items · 12 pallets stored · 8 received · 60 SKUs · 1.2 kg · 30 returns
	const r = computeQuote(inputs(), DEFAULT_RATE_CARD);

	it('selects the Starter tier and is not custom', () => {
		expect(r.tierLabel).toBe('Starter');
		expect(r.custom).toBe(false);
	});

	it('matches every line — monthly and per-order', () => {
		expect(line(r, 'account')).toMatchObject({ monthly: 299, perOrder: 0.5 });
		expect(line(r, 'storage')).toMatchObject({ monthly: 420, perOrder: 0.7 }); // 12 × $35
		expect(line(r, 'receiving')).toMatchObject({ monthly: 176, perOrder: 0.29 }); // 8 × $22
		expect(line(r, 'pickpack')).toMatchObject({ monthly: 2340, perOrder: 3.9 }); // 2,100 + 240
		expect(line(r, 'extras')).toMatchObject({ monthly: 210, perOrder: 0.35 }); // 30 × $7
		expect(line(r, 'shipping')).toMatchObject({ monthly: 6900, perOrder: 11.5 }); // 600 × $11.50
	});

	it('matches the fulfilment subtotal (everything except shipping), per order', () => {
		// $3,445 / 600 = $5.74
		expect(r.fulfilmentPerOrder).toBe(5.74);
	});

	it('matches the all-in totals — $10,345 / mo and $17.24 / order', () => {
		expect(r.monthlyTotal).toBe(10345);
		expect(r.perOrderTotal).toBe(17.24);
	});

	it('returns the one-off SKU setup separately — 60 × $2.20 = $132', () => {
		expect(r.oneOffSetup).toBe(132);
	});
});

describe('band edges', () => {
	it('storage flips rate at the 10 → 11 pallet edge (whole-quantity rule)', () => {
		// 10 pallets → 1–10 band ($40); 11 pallets → 11–25 band ($35) on the WHOLE quantity.
		const ten = computeQuote(inputs({ palletsStored: 10 }), DEFAULT_RATE_CARD);
		const eleven = computeQuote(inputs({ palletsStored: 11 }), DEFAULT_RATE_CARD);
		expect(line(ten, 'storage').monthly).toBe(400); // 10 × $40
		expect(line(eleven, 'storage').monthly).toBe(385); // 11 × $35, not a split charge
	});

	it('shipping flips band at the 0.5 → 0.501 kg edge (inclusive upper bound)', () => {
		// maxKg is the inclusive upper bound: 0.5 kg → $8.50; 0.501 kg → next band ($10.50).
		const atEdge = computeQuote(inputs({ ordersPerMonth: 1, avgWeightKg: 0.5 }), DEFAULT_RATE_CARD);
		const overEdge = computeQuote(
			inputs({ ordersPerMonth: 1, avgWeightKg: 0.501 }),
			DEFAULT_RATE_CARD
		);
		expect(line(atEdge, 'shipping').monthly).toBe(8.5);
		expect(line(overEdge, 'shipping').monthly).toBe(10.5);
	});

	it('charges zero additional-item fee when items per order is exactly 1.0', () => {
		// pick & pack = orders × firstItem only; the (items − 1) term must be 0, not negative.
		const r = computeQuote(inputs({ ordersPerMonth: 600, itemsPerOrder: 1.0 }), DEFAULT_RATE_CARD);
		expect(line(r, 'pickpack').monthly).toBe(2100); // 600 × $3.50, no additional-item charge
	});
});

describe('custom-pricing flags', () => {
	it('stays priced at the Growth boundary (3,000 orders → $499, not custom)', () => {
		const r = computeQuote(inputs({ ordersPerMonth: 3000 }), DEFAULT_RATE_CARD);
		expect(r.tierLabel).toBe('Growth');
		expect(r.custom).toBe(false);
		expect(line(r, 'account').monthly).toBe(499);
	});

	it('goes custom above the order ceiling (3,001 orders) with a zero account line', () => {
		const r = computeQuote(inputs({ ordersPerMonth: 3001 }), DEFAULT_RATE_CARD);
		expect(r.custom).toBe(true);
		expect(line(r, 'account').monthly).toBe(0);
		expect(r.notes.some((n) => n.includes('enterprise pricing'))).toBe(true);
	});

	it('stays priced at the storage capacity edge (55 pallets)', () => {
		const r = computeQuote(inputs({ palletsStored: 55 }), DEFAULT_RATE_CARD);
		expect(r.custom).toBe(false);
		expect(line(r, 'storage').monthly).toBe(1650); // 55 × $30
	});

	it('goes custom beyond facility capacity (56 pallets) with a zero storage line', () => {
		const r = computeQuote(inputs({ palletsStored: 56 }), DEFAULT_RATE_CARD);
		expect(r.custom).toBe(true);
		expect(line(r, 'storage').monthly).toBe(0);
		expect(r.notes.some((n) => n.includes('facility capacity'))).toBe(true);
	});
});
