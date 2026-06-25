import { z } from 'zod';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const quoteSchema = z.object({
	company: z.string().trim().min(1, 'Company is required').max(255),
	contact: z.string().trim().min(1, 'Contact name is required').max(255),
	email: z.string().trim().regex(EMAIL, 'Valid email required').max(255),
	phone: z.string().trim().max(64).optional().default(''),
	website: z.string().trim().max(255).optional().default(''),
	industry: z.string().trim().min(1, 'Industry is required').max(120),
	services: z.array(z.string().max(120)).min(1, 'Select at least one service'),
	orderVolume: z.string().trim().min(1, 'Order volume is required').max(64),
	skuCount: z.string().trim().max(64).optional().default(''),
	storage: z.string().trim().max(64).optional().default(''),
	channels: z.array(z.string().max(120)).optional().default([]),
	currentSetup: z.string().trim().max(120).optional().default(''),
	timeline: z.string().trim().min(1, 'Timeline is required').max(120),
	message: z.string().trim().max(5000).optional().default('')
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export const contactSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(255),
	email: z.string().trim().regex(EMAIL, 'Valid email required').max(255),
	phone: z.string().trim().max(64).optional().default(''),
	message: z.string().trim().min(1, 'Message is required').max(5000)
});
export type ContactInput = z.infer<typeof contactSchema>;

// ——— Calculator submission ———————————————————————————————————
export const calcInputsSchema = z.object({
	ordersPerMonth: z.number().min(0).max(1_000_000),
	itemsPerOrder: z.number().min(1).max(100),
	palletsStored: z.number().min(0).max(100_000),
	palletsReceived: z.number().min(0).max(100_000),
	skuCount: z.number().min(0).max(1_000_000),
	avgWeightKg: z.number().min(0).max(10_000),
	extras: z.object({
		returns: z.number().min(0).max(1_000_000),
		relabel: z.number().min(0).max(1_000_000),
		kitting: z.number().min(0).max(1_000_000),
		urgent: z.number().min(0).max(1_000_000),
		customPackaging: z.boolean()
	})
});

export const calcQuoteSchema = z.object({
	company: z.string().trim().min(1, 'Company is required').max(255),
	contact: z.string().trim().min(1, 'Contact name is required').max(255),
	email: z.string().trim().regex(EMAIL, 'Valid email required').max(255),
	phone: z.string().trim().max(64).optional().default(''),
	message: z.string().trim().max(5000).optional().default(''),
	calc: calcInputsSchema
});
export type CalcQuoteInput = z.infer<typeof calcQuoteSchema>;
