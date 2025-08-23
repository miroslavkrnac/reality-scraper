import { db } from '@/lib/db';
import { log } from '@/utils/logger';
import { NextResponse } from 'next/server';

export const POST = async () => {
	try {
		// @NOTE: Fetch all realities from database
		const realities = await db.reality.findMany();

		for (const reality of realities) {
			const page = await fetch(`https://www.sreality.cz${reality.link}`).then(res => res.text());

			if (page.includes('/_next/static/media/not-found')) {
				log(`Reality ${reality.link} is not found, ID: ${reality.id}`);
				await db.reality.delete({
					where: { id: reality.id },
				});
			}
		}

		return NextResponse.json({
			success: true,
			message: 'Realities removed successfully',
		});
	} catch (error) {
		log('Error removing unused realities:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to remove unused realities',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
};
