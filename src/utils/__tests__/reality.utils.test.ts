import type { Reality } from '@/types/reality.types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	calculatePricePerM2,
	deleteReality,
	extractPriceNumber,
	extractSquareMeters,
	fetchRealities,
	formatPricePerM2,
	getRealities,
} from '../reality.utils';

// @NOTE: Mock Prisma client
vi.mock('@/lib/db', () => {
	const mockPrisma = {
		reality: {
			findMany: vi.fn(),
		},
	};
	return {
		db: mockPrisma,
	};
});

// @NOTE: Mock fetch globally
global.fetch = vi.fn();

describe('reality.utils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getRealities', () => {
		it('should fetch realities from database', async () => {
			const mockRealities: Reality[] = [
				{
					id: 1,
					link: '/detail/test1',
					img_src: 'https://example.com/img1.jpg',
					title: 'Test Reality 1',
					location: 'Test Location 1',
					price: '1,000,000 Kč',
					reality_id: 'test1',
					type: 'FLAT_PERSONAL',
					liked: true,
					deleted: false,
				},
				{
					id: 2,
					link: '/detail/test2',
					img_src: 'https://example.com/img2.jpg',
					title: 'Test Reality 2',
					location: 'Test Location 2',
					price: '2,000,000 Kč',
					reality_id: 'test2',
					type: 'FLAT_INVESTMENT',
					liked: false,
					deleted: false,
				},
			];

			const { db } = await import('@/lib/db');
			vi.mocked(db.reality.findMany).mockResolvedValue(mockRealities);

			const result = await getRealities();

			expect(db.reality.findMany).toHaveBeenCalledWith({
				where: { deleted: false },
				orderBy: { id: 'asc' },
			});
			expect(result).toEqual(mockRealities);
		});

		it('should handle database errors', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.reality.findMany).mockRejectedValue(new Error('Database error'));

			const result = await getRealities();

			expect(result).toEqual([]);
		});
	});

	describe('fetchRealities', () => {
		it('should fetch realities from API', async () => {
			const mockRealities: Reality[] = [
				{
					id: 1,
					link: '/detail/test1',
					img_src: 'https://example.com/img1.jpg',
					title: 'Test Reality 1',
					location: 'Test Location 1',
					price: '1,000,000 Kč',
					reality_id: 'test1',
					type: 'FLAT_PERSONAL',
					liked: true,
					deleted: false,
				},
			];

			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue(mockRealities),
			};

			vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

			const result = await fetchRealities();

			expect(global.fetch).toHaveBeenCalledWith('/api/realities', {
				cache: 'no-store',
			});
			expect(result).toEqual(mockRealities);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				statusText: 'Internal Server Error',
			};

			vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

			const result = await fetchRealities();

			expect(result).toEqual([]);
		});

		it('should handle network errors', async () => {
			vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

			const result = await fetchRealities();

			expect(result).toEqual([]);
		});

		it('should handle invalid response format', async () => {
			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue('invalid data'),
			};

			vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

			const result = await fetchRealities();

			expect(result).toEqual('invalid data');
		});
	});

	describe('deleteReality', () => {
		it('should delete a reality successfully', async () => {
			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({ success: true }),
			};

			vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

			const result = await deleteReality(1);

			expect(global.fetch).toHaveBeenCalledWith('/api/realities', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ realityId: 1 }),
			});
			expect(result).toBe(true);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
			};

			vi.mocked(global.fetch).mockResolvedValue(mockResponse as unknown as Response);

			const result = await deleteReality(1);

			expect(result).toBe(false);
		});

		it('should handle network errors', async () => {
			vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

			const result = await deleteReality(1);

			expect(result).toBe(false);
		});
	});
});

describe('Price per m² utilities', () => {
	describe('extractSquareMeters', () => {
		it('should extract square meters from title with m²', () => {
			const title = 'Prodej bytu 3+kk 66 m²';
			const result = extractSquareMeters(title);
			expect(result).toBe(66);
		});

		it('should extract square meters from title with m2', () => {
			const title = 'Prodej stavebního pozemku 1197 m2';
			const result = extractSquareMeters(title);
			expect(result).toBe(1197);
		});

		it('should extract square meters with spaces in number', () => {
			const title = 'Prodej bytu 1 234 m²';
			const result = extractSquareMeters(title);
			expect(result).toBe(1234);
		});

		it('should return null when no square meters found', () => {
			const title = 'Prodej bytu bez m² informace';
			const result = extractSquareMeters(title);
			expect(result).toBeNull();
		});
	});

	describe('extractPriceNumber', () => {
		it('should extract price from Kč format', () => {
			const price = '7 700 000 Kč';
			const result = extractPriceNumber(price);
			expect(result).toBe(7700000);
		});

		it('should extract price from CZK format', () => {
			const price = '4 355 000 CZK';
			const result = extractPriceNumber(price);
			expect(result).toBe(4355000);
		});

		it('should extract price with additional info', () => {
			const price = '4 355 000 Kč (3 638 Kč/m²)';
			const result = extractPriceNumber(price);
			expect(result).toBe(4355000);
		});

		it('should return null when no price found', () => {
			const price = 'Cena dohodou';
			const result = extractPriceNumber(price);
			expect(result).toBeNull();
		});
	});

	describe('calculatePricePerM2', () => {
		it('should calculate price per m² correctly', () => {
			const price = '7 700 000 Kč';
			const title = 'Prodej bytu 3+kk 66 m²';
			const result = calculatePricePerM2(price, title);
			expect(result).toBe(116667); // 7700000 / 66 = 116666.67... rounded to 116667
		});

		it('should calculate price per m² for land', () => {
			const price = '4 355 000 Kč (3 638 Kč/m²)';
			const title = 'Prodej stavebního pozemku 1197 m²';
			const result = calculatePricePerM2(price, title);
			expect(result).toBe(3638); // 4355000 / 1197 = 3638.26... rounded to 3638
		});

		it('should return null when price cannot be extracted', () => {
			const price = 'Cena dohodou';
			const title = 'Prodej bytu 66 m²';
			const result = calculatePricePerM2(price, title);
			expect(result).toBeNull();
		});

		it('should return null when square meters cannot be extracted', () => {
			const price = '7 700 000 Kč';
			const title = 'Prodej bytu bez m²';
			const result = calculatePricePerM2(price, title);
			expect(result).toBeNull();
		});

		it('should return null when square meters is zero', () => {
			const price = '7 700 000 Kč';
			const title = 'Prodej bytu 0 m²';
			const result = calculatePricePerM2(price, title);
			expect(result).toBeNull();
		});
	});

	describe('formatPricePerM2', () => {
		it('should format price per m² with thousands separators', () => {
			const result = formatPricePerM2(116667);
			expect(result).toBe('116,667 Kč/m²');
		});

		it('should format small numbers correctly', () => {
			const result = formatPricePerM2(3638);
			expect(result).toBe('3,638 Kč/m²');
		});

		it('should return N/A for null input', () => {
			const result = formatPricePerM2(null);
			expect(result).toBe('N/A');
		});
	});
});
