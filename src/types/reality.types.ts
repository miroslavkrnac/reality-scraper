export type RealityType = 'FLAT_PERSONAL' | 'FLAT_INVESTMENT' | 'LAND_PERSONAL' | 'LAND_INVESTMENT' | 'OTHER';

export interface Reality {
	id: number;
	link: string;
	img_src: string | null;
	title: string;
	location: string;
	price: string;
	reality_id: string;
	type: RealityType;
}

export interface User {
	id: number;
	name: string;
	email: string;
}

export interface RealityWithLikedUsers extends Reality {
	liked: {
		user: User;
	}[];
}
