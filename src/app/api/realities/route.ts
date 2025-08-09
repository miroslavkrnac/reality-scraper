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
