export interface Reality {
	id: number;
	name: string;
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
