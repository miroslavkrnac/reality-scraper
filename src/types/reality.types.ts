export type RealityType = 'FLAT_PERSONAL' | 'FLAT_INVESTMENT' | 'LAND_PERSONAL' | 'LAND_INVESTMENT';

export interface Reality {
	id: number;
	name: string;
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
