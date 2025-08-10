import { getLikedRealities, likeReality, unlikeReality } from '@/utils/liked.utils';
import { useEffect, useState } from 'react';

export const useLikedRealities = (userId = 21) => {
	const [likedRealityIds, setLikedRealityIds] = useState<number[]>([]);
	const [loading, setLoading] = useState(true);

	// @NOTE: Load liked realities on mount
	useEffect(() => {
		const loadLikedRealities = async () => {
			try {
				const likedIds = await getLikedRealities(userId);
				setLikedRealityIds(likedIds);
			} catch (_error) {
				// @NOTE: Handle error silently
			} finally {
				setLoading(false);
			}
		};

		loadLikedRealities();
	}, [userId]);

	// @NOTE: Check if a reality is liked
	const isLiked = (realityId: number): boolean => {
		return likedRealityIds.includes(realityId);
	};

	// @NOTE: Toggle like state
	const toggleLike = async (realityId: number): Promise<boolean> => {
		const currentlyLiked = isLiked(realityId);

		try {
			let success: boolean;

			if (currentlyLiked) {
				success = await unlikeReality(realityId, userId);
				if (success) {
					setLikedRealityIds(prev => prev.filter(id => id !== realityId));
				}
			} else {
				success = await likeReality(realityId, userId);
				if (success) {
					setLikedRealityIds(prev => [...prev, realityId]);
				}
			}

			return success;
		} catch (_error) {
			return false;
		}
	};

	return {
		likedRealityIds,
		loading,
		isLiked,
		toggleLike,
	};
};
