import { db } from '@/lib/db';
import { log } from '@/utils/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	try {
		const { realityId, userId = 1 } = await request.json();

		if (!realityId) {
			return NextResponse.json({ error: 'Reality ID is required' }, { status: 400 });
		}

		// @NOTE: Check if already liked
		const existingLike = await db.liked.findFirst({
			where: {
				realityId,
				userId,
			},
		});

		if (existingLike) {
			return NextResponse.json({ error: 'Already liked' }, { status: 400 });
		}

		// @NOTE: Create new like
		const liked = await db.liked.create({
			data: {
				realityId,
				userId,
			},
		});

		return NextResponse.json({ success: true, liked });
	} catch (error) {
		log('Error in POST /api/liked:', error);
		return NextResponse.json(
			{ error: 'Failed to like reality', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 },
		);
	}
};

export const DELETE = async (request: NextRequest) => {
	try {
		const { realityId, userId = 1 } = await request.json();

		if (!realityId) {
			return NextResponse.json({ error: 'Reality ID is required' }, { status: 400 });
		}

		// @NOTE: Delete like
		const deletedLike = await db.liked.deleteMany({
			where: {
				realityId,
				userId,
			},
		});

		return NextResponse.json({ success: true, deleted: deletedLike.count > 0 });
	} catch (error) {
		log('Error in DELETE /api/liked:', error);
		return NextResponse.json(
			{ error: 'Failed to unlike reality', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 },
		);
	}
};

export const GET = async (request: NextRequest) => {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId') || '1';

		// @NOTE: Get all liked realities for user
		const likedRealities = await db.liked.findMany({
			where: {
				userId: Number.parseInt(userId, 10),
			},
			include: {
				reality: true,
			},
		});

		return NextResponse.json(likedRealities);
	} catch (error) {
		log('Error in GET /api/liked:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch liked realities',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
};
