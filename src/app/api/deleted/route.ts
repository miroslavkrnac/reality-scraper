import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		// @NOTE: Get all deleted realities
		const deletedRealities = await db.reality.findMany({
			where: { deleted: true },
			orderBy: { id: 'asc' },
		});

		return NextResponse.json(deletedRealities, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json(
			{ error: 'Failed to fetch deleted realities', details: errorMessage },
			{ status: 500 },
		);
	}
};
