import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, POST } from '../liked/route';

// @NOTE: Mock Prisma client
vi.mock('@/lib/db', () => {
	const mockPrisma = {
		liked: {
			findFirst: vi.fn(),
			create: vi.fn(),
			deleteMany: vi.fn(),
			findMany: vi.fn(),
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

describe('/api/liked', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST', () => {
		it('should create a new like', async () => {
			const mockLike = {
				id: 1,
				realityId: 1,
				userId: 21,
			};

			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.findFirst).mockResolvedValue(null);
			vi.mocked(db.liked.create).mockResolvedValue(mockLike);

			const request = createTestRequest('/api/liked', 'POST', {
				realityId: 1,
				userId: 21,
			});

			const response = await POST(request);
			const data = await response.json();

			expect(db.liked.findFirst).toHaveBeenCalledWith({
				where: {
					realityId: 1,
					userId: 21,
				},
			});
			expect(db.liked.create).toHaveBeenCalledWith({
				data: {
					realityId: 1,
					userId: 21,
				},
			});
			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true, liked: mockLike });
		});

		it('should return 400 if like already exists', async () => {
			const existingLike = {
				id: 1,
				realityId: 1,
				userId: 21,
			};

			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.findFirst).mockResolvedValue(existingLike);

			const request = createTestRequest('/api/liked', 'POST', {
				realityId: 1,
				userId: 21,
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toEqual({ error: 'Already liked' });
		});

		it('should return 400 if realityId is missing', async () => {
			const request = createTestRequest('/api/liked', 'POST', {
				userId: 21,
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toEqual({ error: 'Reality ID is required' });
		});

		it('should handle database errors', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.findFirst).mockRejectedValue(new Error('Database error'));

			const request = createTestRequest('/api/liked', 'POST', {
				realityId: 1,
				userId: 21,
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data).toEqual({ error: 'Failed to like reality', details: 'Database error' });
		});
	});

	describe('DELETE', () => {
		it('should delete a like', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.deleteMany).mockResolvedValue({ count: 1 });

			const request = createTestRequest('/api/liked', 'DELETE', {
				realityId: 1,
				userId: 21,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(db.liked.deleteMany).toHaveBeenCalledWith({
				where: {
					realityId: 1,
					userId: 21,
				},
			});
			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true, deleted: true });
		});

		it('should return 400 if realityId is missing', async () => {
			const request = createTestRequest('/api/liked', 'DELETE', {
				userId: 21,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data).toEqual({ error: 'Reality ID is required' });
		});

		it('should handle database errors', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.deleteMany).mockRejectedValue(new Error('Database error'));

			const request = createTestRequest('/api/liked', 'DELETE', {
				realityId: 1,
				userId: 21,
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data).toEqual({ error: 'Failed to unlike reality', details: 'Database error' });
		});
	});

	describe('GET', () => {
		it('should return liked realities for a user', async () => {
			const mockLikes = [
				{
					id: 1,
					realityId: 1,
					userId: 21,
				},
				{
					id: 2,
					realityId: 2,
					userId: 21,
				},
			];

			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.findMany).mockResolvedValue(mockLikes);

			const request = createTestRequest('/api/liked?userId=21', 'GET');

			const response = await GET(request);
			const data = await response.json();

			expect(db.liked.findMany).toHaveBeenCalledWith({
				where: { userId: 21 },
				include: { reality: true },
			});
			expect(response.status).toBe(200);
			expect(data).toEqual(mockLikes);
		});

		it('should return empty array when user has no likes', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.findMany).mockResolvedValue([]);

			const request = createTestRequest('/api/liked?userId=21', 'GET');

			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual([]);
		});

		it('should handle database errors', async () => {
			const { db } = await import('@/lib/db');
			vi.mocked(db.liked.findMany).mockRejectedValue(new Error('Database error'));

			const request = createTestRequest('/api/liked?userId=21', 'GET');

			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data).toEqual({ error: 'Failed to fetch liked realities', details: 'Database error' });
		});
	});
});
