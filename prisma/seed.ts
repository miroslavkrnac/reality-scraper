import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
	await prisma.reality.deleteMany();
	console.log('🗑️  Cleared existing realities');

	// @NOTE: Create new realities
	const realities = await prisma.reality.createMany({
		data: fakeRealities,
		skipDuplicates: true,
	});

	console.log(`✅ Created ${realities.count} realities`);
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
