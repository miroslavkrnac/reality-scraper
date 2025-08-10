import type { RealityWithLikedUsers } from '@/types/reality.types';
import { fetchRealities } from '@/utils/reality.utils';
import useSWR from 'swr';

// @NOTE: SWR fetcher function
const realitiesFetcher = async (): Promise<RealityWithLikedUsers[]> => {
	return await fetchRealities();
};

export const useRealities = () => {
	const { data, error, isLoading } = useSWR('/api/realities', realitiesFetcher, {
		// @NOTE: Configuration to prevent duplicate calls
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		dedupingInterval: 5000, // @NOTE: Dedupe requests within 5 seconds
	});

	return {
		realities: data || [],
		loading: isLoading,
		error: error ? 'Failed to load realities' : null,
	};
};
