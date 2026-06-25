import { redirect, type Handle } from '@sveltejs/kit';
import { createPb } from '$lib/server/pb';

export const handle: Handle = async ({ event, resolve }) => {
	const pb = createPb();

	// Restore auth from the request cookie; PocketBase parses the 'pb_auth' cookie automatically.
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') ?? '');

	try {
		if (pb.authStore.isValid) {
			await pb.collection('users').authRefresh();
		}
	} catch {
		pb.authStore.clear();
	}

	event.locals.pb = pb;
	event.locals.user = pb.authStore.isValid ? (pb.authStore.model as App.Locals['user']) : null;

	const { pathname } = event.url;

	if (pathname.startsWith('/admin')) {
		const isPublic = pathname === '/admin/login';
		if (!isPublic && !event.locals.user) throw redirect(303, '/admin/login');
		if (event.locals.user && pathname === '/admin/login') throw redirect(303, '/admin');
	}

	const response = await resolve(event);

	// Forward any auth state changes (login, refresh, logout) back to the browser.
	response.headers.append(
		'set-cookie',
		pb.authStore.exportToCookie({ httpOnly: true, secure: false, sameSite: 'Lax', path: '/' })
	);

	return response;
};
