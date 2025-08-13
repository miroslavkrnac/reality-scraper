// @NOTE: Client-side function to like a reality
export const likeReality = async (realityId: number, userId = 1): Promise<boolean> => {
	try {
		const response = await fetch('/api/liked', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ realityId, userId }),
		});

		if (!response.ok) {
			const error = await response.json();
			if (error.error === 'Already liked') {
				return true; // @NOTE: Already liked, consider it successful
			}
			throw new Error(`Failed to like reality: ${response.status}`);
		}

		return true;
	} catch (_error) {
		return false;
	}
};

// @NOTE: Client-side function to unlike a reality
export const unlikeReality = async (realityId: number, userId = 1): Promise<boolean> => {
	try {
		const response = await fetch('/api/liked', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ realityId, userId }),
		});

		if (!response.ok) {
			throw new Error(`Failed to unlike reality: ${response.status}`);
		}

		return true;
	} catch (_error) {
		return false;
	}
};

// @NOTE: Client-side function to get liked realities
export const getLikedRealities = async (userId = 1): Promise<number[]> => {
	try {
		const response = await fetch(`/api/liked?userId=${userId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch liked realities: ${response.status}`);
		}

		const likedRealities = await response.json();
		return likedRealities.map((item: { realityId: number }) => item.realityId);
	} catch (_error) {
		return [];
	}
};
