import { db } from '@/lib/db';
import type { Reality } from '@/types/reality.types';

// @NOTE: Direct database access for SSR
export const getRealities = async (): Promise<Reality[]> => {
	try {
		const realities = await db.reality.findMany({
			orderBy: { id: 'asc' },
		});
		return realities;
	} catch (_error) {
		// @NOTE: Return empty array if database query fails
		return [];
	}
};

// @NOTE: Client-side fetch function for API calls
export const fetchRealities = async (): Promise<Reality[]> => {
	try {
		const response = await fetch('/api/realities', {
			cache: 'no-store', // @NOTE: Ensure fresh data on each request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch realities: ${response.status}`);
		}

		const data = await response.json();
		return data as Reality[];
	} catch (_error) {
		// @NOTE: Log error and return empty array to prevent page crash
		return [];
	}
};
