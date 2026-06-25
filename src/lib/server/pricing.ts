import { getAdminPb } from './pb';
import { DEFAULT_RATE_CARD } from '$lib/pricing/default-config';
import type { RateCard } from '$lib/pricing/types';

const COL = 'pricing_config';

/** The currently published rate card (falls back to the approved default if none). */
export async function getPublishedConfig(): Promise<RateCard> {
	try {
		const pb = await getAdminPb();
		const result = await pb.collection(COL).getList(1, 1, {
			filter: 'is_published = true',
			sort: '-effective_from'
		});
		return (result.items[0]?.data as RateCard) ?? DEFAULT_RATE_CARD;
	} catch {
		return DEFAULT_RATE_CARD;
	}
}

/** Seed the approved default as the first published version, once, if the collection is empty. */
export async function seedIfEmpty(userId?: string | null): Promise<void> {
	const pb = await getAdminPb();
	const existing = await pb.collection(COL).getList(1, 1);
	if (existing.totalItems > 0) return;
	await pb.collection(COL).create({
		version: 1,
		data: DEFAULT_RATE_CARD,
		is_published: true,
		effective_from: new Date().toISOString().replace('T', ' '),
		note: 'Seeded default — approved formula v1',
		created_by: userId ?? ''
	});
}

export async function listVersions() {
	const pb = await getAdminPb();
	const rows = await pb.collection(COL).getFullList({ sort: '-version' });
	return rows.map((r) => ({
		id: r.id,
		version: r.version as number,
		data: r.data,
		isPublished: r.is_published as boolean,
		effectiveFrom: r.effective_from as string | null,
		note: r.note as string | null,
		createdAt: r.created
	}));
}

export async function getVersion(id: string) {
	const pb = await getAdminPb();
	try {
		const r = await pb.collection(COL).getOne(id);
		return {
			id: r.id,
			version: r.version as number,
			data: r.data,
			isPublished: r.is_published as boolean,
			effectiveFrom: r.effective_from as string | null,
			note: r.note as string | null,
			createdAt: r.created
		};
	} catch {
		return null;
	}
}

/** Save a new unpublished draft version; returns the new version number. */
export async function saveDraft(
	data: RateCard,
	userId: string | null,
	note?: string | null
): Promise<number> {
	const pb = await getAdminPb();
	const latest = await pb.collection(COL).getList(1, 1, { sort: '-version' });
	const maxV = (latest.items[0]?.version as number) ?? 0;
	const version = maxV + 1;
	await pb.collection(COL).create({
		version,
		data: { ...data, version },
		is_published: false,
		note: note ?? '',
		created_by: userId ?? ''
	});
	return version;
}

/** Unpublish all current versions then stamp the target as published. */
export async function publish(id: string): Promise<void> {
	const pb = await getAdminPb();
	const published = await pb.collection(COL).getFullList({ filter: 'is_published = true' });
	await Promise.all(published.map((r) => pb.collection(COL).update(r.id, { is_published: false })));
	await pb.collection(COL).update(id, {
		is_published: true,
		effective_from: new Date().toISOString().replace('T', ' ')
	});
}
