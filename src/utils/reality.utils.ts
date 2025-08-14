import { db } from '@/lib/db';
import type { RealityWithLikedUsers } from '@/types/reality.types';

// @NOTE: Direct database access for SSR
export const getRealities = async (): Promise<RealityWithLikedUsers[]> => {
	try {
		const realities = await db.reality.findMany({
			orderBy: { id: 'asc' },
			include: {
				liked: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});
		return realities;
	} catch (_error) {
		// @NOTE: Return empty array if database query fails
		return [];
	}
};

// @NOTE: Client-side fetch function for API calls
export const fetchRealities = async (): Promise<RealityWithLikedUsers[]> => {
	try {
		const response = await fetch('/api/realities', {
			cache: 'no-store', // @NOTE: Ensure fresh data on each request
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch realities: ${response.status}`);
		}

		const data = await response.json();
		return data as RealityWithLikedUsers[];
	} catch (_error) {
		// @NOTE: Log error and return empty array to prevent page crash
		return [];
	}
};

// @NOTE: Client-side function to delete a reality
export const deleteReality = async (realityId: number): Promise<boolean> => {
	try {
		const response = await fetch('/api/realities', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ realityId }),
		});

		if (!response.ok) {
			throw new Error(`Failed to delete reality: ${response.status}`);
		}

		const data = await response.json();
		return data.success === true;
	} catch (_error) {
		return false;
	}
};
