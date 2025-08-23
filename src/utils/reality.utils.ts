import { db } from '@/lib/db';
import type { Reality } from '@/types/reality.types';

// @NOTE: Direct database access for SSR - only fetch non-deleted realities
export const getRealities = async (): Promise<Reality[]> => {
	try {
		const realities = await db.reality.findMany({
			where: { deleted: false },
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

// @NOTE: Client-side function to toggle like status
export const toggleLike = async (realityId: number): Promise<boolean> => {
	try {
		const response = await fetch('/api/realities/like', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ realityId }),
		});

		if (!response.ok) {
			throw new Error(`Failed to toggle like: ${response.status}`);
		}

		const data = await response.json();
		return data.success === true;
	} catch (_error) {
		return false;
	}
};

// @NOTE: Extract square meters from reality title
export const extractSquareMeters = (title: string): number | null => {
	// @NOTE: Look for patterns like "66 m²", "1197 m²", "120 m2", "120m2"
	const m2Pattern = /(\d+(?:\s\d+)*)\s*m2?²?/i;
	const match = title.match(m2Pattern);

	if (match) {
		// @NOTE: Remove spaces and convert to number
		const m2String = match[1].replace(/\s/g, '');
		const m2 = Number.parseFloat(m2String);
		return Number.isNaN(m2) ? null : m2;
	}

	return null;
};

// @NOTE: Extract price number from price string (e.g., "7 700 000 Kč" -> 7700000)
export const extractPriceNumber = (price: string): number | null => {
	// @NOTE: Look for numbers followed by "Kč" or "CZK", handle spaces in numbers
	const pricePattern = /([\d\s]+)\s*(?:Kč|CZK)/i;
	const match = price.match(pricePattern);

	if (match) {
		// @NOTE: Remove spaces and convert to number
		const priceString = match[1].replace(/\s/g, '');
		const priceNumber = Number.parseFloat(priceString);
		return Number.isNaN(priceNumber) ? null : priceNumber;
	}

	return null;
};

// @NOTE: Calculate price per square meter
export const calculatePricePerM2 = (price: string, title: string): number | null => {
	const priceNumber = extractPriceNumber(price);
	const squareMeters = extractSquareMeters(title);

	if (priceNumber && squareMeters && squareMeters > 0) {
		return Math.round(priceNumber / squareMeters);
	}

	return null;
};

// @NOTE: Format price per m2 for display
export const formatPricePerM2 = (pricePerM2: number | null): string => {
	if (pricePerM2 === null) {
		return 'N/A';
	}

	// @NOTE: Format with thousands separators
	return `${pricePerM2.toLocaleString()} Kč/m²`;
};

// @NOTE: Generate Mapy.cz URL from location string
export const generateMapsUrl = (location: string): string => {
	// @NOTE: Encode the location for URL
	const encodedLocation = encodeURIComponent(location);
	return `https://mapy.com/cs/zakladni?q=${encodedLocation}`;
};
