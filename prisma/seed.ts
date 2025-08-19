import { PrismaClient, RealityType } from '@prisma/client';

const prisma = new PrismaClient();

const fakeRealities = [
	// @NOTE: Flat Personal - for personal use
	{ 
		link: '/detail/cozy-downtown-apartment',
		img_src: 'https://example.com/img1.jpg',
		title: 'Cozy Downtown Apartment',
		location: 'Downtown, Prague',
		price: '2,500,000 Kč',
		reality_id: 'cozy-downtown-1',
		type: RealityType.FLAT_PERSONAL 
	},
	{ 
		link: '/detail/modern-city-loft',
		img_src: 'https://example.com/img2.jpg',
		title: 'Modern City Loft',
		location: 'City Center, Prague',
		price: '3,200,000 Kč',
		reality_id: 'modern-loft-2',
		type: RealityType.FLAT_PERSONAL 
	},
	{ 
		link: '/detail/family-home-suburbs',
		img_src: 'https://example.com/img3.jpg',
		title: 'Family Home in Suburbs',
		location: 'Suburbs, Prague',
		price: '4,800,000 Kč',
		reality_id: 'family-home-3',
		type: RealityType.FLAT_PERSONAL 
	},
	{ 
		link: '/detail/riverside-condo',
		img_src: 'https://example.com/img4.jpg',
		title: 'Riverside Condo',
		location: 'Riverside, Prague',
		price: '3,900,000 Kč',
		reality_id: 'riverside-condo-4',
		type: RealityType.FLAT_PERSONAL 
	},
	{ 
		link: '/detail/mountain-view-apartment',
		img_src: 'https://example.com/img5.jpg',
		title: 'Mountain View Apartment',
		location: 'Mountain District, Prague',
		price: '2,800,000 Kč',
		reality_id: 'mountain-view-5',
		type: RealityType.FLAT_PERSONAL 
	},
	
	// @NOTE: Flat Investment - for rental income
	{ 
		link: '/detail/student-housing-complex',
		img_src: 'https://example.com/img6.jpg',
		title: 'Student Housing Complex',
		location: 'University District, Prague',
		price: '5,500,000 Kč',
		reality_id: 'student-housing-6',
		type: RealityType.FLAT_INVESTMENT 
	},
	{ 
		link: '/detail/luxury-rental-apartment',
		img_src: 'https://example.com/img7.jpg',
		title: 'Luxury Rental Apartment',
		location: 'Luxury District, Prague',
		price: '8,200,000 Kč',
		reality_id: 'luxury-rental-7',
		type: RealityType.FLAT_INVESTMENT 
	},
	{ 
		link: '/detail/short-term-vacation-rental',
		img_src: 'https://example.com/img8.jpg',
		title: 'Short-term Vacation Rental',
		location: 'Tourist Area, Prague',
		price: '6,800,000 Kč',
		reality_id: 'vacation-rental-8',
		type: RealityType.FLAT_INVESTMENT 
	},
	{ 
		link: '/detail/office-space-conversion',
		img_src: 'https://example.com/img9.jpg',
		title: 'Office Space Conversion',
		location: 'Business District, Prague',
		price: '4,500,000 Kč',
		reality_id: 'office-conversion-9',
		type: RealityType.FLAT_INVESTMENT 
	},
	{ 
		link: '/detail/multi-unit-building',
		img_src: 'https://example.com/img10.jpg',
		title: 'Multi-unit Building',
		location: 'Residential Area, Prague',
		price: '12,000,000 Kč',
		reality_id: 'multi-unit-10',
		type: RealityType.FLAT_INVESTMENT 
	},
	
	// @NOTE: Land Personal - for personal use
	{ 
		link: '/detail/countryside-estate',
		img_src: 'https://example.com/img11.jpg',
		title: 'Countryside Estate',
		location: 'Countryside, Central Bohemia',
		price: '15,000,000 Kč',
		reality_id: 'countryside-estate-11',
		type: RealityType.LAND_PERSONAL 
	},
	{ 
		link: '/detail/garden-plot-city',
		img_src: 'https://example.com/img12.jpg',
		title: 'Garden Plot in City',
		location: 'Garden District, Prague',
		price: '3,500,000 Kč',
		reality_id: 'garden-plot-12',
		type: RealityType.LAND_PERSONAL 
	},
	{ 
		link: '/detail/mountain-cabin-site',
		img_src: 'https://example.com/img13.jpg',
		title: 'Mountain Cabin Site',
		location: 'Mountain Region, Bohemia',
		price: '8,500,000 Kč',
		reality_id: 'mountain-cabin-13',
		type: RealityType.LAND_PERSONAL 
	},
	{ 
		link: '/detail/farmland-hobby',
		img_src: 'https://example.com/img14.jpg',
		title: 'Farmland for Hobby',
		location: 'Agricultural Area, Bohemia',
		price: '6,200,000 Kč',
		reality_id: 'farmland-hobby-14',
		type: RealityType.LAND_PERSONAL 
	},
	{ 
		link: '/detail/private-forest-land',
		img_src: 'https://example.com/img15.jpg',
		title: 'Private Forest Land',
		location: 'Forest Region, Bohemia',
		price: '18,000,000 Kč',
		reality_id: 'private-forest-15',
		type: RealityType.LAND_PERSONAL 
	},
	
	// @NOTE: Land Investment - for development
	{ 
		link: '/detail/commercial-development-site',
		img_src: 'https://example.com/img16.jpg',
		title: 'Commercial Development Site',
		location: 'Commercial Zone, Prague',
		price: '25,000,000 Kč',
		reality_id: 'commercial-dev-16',
		type: RealityType.LAND_INVESTMENT 
	},
	{ 
		link: '/detail/industrial-zone-land',
		img_src: 'https://example.com/img17.jpg',
		title: 'Industrial Zone Land',
		location: 'Industrial District, Prague',
		price: '20,000,000 Kč',
		reality_id: 'industrial-land-17',
		type: RealityType.LAND_INVESTMENT 
	},
	{ 
		link: '/detail/residential-development-plot',
		img_src: 'https://example.com/img18.jpg',
		title: 'Residential Development Plot',
		location: 'Development Area, Prague',
		price: '30,000,000 Kč',
		reality_id: 'residential-dev-18',
		type: RealityType.LAND_INVESTMENT 
	},
	{ 
		link: '/detail/shopping-center-location',
		img_src: 'https://example.com/img19.jpg',
		title: 'Shopping Center Location',
		location: 'Retail District, Prague',
		price: '35,000,000 Kč',
		reality_id: 'shopping-center-19',
		type: RealityType.LAND_INVESTMENT 
	},
	{ 
		link: '/detail/hotel-construction-site',
		img_src: 'https://example.com/img20.jpg',
		title: 'Hotel Construction Site',
		location: 'Tourism District, Prague',
		price: '40,000,000 Kč',
		reality_id: 'hotel-site-20',
		type: RealityType.LAND_INVESTMENT 
	},
	
	// @NOTE: Additional mixed types for variety
	{ 
		link: '/detail/mixed-use-building',
		img_src: 'https://example.com/img21.jpg',
		title: 'Mixed-use Building',
		location: 'Mixed District, Prague',
		price: '22,000,000 Kč',
		reality_id: 'mixed-use-21',
		type: RealityType.FLAT_INVESTMENT 
	},
	{ 
		link: '/detail/heritage-property',
		img_src: 'https://example.com/img22.jpg',
		title: 'Heritage Property',
		location: 'Historic District, Prague',
		price: '45,000,000 Kč',
		reality_id: 'heritage-property-22',
		type: RealityType.FLAT_PERSONAL 
	},
	{ 
		link: '/detail/eco-friendly-development',
		img_src: 'https://example.com/img23.jpg',
		title: 'Eco-friendly Development',
		location: 'Green District, Prague',
		price: '28,000,000 Kč',
		reality_id: 'eco-dev-23',
		type: RealityType.LAND_INVESTMENT 
	},
	{ 
		link: '/detail/waterfront-property',
		img_src: 'https://example.com/img24.jpg',
		title: 'Waterfront Property',
		location: 'Waterfront District, Prague',
		price: '50,000,000 Kč',
		reality_id: 'waterfront-24',
		type: RealityType.LAND_PERSONAL 
	},
	{ 
		link: '/detail/tech-hub-location',
		img_src: 'https://example.com/img25.jpg',
		title: 'Tech Hub Location',
		location: 'Tech District, Prague',
		price: '32,000,000 Kč',
		reality_id: 'tech-hub-25',
		type: RealityType.LAND_INVESTMENT 
	},
];

const main = async () => {
	console.log('🌱 Starting seed...');

	// @NOTE: Clear existing data
	await prisma.reality.deleteMany();
	console.log('🗑️  Cleared existing data');

	// @NOTE: Create realities
	const realities = await prisma.reality.createMany({
		data: fakeRealities,
		skipDuplicates: true,
	});
	console.log(`✅ Created ${realities.count} realities`);

	// @NOTE: Update some realities to be liked (for demonstration)
	const realitiesToUpdate = await prisma.reality.findMany({
		orderBy: { id: 'asc' },
		take: 10, // @NOTE: Like first 10 realities
	});

	for (const reality of realitiesToUpdate) {
		await prisma.reality.update({
			where: { id: reality.id },
			data: { liked: true },
		});
	}
	console.log(`✅ Updated ${realitiesToUpdate.length} realities as liked`);

	console.log('🌱 Seed completed!');
};

main()
	.catch(e => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
