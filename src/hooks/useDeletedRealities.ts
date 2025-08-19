import type { Reality } from '@/types/reality.types';
import { fetchDeletedRealities } from '@/utils/deleted.utils';
import useSWR from 'swr';

// @NOTE: SWR fetcher function
const deletedRealitiesFetcher = async (): Promise<Reality[]> => fetchDeletedRealities();

export const useDeletedRealities = () => {
	const { data, error, isLoading, mutate } = useSWR('/api/deleted', deletedRealitiesFetcher, {
		// @NOTE: Configuration to always load fresh data - no caching
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
		dedupingInterval: 0, // @NOTE: No deduplication - always fetch fresh data
		refreshInterval: 0, // @NOTE: No automatic refresh interval
		revalidateIfStale: true, // @NOTE: Always revalidate if data is stale
		revalidateOnMount: true, // @NOTE: Always revalidate on mount
	});

	return {
		deletedRealities: data || [],
		loading: isLoading,
		error: error ? 'Failed to load deleted realities' : null,
		mutate, // @NOTE: Expose mutate function to manually refresh data
	};
};
