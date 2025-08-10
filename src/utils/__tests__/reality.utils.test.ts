import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRealities, fetchRealities } from '../reality.utils';
import type { RealityWithLikedUsers } from '@/types/reality.types';

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
			const mockRealities: RealityWithLikedUsers[] = [
				{
					id: 1,
					name: 'Test Reality 1',
					liked: [],
				},
				{
					id: 2,
					name: 'Test Reality 2',
					liked: [],
				},
			];

			const { db } = await import('@/lib/db');
			vi.mocked(db.reality.findMany).mockResolvedValue(mockRealities);

			const result = await getRealities();

			expect(db.reality.findMany).toHaveBeenCalledWith({
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
			const mockRealities: RealityWithLikedUsers[] = [
				{
					id: 1,
					name: 'Test Reality 1',
					liked: [],
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
});
