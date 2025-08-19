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

		// @NOTE: Update the reality to mark it as deleted instead of actually deleting it
		const updatedReality = await db.reality.update({
			where: { id: realityId },
			data: { deleted: true },
		});

		return NextResponse.json({ success: true, updated: updatedReality });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: 'Failed to delete reality', details: errorMessage }, { status: 500 });
	}
};
