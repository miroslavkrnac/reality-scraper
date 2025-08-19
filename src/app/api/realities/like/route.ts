import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
	try {
		const { realityId } = await request.json();

		if (!realityId) {
			return NextResponse.json({ error: 'Reality ID is required' }, { status: 400 });
		}

		// @NOTE: Get current reality to check its liked status
		const reality = await db.reality.findUnique({
			where: { id: realityId },
			select: { liked: true },
		});

		if (!reality) {
			return NextResponse.json({ error: 'Reality not found' }, { status: 404 });
		}

		// @NOTE: Toggle the liked status
		const updatedReality = await db.reality.update({
			where: { id: realityId },
			data: { liked: !reality.liked },
		});

		return NextResponse.json({ success: true, liked: updatedReality.liked });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: 'Failed to toggle like status', details: errorMessage }, { status: 500 });
	}
};
