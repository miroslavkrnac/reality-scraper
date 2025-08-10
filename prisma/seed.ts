import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fakeUsers = [
	{ name: 'John Doe', email: 'john@example.com' },
	{ name: 'Jane Smith', email: 'jane@example.com' },
	{ name: 'Bob Johnson', email: 'bob@example.com' },
	{ name: 'Alice Brown', email: 'alice@example.com' },
	{ name: 'Charlie Wilson', email: 'charlie@example.com' },
];

const fakeRealities = [
	{ name: 'Reality One' },
	{ name: 'Reality Two' },
	{ name: 'Reality Three' },
	{ name: 'Reality Four' },
	{ name: 'Reality Five' },
	{ name: 'Reality Six' },
	{ name: 'Reality Seven' },
	{ name: 'Reality Eight' },
	{ name: 'Reality Nine' },
	{ name: 'Reality Ten' },
	{ name: 'Reality Eleven' },
	{ name: 'Reality Twelve' },
	{ name: 'Reality Thirteen' },
	{ name: 'Reality Fourteen' },
	{ name: 'Reality Fifteen' },
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
		{ realityId: createdRealities[0].id, userId: createdUsers[0].id }, // John likes Reality One
		{ realityId: createdRealities[0].id, userId: createdUsers[1].id }, // Jane likes Reality One
		{ realityId: createdRealities[1].id, userId: createdUsers[0].id }, // John likes Reality Two
		{ realityId: createdRealities[2].id, userId: createdUsers[2].id }, // Bob likes Reality Three
		{ realityId: createdRealities[3].id, userId: createdUsers[1].id }, // Jane likes Reality Four
		{ realityId: createdRealities[3].id, userId: createdUsers[3].id }, // Alice likes Reality Four
		{ realityId: createdRealities[4].id, userId: createdUsers[4].id }, // Charlie likes Reality Five
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
