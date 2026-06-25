import type PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';

export interface PbUser extends RecordModel {
	email: string;
	name: string;
	role: 'staff' | 'admin';
}

declare global {
	namespace App {
		interface Locals {
			pb: PocketBase;
			user: PbUser | null;
		}
	}
}

export {};
