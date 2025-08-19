import type { Reality } from '@/types/reality.types';
import { getRealities } from '@/utils/reality.utils';
import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET } from '../realities/route';

// @NOTE: Mock Prisma client
vi.mock('@/lib/db', () => {
	const mockPrisma = {
		reality: {
			findMany: vi.fn(),
			delete: vi.fn(),
			findUnique: vi.fn(),
			update: vi.fn(),
		},
		deleted: {
			create: vi.fn(),
		},
	};
	return {
		db: mockPrisma,
	};
});

// @NOTE: Helper function to create NextRequest for testing
const createTestRequest = (url: string, method: string, body?: object): NextRequest => {
	const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
	const request = new Request(fullUrl, {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: body ? JSON.stringify(body) : undefined,
	}) as NextRequest;

	// @NOTE: Mock NextRequest specific properties
	Object.defineProperty(request, 'nextUrl', {
		value: new URL(fullUrl),
		writable: false,
	});

	return request;
};

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
			const mockRealities: Reality[] = [
				{
					id: 1,
					link: '/detail/test1',
					img_src: 'https://example.com/img1.jpg',
					title: 'Reality One',
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
					title: 'Reality Two',
					location: 'Test Location 2',
					price: '2,000,000 Kč',
					reality_id: 'test2',
					type: 'FLAT_INVESTMENT',
					liked: false,
					deleted: false,
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

	describe('DELETE', () => {
		it('should delete a reality successfully', async () => {
			const { db } = await import('@/lib/db');
			const mockUpdatedReality = {
				id: 1,
				link: '/detail/test1',
				img_src: 'https://example.com/img1.jpg',
				title: 'Test Reality 1',
				location: 'Test Location 1',
				price: '1,000,000 Kč',
				reality_id: 'test1',
				type: 'FLAT_PERSONAL' as const,
				liked: false,
				deleted: true,
			};

			vi.mocked(db.reality.update).mockResolvedValue(mockUpdatedReality);

			const request = createTestRequest('/api/realities', 'DELETE', {
				realityId: 1,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(db.reality.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { deleted: true },
			});
			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true, updated: mockUpdatedReality });
		});

		it('should return 400 if realityId is missing', async () => {
			const request = createTestRequest('/api/realities', 'DELETE', {});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toEqual({ error: 'Reality ID is required' });
		});

		it('should return 500 if reality is not found', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.reality.update).mockRejectedValue(new Error('Record to update not found'));

			const request = createTestRequest('/api/realities', 'DELETE', {
				realityId: 999,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data).toEqual({ error: 'Failed to delete reality', details: 'Record to update not found' });
		});

		it('should handle database errors', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.reality.update).mockRejectedValue(new Error('Database error'));

			const request = createTestRequest('/api/realities', 'DELETE', {
				realityId: 1,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data).toEqual({ error: 'Failed to delete reality', details: 'Database error' });
		});
	});
});
