import type { RealityWithLikedUsers } from '@/types/reality.types';
import { getRealities } from '@/utils/reality.utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../realities/route';

// @NOTE: Mock the reality utils
vi.mock('@/utils/reality.utils', () => ({
	getRealities: vi.fn(),
}));

const mockGetRealities = vi.mocked(getRealities);

describe('/api/realities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET', () => {
		it('should return realities with liked users', async () => {
			const mockRealities: RealityWithLikedUsers[] = [
				{
					id: 1,
					name: 'Reality One',
					liked: [
						{
							user: {
								id: 21,
								name: 'John Doe',
								email: 'john@example.com',
							},
						},
					],
				},
				{
					id: 2,
					name: 'Reality Two',
					liked: [],
				},
			];

			mockGetRealities.mockResolvedValue(mockRealities);

			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual(mockRealities);
			expect(mockGetRealities).toHaveBeenCalledOnce();
		});

		it('should handle database errors gracefully', async () => {
			mockGetRealities.mockRejectedValue(new Error('Database error'));

			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data).toEqual({ error: 'Failed to fetch realities' });
		});

		it('should return empty array when no realities exist', async () => {
			mockGetRealities.mockResolvedValue([]);

			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual([]);
		});
	});
});
