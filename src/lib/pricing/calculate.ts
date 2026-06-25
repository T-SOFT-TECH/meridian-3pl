import type { Band, CalcInputs, CalcResult, CalcLine, RateCard, ShippingBand } from './types';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Whole-quantity band lookup: the entire quantity is charged at the matching band's rate. */
function bandRate(qty: number, bands: Band[]): number {
	for (const b of bands) {
		if (qty >= b.min && (b.max === null || qty <= b.max)) return b.rate;
	}
	return 0;
}

/** First band whose upper weight covers the value; falls back to the heaviest band. */
function shippingPrice(weightKg: number, bands: ShippingBand[]): number {
	for (const b of bands) if (weightKg <= b.maxKg) return b.price;
	return bands.length ? bands[bands.length - 1].price : 0;
}

/**
 * Pure pricing engine. Same function on client (live display) and server (authoritative
 * re-compute on submit). Returns monthly + per-order figures and a `custom` flag for the
 * "let's talk" state (3,000+ orders or 56+ pallets).
 */
export function computeQuote(input: CalcInputs, card: RateCard): CalcResult {
	const orders = Math.max(0, Math.floor(input.ordersPerMonth));
	const items = Math.max(1, input.itemsPerOrder);
	const notes: string[] = [];

	// A — account tier by monthly orders
	const tier =
		card.accountTiers.find((t) => t.maxOrders === null || orders <= t.maxOrders) ??
		card.accountTiers[card.accountTiers.length - 1];
	const accountCustom = tier.fee === null;
	const account = tier.fee ?? 0;

	// B — storage (custom beyond capacity)
	const storageCustom = input.palletsStored > card.storageCustomAbove;
	const storage = storageCustom ? 0 : input.palletsStored * bandRate(input.palletsStored, card.storageBands);

	// C — receiving
	const receiving = input.palletsReceived * bandRate(input.palletsReceived, card.receivingBands);

	// D — pick & pack
	const pickPack =
		orders * card.pickPack.firstItem + orders * Math.max(0, items - 1) * card.pickPack.additionalItem;

	// E — shipping
	const shipping = orders * shippingPrice(input.avgWeightKg, card.shippingBands);

	// F — extras
	const extras =
		input.extras.returns * card.extras.returns +
		input.extras.relabel * card.extras.relabel +
		input.extras.kitting * card.extras.kitting +
		input.extras.urgent * card.extras.urgent;
	if (input.extras.customPackaging) notes.push('Custom packaging quoted separately.');

	const oneOffSetup = round2(input.skuCount * card.skuSetupFee);
	const custom = accountCustom || storageCustom;
	if (accountCustom) notes.push('3,000+ orders/month — enterprise pricing quoted.');
	if (storageCustom) notes.push('56+ pallets — beyond current facility capacity, quoted.');

	const per = (v: number) => (orders > 0 ? round2(v / orders) : 0);
	const lines: CalcLine[] = [
		{ key: 'account', label: 'Account fee', monthly: round2(account), perOrder: per(account) },
		{ key: 'storage', label: 'Storage', monthly: round2(storage), perOrder: per(storage) },
		{ key: 'receiving', label: 'Receiving', monthly: round2(receiving), perOrder: per(receiving) },
		{ key: 'pickpack', label: 'Pick & pack', monthly: round2(pickPack), perOrder: per(pickPack) },
		{ key: 'extras', label: 'Extras', monthly: round2(extras), perOrder: per(extras) },
		{ key: 'shipping', label: 'Shipping', monthly: round2(shipping), perOrder: per(shipping) }
	];

	const fulfilmentMonthly = account + storage + receiving + pickPack + extras;
	const monthlyTotal = fulfilmentMonthly + shipping;

	return {
		lines,
		monthlyTotal: round2(monthlyTotal),
		perOrderTotal: per(monthlyTotal),
		fulfilmentPerOrder: per(fulfilmentMonthly),
		oneOffSetup,
		custom,
		notes,
		tierLabel: tier.label
	};
}
