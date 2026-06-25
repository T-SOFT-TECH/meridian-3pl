import { json, type RequestHandler } from '@sveltejs/kit';
import { contactSchema } from '$lib/schemas';
import { sendNotification, emailTable } from '$lib/server/email';
import { getServicePb } from '$lib/server/pb';

export const prerender = false;

const orNull = (s?: string) => (s && s.trim() ? s.trim() : null);

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request.' }, { status: 400 });
	}

	if (body?.botcheck) return json({ success: true });

	const parsed = contactSchema.safeParse(body);
	if (!parsed.success) {
		return json({ success: false, error: 'Please check the form and try again.' }, { status: 422 });
	}
	const d = parsed.data;

	try {
		const pb = await getServicePb();
		await pb.collection('contact_messages').create({
			name: d.name,
			email: d.email,
			phone: orNull(d.phone) ?? '',
			message: d.message,
			status: 'unread',
			source: 'contact_form'
		});
	} catch (e) {
		console.error('[api/contact] create failed:', e);
		return json(
			{ success: false, error: 'We could not send your message. Please try again.' },
			{ status: 500 }
		);
	}

	await sendNotification({
		subject: `New contact message — ${d.name}`,
		replyTo: d.email,
		html: emailTable([
			['Name', d.name],
			['Email', d.email],
			['Phone', d.phone || '—'],
			['Message', d.message]
		])
	});

	return json({ success: true });
};
