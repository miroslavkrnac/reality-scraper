import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRealities } from '../useRealities';

// @NOTE: Create a global mock function that can be accessed in tests
const mockSWR = vi.hoisted(() => vi.fn());

// @NOTE: Mock SWR to return our mock function
vi.mock('swr', () => ({
	default: mockSWR,
}));

describe('useRealities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return realities data when loading is successful', () => {
		mockSWR.mockReturnValue({
			data: [
				{
					id: 1,
					name: 'Test Reality 1',
					liked: [],
				},
			],
			error: undefined,
			isLoading: false,
			isValidating: false,
		});

		const { result } = renderHook(() => useRealities());

		expect(result.current.realities).toEqual([
			{
				id: 1,
				name: 'Test Reality 1',
				liked: [],
			},
		]);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
	});

	it('should return loading state when data is being fetched', () => {
		mockSWR.mockReturnValue({
			data: undefined,
			error: undefined,
			isLoading: true,
			isValidating: true,
		});

		const { result } = renderHook(() => useRealities());

		expect(result.current.realities).toEqual([]);
		expect(result.current.loading).toBe(true);
		expect(result.current.error).toBe(null);
	});

	it('should return error state when fetch fails', () => {
		const mockError = new Error('Failed to fetch');
		mockSWR.mockReturnValue({
			data: undefined,
			error: mockError,
			isLoading: false,
			isValidating: false,
		});

		const { result } = renderHook(() => useRealities());

		expect(result.current.realities).toEqual([]);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe('Failed to load realities');
	});

	it('should return empty array when no data is available', () => {
		mockSWR.mockReturnValue({
			data: [],
			error: undefined,
			isLoading: false,
			isValidating: false,
		});

		const { result } = renderHook(() => useRealities());

		expect(result.current.realities).toEqual([]);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
	});
});
