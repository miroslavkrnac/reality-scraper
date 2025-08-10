import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLikedRealities, likeReality, unlikeReality } from '../liked.utils';

// @NOTE: Mock fetch globally
global.fetch = vi.fn();

describe('liked.utils', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('likeReality', () => {
		it('should like a reality successfully', async () => {
			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({ success: true, liked: { id: 1, realityId: 1, userId: 21 } }),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await likeReality(1, 21);

			expect(global.fetch).toHaveBeenCalledWith('/api/liked', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ realityId: 1, userId: 21 }),
			});
			expect(result).toBe(true);
		});

		it('should handle already liked reality', async () => {
			const mockResponse = {
				ok: false,
				json: vi.fn().mockResolvedValue({ error: 'Already liked' }),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await likeReality(1, 21);

			expect(result).toBe(true);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				json: vi.fn().mockResolvedValue({ error: 'Server error' }),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await likeReality(1, 21);

			expect(result).toBe(false);
		});

		it('should handle network errors', async () => {
			(global.fetch as any).mockRejectedValue(new Error('Network error'));

			const result = await likeReality(1, 21);

			expect(result).toBe(false);
		});

		it('should use default userId when not provided', async () => {
			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({ success: true }),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			await likeReality(1);

			expect(global.fetch).toHaveBeenCalledWith('/api/liked', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ realityId: 1, userId: 21 }),
			});
		});
	});

	describe('unlikeReality', () => {
		it('should unlike a reality successfully', async () => {
			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({ success: true, deleted: true }),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await unlikeReality(1, 21);

			expect(global.fetch).toHaveBeenCalledWith('/api/liked', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ realityId: 1, userId: 21 }),
			});
			expect(result).toBe(true);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await unlikeReality(1, 21);

			expect(result).toBe(false);
		});

		it('should handle network errors', async () => {
			(global.fetch as any).mockRejectedValue(new Error('Network error'));

			const result = await unlikeReality(1, 21);

			expect(result).toBe(false);
		});

		it('should use default userId when not provided', async () => {
			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue({ success: true }),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			await unlikeReality(1);

			expect(global.fetch).toHaveBeenCalledWith('/api/liked', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ realityId: 1, userId: 21 }),
			});
		});
	});

	describe('getLikedRealities', () => {
		it('should fetch liked realities successfully', async () => {
			const mockLikedRealities = [{ realityId: 1 }, { realityId: 2 }, { realityId: 3 }];

			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue(mockLikedRealities),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await getLikedRealities(21);

			expect(global.fetch).toHaveBeenCalledWith('/api/liked?userId=21', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			expect(result).toEqual([1, 2, 3]);
		});

		it('should handle API errors', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			const result = await getLikedRealities(21);

			expect(result).toEqual([]);
		});

		it('should handle network errors', async () => {
			(global.fetch as any).mockRejectedValue(new Error('Network error'));

			const result = await getLikedRealities(21);

			expect(result).toEqual([]);
		});

		it('should use default userId when not provided', async () => {
			const mockResponse = {
				ok: true,
				json: vi.fn().mockResolvedValue([]),
			};

			(global.fetch as any).mockResolvedValue(mockResponse);

			await getLikedRealities();

			expect(global.fetch).toHaveBeenCalledWith('/api/liked?userId=21', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		});
	});
});
