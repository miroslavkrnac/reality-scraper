import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
	try {
		const { realityId } = await request.json();

		if (!realityId) {
			return NextResponse.json({ error: 'Reality ID is required' }, { status: 400 });
		}

		// @NOTE: Restore the reality by setting deleted to false
		const restoredReality = await db.reality.update({
			where: { id: realityId },
			data: { deleted: false },
		});

		return NextResponse.json({ success: true, restored: restoredReality });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: 'Failed to restore reality', details: errorMessage }, { status: 500 });
	}
};
