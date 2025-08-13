import { getLikedRealities, likeReality, unlikeReality } from '@/utils/liked.utils';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLikedRealities } from '../useLikedRealities';

// @NOTE: Mock the liked utilities
vi.mock('@/utils/liked.utils', () => ({
	getLikedRealities: vi.fn(),
	likeReality: vi.fn(),
	unlikeReality: vi.fn(),
}));

const mockGetLikedRealities = vi.mocked(getLikedRealities);
const mockLikeReality = vi.mocked(likeReality);
const mockUnlikeReality = vi.mocked(unlikeReality);

describe('useLikedRealities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should load liked realities on mount', async () => {
		const mockLikedIds = [1, 2, 3];
		mockGetLikedRealities.mockResolvedValue(mockLikedIds);

		const { result } = renderHook(() => useLikedRealities(21));

		expect(result.current.loading).toBe(true);
		expect(result.current.likedRealityIds).toEqual([]);

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		expect(mockGetLikedRealities).toHaveBeenCalledWith(21);
		expect(result.current.loading).toBe(false);
		expect(result.current.likedRealityIds).toEqual(mockLikedIds);
	});

	it('should handle loading errors gracefully', async () => {
		mockGetLikedRealities.mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useLikedRealities(21));

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.likedRealityIds).toEqual([]);
	});

	it('should check if reality is liked', async () => {
		const mockLikedIds = [1, 3, 5];
		mockGetLikedRealities.mockResolvedValue(mockLikedIds);

		const { result } = renderHook(() => useLikedRealities(21));

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		expect(result.current.isLiked(1)).toBe(true);
		expect(result.current.isLiked(2)).toBe(false);
		expect(result.current.isLiked(3)).toBe(true);
	});

	it('should like a reality successfully', async () => {
		const mockLikedIds = [1, 2];
		mockGetLikedRealities.mockResolvedValue(mockLikedIds);
		mockLikeReality.mockResolvedValue(true);

		const { result } = renderHook(() => useLikedRealities(21));

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		await act(async () => {
			const success = await result.current.toggleLike(3);
			expect(success).toBe(true);
		});

		expect(mockLikeReality).toHaveBeenCalledWith(3, 21);
		expect(result.current.likedRealityIds).toEqual([1, 2, 3]);
	});

	it('should unlike a reality successfully', async () => {
		const mockLikedIds = [1, 2, 3];
		mockGetLikedRealities.mockResolvedValue(mockLikedIds);
		mockUnlikeReality.mockResolvedValue(true);

		const { result } = renderHook(() => useLikedRealities(21));

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		await act(async () => {
			const success = await result.current.toggleLike(2);
			expect(success).toBe(true);
		});

		expect(mockUnlikeReality).toHaveBeenCalledWith(2, 21);
		expect(result.current.likedRealityIds).toEqual([1, 3]);
	});

	it('should handle like failure', async () => {
		const mockLikedIds = [1, 2];
		mockGetLikedRealities.mockResolvedValue(mockLikedIds);
		mockLikeReality.mockResolvedValue(false);

		const { result } = renderHook(() => useLikedRealities(21));

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		await act(async () => {
			const success = await result.current.toggleLike(3);
			expect(success).toBe(false);
		});

		expect(result.current.likedRealityIds).toEqual([1, 2]); // @NOTE: Should not change on failure
	});

	it('should handle unlike failure', async () => {
		const mockLikedIds = [1, 2, 3];
		mockGetLikedRealities.mockResolvedValue(mockLikedIds);
		mockUnlikeReality.mockResolvedValue(false);

		const { result } = renderHook(() => useLikedRealities(21));

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		await act(async () => {
			const success = await result.current.toggleLike(2);
			expect(success).toBe(false);
		});

		expect(result.current.likedRealityIds).toEqual([1, 2, 3]); // @NOTE: Should not change on failure
	});

	it('should use default userId when not provided', async () => {
		mockGetLikedRealities.mockResolvedValue([]);

		renderHook(() => useLikedRealities());

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});

		expect(mockGetLikedRealities).toHaveBeenCalledWith(1);
	});
});
