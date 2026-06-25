import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';

let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
	if (!env.SMTP_HOST || !env.SMTP_USER) return null;
	if (!transporter) {
		const port = Number(env.SMTP_PORT || 465);
		transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port,
			secure: port === 465,
			auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
		});
	}
	return transporter;
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Render a labelled list of fields as a simple branded email table. */
export function emailTable(rows: [string, string][]): string {
	const body = rows
		.map(
			([k, v]) =>
				`<tr><td style="padding:6px 14px;border-bottom:1px solid #eee;color:#5b5e74;font:600 12px/1.4 Arial;white-space:nowrap;vertical-align:top">${escapeHtml(
					k
				)}</td><td style="padding:6px 14px;border-bottom:1px solid #eee;color:#1b1d33;font:14px/1.5 Arial">${escapeHtml(
					v || '—'
				)}</td></tr>`
		)
		.join('');
	return `<div style="background:#070a26;padding:20px 24px"><span style="color:#f5a623;font:700 16px Arial;letter-spacing:1px">MERIDIAN 3PL</span></div>
	<table style="border-collapse:collapse;width:100%;max-width:640px;margin:0 auto">${body}</table>`;
}

/**
 * Send an internal notification. Resilient by design: if SMTP isn't configured
 * (local dev) it logs instead of throwing, and a delivery failure never breaks
 * the submission — the record is already saved to the database.
 */
export async function sendNotification(opts: {
	subject: string;
	html: string;
	replyTo?: string;
}): Promise<{ sent: boolean }> {
	const to = env.NOTIFY_TO;
	const from = env.SMTP_FROM || 'Meridian 3PL <no-reply@localhost>';
	const t = getTransport();

	if (!t || !to) {
		console.log(`[email:dev] (SMTP not configured) would notify ${to ?? '<no NOTIFY_TO>'} — "${opts.subject}"`);
		return { sent: false };
	}

	try {
		await t.sendMail({ from, to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo });
		return { sent: true };
	} catch (e) {
		console.error('[email] notification failed:', e);
		return { sent: false };
	}
}
