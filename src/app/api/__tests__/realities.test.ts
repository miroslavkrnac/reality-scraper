import type { RealityWithLikedUsers } from '@/types/reality.types';
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

	describe('DELETE', () => {
		it('should delete a reality successfully', async () => {
			const { db } = await import('@/lib/db');
			const mockReality = {
				reality_id: 'test1',
				type: 'FLAT_PERSONAL' as const,
			};
			const mockDeletedReality = {
				id: 1,
				link: '/detail/test1',
				img_src: 'https://example.com/img1.jpg',
				title: 'Test Reality 1',
				location: 'Test Location 1',
				price: '1,000,000 Kč',
				reality_id: 'test1',
				type: 'FLAT_PERSONAL' as const,
			};
			const mockDeletedRecord = {
				id: 1,
				reality_id: 'test1',
				type: 'FLAT_PERSONAL' as const,
				deleted_at: new Date(),
			};

			vi.mocked(db.reality.findUnique).mockResolvedValue(mockReality);
			vi.mocked(db.reality.delete).mockResolvedValue(mockDeletedReality);
			vi.mocked(db.deleted.create).mockResolvedValue(mockDeletedRecord);

			const request = createTestRequest('/api/realities', 'DELETE', {
				realityId: 1,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(db.reality.findUnique).toHaveBeenCalledWith({
				where: { id: 1 },
				select: { reality_id: true, type: true },
			});
			expect(db.reality.delete).toHaveBeenCalledWith({
				where: { id: 1 },
			});
			expect(db.deleted.create).toHaveBeenCalledWith({
				data: {
					reality_id: 'test1',
					type: 'FLAT_PERSONAL',
				},
			});
			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true, deleted: mockDeletedReality });
		});

		it('should return 400 if realityId is missing', async () => {
			const request = createTestRequest('/api/realities', 'DELETE', {});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toEqual({ error: 'Reality ID is required' });
		});

		it('should return 404 if reality is not found', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.reality.findUnique).mockResolvedValue(null);

			const request = createTestRequest('/api/realities', 'DELETE', {
				realityId: 999,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data).toEqual({ error: 'Reality not found' });
		});

		it('should handle database errors', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.reality.findUnique).mockResolvedValue({ reality_id: 'test1' });
			vi.mocked(db.reality.delete).mockRejectedValue(new Error('Database error'));

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
