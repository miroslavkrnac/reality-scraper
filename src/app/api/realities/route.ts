import { db } from '@/lib/db';
import { getRealities } from '@/utils/reality.utils';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const realities = await getRealities();
		return NextResponse.json(realities);
	} catch (_error) {
		return NextResponse.json({ error: 'Failed to fetch realities' }, { status: 500 });
	}
};

export const DELETE = async (request: Request) => {
	try {
		const { realityId } = await request.json();

		if (!realityId) {
			return NextResponse.json({ error: 'Reality ID is required' }, { status: 400 });
		}

		// @NOTE: Get the reality before deleting to get its reality_id and type
		const reality = await db.reality.findUnique({
			where: { id: realityId },
			select: { reality_id: true, type: true },
		});

		if (!reality) {
			return NextResponse.json({ error: 'Reality not found' }, { status: 404 });
		}

		// @NOTE: Delete the reality and all related liked records
		const deletedReality = await db.reality.delete({
			where: { id: realityId },
		});

		// @NOTE: Create record in deleted table
		await db.deleted.create({
			data: {
				reality_id: reality.reality_id,
				type: reality.type,
			},
		});

		return NextResponse.json({ success: true, deleted: deletedReality });
	} catch (error) {
		// @NOTE: Log error for debugging
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: 'Failed to delete reality', details: errorMessage }, { status: 500 });
	}
};
