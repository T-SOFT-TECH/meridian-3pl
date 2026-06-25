/**
 * Pricing calculator — shared types.
 * The RateCard is the single source of truth, stored as JSON in pricing_config.data
 * and edited via the admin Pricing Manager. The engine (calculate.ts) is pure and
 * consumes a RateCard + CalcInputs, used identically on client and server.
 */

export interface AccountTier {
	id: string;
	label: string;
	/** Upper bound (inclusive) of monthly orders for this tier; null = open-ended (Custom). */
	maxOrders: number | null;
	/** Flat monthly fee; null = "quoted" (Custom). */
	fee: number | null;
}

export interface Band {
	/** Stable client-side identity for keyed list animations (optional in persisted data). */
	id?: string;
	min: number;
	/** Inclusive upper bound; null = open-ended. */
	max: number | null;
	rate: number;
}

export interface ShippingBand {
	/** Stable client-side identity for keyed list animations (optional in persisted data). */
	id?: string;
	/** Inclusive upper weight (kg) for this band. */
	maxKg: number;
	price: number;
}

export interface ExtrasRates {
	returns: number;
	relabel: number;
	kitting: number;
	urgent: number;
}

export interface RateCard {
	version: number;
	currency: 'AUD';
	/** A — flat monthly account fee, chosen by monthly order volume. */
	accountTiers: AccountTier[];
	/** B — storage, per pallet/month (whole-quantity band). */
	storageBands: Band[];
	/** Above this many pallets → custom (beyond facility capacity). */
	storageCustomAbove: number;
	/** C — inbound receiving, per pallet received/month (whole-quantity band). */
	receivingBands: Band[];
	/** One-off SKU onboarding fee, per SKU. */
	skuSetupFee: number;
	/** D — pick & pack. */
	pickPack: { firstItem: number; additionalItem: number };
	/** E — shipping, fixed price per weight band (margin baked in). */
	shippingBands: ShippingBand[];
	/** F — optional add-ons. */
	extras: ExtrasRates;
}

export interface CalcExtras {
	returns: number;
	relabel: number;
	kitting: number;
	urgent: number;
	/** Flag only → adds a "quoted separately" note, never a number. */
	customPackaging: boolean;
}

export interface CalcInputs {
	ordersPerMonth: number;
	itemsPerOrder: number; // average, ≥ 1, decimals allowed
	palletsStored: number;
	palletsReceived: number; // per month
	skuCount: number;
	avgWeightKg: number;
	extras: CalcExtras;
}

export interface CalcLine {
	key: string;
	label: string;
	monthly: number;
	perOrder: number;
}

export interface CalcResult {
	lines: CalcLine[];
	monthlyTotal: number;
	perOrderTotal: number;
	/** Everything except shipping, per order — the number sellers benchmark. */
	fulfilmentPerOrder: number;
	/** One-off SKU setup, separate from the recurring monthly total. */
	oneOffSetup: number;
	/** True → show "Let's talk — custom pricing" instead of a total. */
	custom: boolean;
	notes: string[];
	tierLabel: string;
}
