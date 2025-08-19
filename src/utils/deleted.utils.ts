import type { Reality } from '@/types/reality.types';

// @NOTE: Fetch deleted realities from the API
export const fetchDeletedRealities = async (): Promise<Reality[]> => {
	try {
		const response = await fetch('/api/deleted', {
			cache: 'no-store', // @NOTE: Ensure fresh data on each request
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch deleted realities: ${response.status}`);
		}
		const data = await response.json();
		return data as Reality[];
	} catch (_error) {
		// @NOTE: Return empty array if API call fails
		return [];
	}
};

// @NOTE: Restore a reality from deleted to active
export const restoreReality = async (realityId: number): Promise<boolean> => {
	try {
		const response = await fetch('/api/deleted/restore', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ realityId }),
		});

		if (!response.ok) {
			throw new Error(`Failed to restore reality: ${response.status}`);
		}

		const data = await response.json();
		return data.success === true;
	} catch (_error) {
		return false;
	}
};
