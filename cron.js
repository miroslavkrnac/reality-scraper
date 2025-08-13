const cron = require('node-cron');

// @NOTE: Scraping URLs configuration
const SCRAPING_URLS = [
	{
		url: 'https://www.sreality.cz/hledani/prodej/byty/praha-9?velikost=3%2Bkk%2C4%2Bkk%2C5%2Bkk%2C6-a-vice&navic=garaz%2Cparkovani&stari=mesic',
		type: 'FLAT_PERSONAL',
		name: 'Prague 9 Flats',
	},
	{
		url: 'https://www.sreality.cz/hledani/prodej/byty/praha-9?strana=2&velikost=3%2Bkk%2C4%2Bkk%2C5%2Bkk%2C6-a-vice&navic=garaz%2Cparkovani&stari=mesic',
		type: 'FLAT_PERSONAL',
		name: 'Prague 9 Flats Page 2',
	},
];


// const response = await fetch('http://localhost:3000'}/api/scrape`, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ url, type }),
// });

// @NOTE: Test cron job - runs every 1 second
cron.schedule(
	'*/15 * * * * *',
	() => {
		console.log('⏰ Test cron job running every 15 seconds');
	},
	{
		timezone: 'UTC',
	},
);

console.log('✅ Cron job scheduled successfully');

// @NOTE: Keep the process running
process.on('SIGINT', () => {
	console.log('\n🛑 Stopping cron job...');
	process.exit(0);
});
