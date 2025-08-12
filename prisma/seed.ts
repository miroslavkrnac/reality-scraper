import { PrismaClient, RealityType } from '@prisma/client';

const prisma = new PrismaClient();

const fakeUsers = [
	{ name: 'John Doe', email: 'john@example.com' },
	{ name: 'Jane Smith', email: 'jane@example.com' },
	{ name: 'Bob Johnson', email: 'bob@example.com' },
	{ name: 'Alice Brown', email: 'alice@example.com' },
	{ name: 'Charlie Wilson', email: 'charlie@example.com' },
];

const fakeRealities = [
	// @NOTE: Flat Personal - for personal use
	{ name: 'Cozy Downtown Apartment', type: RealityType.FLAT_PERSONAL },
	{ name: 'Modern City Loft', type: RealityType.FLAT_PERSONAL },
	{ name: 'Family Home in Suburbs', type: RealityType.FLAT_PERSONAL },
	{ name: 'Riverside Condo', type: RealityType.FLAT_PERSONAL },
	{ name: 'Mountain View Apartment', type: RealityType.FLAT_PERSONAL },
	
	// @NOTE: Flat Investment - for rental income
	{ name: 'Student Housing Complex', type: RealityType.FLAT_INVESTMENT },
	{ name: 'Luxury Rental Apartment', type: RealityType.FLAT_INVESTMENT },
	{ name: 'Short-term Vacation Rental', type: RealityType.FLAT_INVESTMENT },
	{ name: 'Office Space Conversion', type: RealityType.FLAT_INVESTMENT },
	{ name: 'Multi-unit Building', type: RealityType.FLAT_INVESTMENT },
	
	// @NOTE: Land Personal - for personal use
	{ name: 'Countryside Estate', type: RealityType.LAND_PERSONAL },
	{ name: 'Garden Plot in City', type: RealityType.LAND_PERSONAL },
	{ name: 'Mountain Cabin Site', type: RealityType.LAND_PERSONAL },
	{ name: 'Farmland for Hobby', type: RealityType.LAND_PERSONAL },
	{ name: 'Private Forest Land', type: RealityType.LAND_PERSONAL },
	
	// @NOTE: Land Investment - for development
	{ name: 'Commercial Development Site', type: RealityType.LAND_INVESTMENT },
	{ name: 'Industrial Zone Land', type: RealityType.LAND_INVESTMENT },
	{ name: 'Residential Development Plot', type: RealityType.LAND_INVESTMENT },
	{ name: 'Shopping Center Location', type: RealityType.LAND_INVESTMENT },
	{ name: 'Hotel Construction Site', type: RealityType.LAND_INVESTMENT },
	
	// @NOTE: Additional mixed types for variety
	{ name: 'Mixed-use Building', type: RealityType.FLAT_INVESTMENT },
	{ name: 'Heritage Property', type: RealityType.FLAT_PERSONAL },
	{ name: 'Eco-friendly Development', type: RealityType.LAND_INVESTMENT },
	{ name: 'Waterfront Property', type: RealityType.LAND_PERSONAL },
	{ name: 'Tech Hub Location', type: RealityType.LAND_INVESTMENT },
];

const main = async () => {
	console.log('🌱 Starting seed...');

	// @NOTE: Clear existing data
	await prisma.liked.deleteMany();
	await prisma.reality.deleteMany();
	await prisma.user.deleteMany();
	console.log('🗑️  Cleared existing data');

	// @NOTE: Create users
	const users = await prisma.user.createMany({
		data: fakeUsers,
		skipDuplicates: true,
	});
	console.log(`✅ Created ${users.count} users`);

	// @NOTE: Create realities
	const realities = await prisma.reality.createMany({
		data: fakeRealities,
		skipDuplicates: true,
	});
	console.log(`✅ Created ${realities.count} realities`);

	// @NOTE: Get the created users and realities to get their actual IDs
	const createdUsers = await prisma.user.findMany({
		orderBy: { id: 'asc' },
	});
	const createdRealities = await prisma.reality.findMany({
		orderBy: { id: 'asc' },
	});

	// @NOTE: Create some sample likes using actual IDs
	const sampleLikes = [
		// @NOTE: Popular personal properties
		{ realityId: createdRealities[0].id, userId: createdUsers[0].id }, // John likes Cozy Downtown Apartment
		{ realityId: createdRealities[0].id, userId: createdUsers[1].id }, // Jane likes Cozy Downtown Apartment
		{ realityId: createdRealities[0].id, userId: createdUsers[2].id }, // Bob likes Cozy Downtown Apartment
		{ realityId: createdRealities[1].id, userId: createdUsers[0].id }, // John likes Modern City Loft
		{ realityId: createdRealities[1].id, userId: createdUsers[3].id }, // Alice likes Modern City Loft
		{ realityId: createdRealities[2].id, userId: createdUsers[1].id }, // Jane likes Family Home in Suburbs
		{ realityId: createdRealities[2].id, userId: createdUsers[4].id }, // Charlie likes Family Home in Suburbs
		
		// @NOTE: Investment properties
		{ realityId: createdRealities[5].id, userId: createdUsers[0].id }, // John likes Student Housing Complex
		{ realityId: createdRealities[6].id, userId: createdUsers[1].id }, // Jane likes Luxury Rental Apartment
		{ realityId: createdRealities[7].id, userId: createdUsers[2].id }, // Bob likes Short-term Vacation Rental
		{ realityId: createdRealities[8].id, userId: createdUsers[3].id }, // Alice likes Office Space Conversion
		{ realityId: createdRealities[9].id, userId: createdUsers[4].id }, // Charlie likes Multi-unit Building
		
		// @NOTE: Land properties
		{ realityId: createdRealities[10].id, userId: createdUsers[0].id }, // John likes Countryside Estate
		{ realityId: createdRealities[11].id, userId: createdUsers[1].id }, // Jane likes Garden Plot in City
		{ realityId: createdRealities[12].id, userId: createdUsers[2].id }, // Bob likes Mountain Cabin Site
		{ realityId: createdRealities[13].id, userId: createdUsers[3].id }, // Alice likes Farmland for Hobby
		{ realityId: createdRealities[14].id, userId: createdUsers[4].id }, // Charlie likes Private Forest Land
		
		// @NOTE: Development properties
		{ realityId: createdRealities[15].id, userId: createdUsers[0].id }, // John likes Commercial Development Site
		{ realityId: createdRealities[16].id, userId: createdUsers[1].id }, // Jane likes Industrial Zone Land
		{ realityId: createdRealities[17].id, userId: createdUsers[2].id }, // Bob likes Residential Development Plot
		{ realityId: createdRealities[18].id, userId: createdUsers[3].id }, // Alice likes Shopping Center Location
		{ realityId: createdRealities[19].id, userId: createdUsers[4].id }, // Charlie likes Hotel Construction Site
		
		// @NOTE: Mixed properties
		{ realityId: createdRealities[20].id, userId: createdUsers[0].id }, // John likes Mixed-use Building
		{ realityId: createdRealities[21].id, userId: createdUsers[1].id }, // Jane likes Heritage Property
		{ realityId: createdRealities[22].id, userId: createdUsers[2].id }, // Bob likes Eco-friendly Development
		{ realityId: createdRealities[23].id, userId: createdUsers[3].id }, // Alice likes Waterfront Property
		{ realityId: createdRealities[24].id, userId: createdUsers[4].id }, // Charlie likes Tech Hub Location
	];

	await prisma.liked.createMany({
		data: sampleLikes,
		skipDuplicates: true,
	});
	console.log(`✅ Created ${sampleLikes.length} likes`);

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
