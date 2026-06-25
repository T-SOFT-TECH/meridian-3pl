import type { RateCard } from './types';

/**
 * The approved formula (v1). Seeded as the first published rate card on first run.
 * ⚠️ Shipping bands are placeholders until Meridian's courier rate card is supplied —
 * fully editable in the admin Pricing Manager.
 */
export const DEFAULT_RATE_CARD: RateCard = {
	version: 1,
	currency: 'AUD',
	accountTiers: [
		{ id: 'starter', label: 'Starter', maxOrders: 999, fee: 299 },
		{ id: 'growth', label: 'Growth', maxOrders: 3000, fee: 499 },
		{ id: 'custom', label: 'Custom', maxOrders: null, fee: null }
	],
	storageBands: [
		{ min: 1, max: 10, rate: 40 },
		{ min: 11, max: 25, rate: 35 },
		{ min: 26, max: 55, rate: 30 }
	],
	storageCustomAbove: 55,
	receivingBands: [
		{ min: 1, max: 10, rate: 22 },
		{ min: 11, max: 30, rate: 18 },
		{ min: 31, max: null, rate: 15 }
	],
	skuSetupFee: 2.2,
	pickPack: { firstItem: 3.5, additionalItem: 0.5 },
	shippingBands: [
		{ maxKg: 0.5, price: 8.5 },
		{ maxKg: 1, price: 10.5 },
		{ maxKg: 2, price: 11.5 },
		{ maxKg: 3, price: 12.5 },
		{ maxKg: 5, price: 14.5 },
		{ maxKg: 10, price: 18.5 },
		{ maxKg: 15, price: 24 },
		{ maxKg: 22, price: 30 }
	],
	extras: { returns: 7, relabel: 1, kitting: 0.8, urgent: 50 }
};
