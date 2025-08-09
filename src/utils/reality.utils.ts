import type { Reality } from '@/types/reality.types';

// @NOTE: Fake data for realities - shared between API and SSR
const fakeRealities: Reality[] = [
	{ id: 1, name: 'Reality One' },
	{ id: 2, name: 'Reality Two' },
	{ id: 3, name: 'Reality Three' },
	{ id: 4, name: 'Reality Four' },
	{ id: 5, name: 'Reality Five' },
	{ id: 6, name: 'Reality Six' },
	{ id: 7, name: 'Reality Seven' },
	{ id: 8, name: 'Reality Eight' },
	{ id: 9, name: 'Reality Nine' },
	{ id: 10, name: 'Reality Ten' },
];

// @NOTE: Direct data access for SSR
export const getRealities = async (): Promise<Reality[]> => {
	// @NOTE: Simulate some processing time
	await new Promise(resolve => setTimeout(resolve, 100));
	return fakeRealities;
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
