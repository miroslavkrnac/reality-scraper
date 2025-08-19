const cron = require('node-cron');

// @NOTE: Scraping URLs configuration
const SCRAPING_URLS = [
	{
		url: 'https://www.sreality.cz/hledani/prodej/byty/praha-7,praha-8,praha-9?velikost=3%2B1%2C3%2Bkk%2C4%2B1%2C4%2Bkk%2C5%2B1%2C5%2Bkk&navic=garaz%2Cparkovani%2Csklep&vlastnictvi=osobni&stari=mesic&plocha-od=50',
		type: 'FLAT_PERSONAL',
	},
	{
		url: 'https://www.sreality.cz/hledani/prodej/byty?velikost=1%2B1%2C1%2Bkk%2C2%2B1%2C2%2Bkk&vlastnictvi=osobni%2Cstatni-obecni&stari=mesic&cena-do=2000000',
		type: 'FLAT_INVESTMENT',
	},

	{
		url: 'https://www.sreality.cz/hledani/prodej/pozemky/stavebni-parcely/moravskoslezsky-kraj,olomoucky-kraj,stredocesky-kraj,zlinsky-kraj?stari=mesic&cena-do=7000&plocha-od=700&plocha-do=2000&za-m2=1&q=Kanalizace&pois_in_place_distance=5&pois_in_place=2%7C5%7C7%7C8%7C9&lat-max=59.712097173322924&lat-min=20.05593126519445&lon-max=33.35449218750001&lon-min=8.305664062500002',
		type: 'LAND_PERSONAL',
		name: 'Prague 9 Flats Page 3',
	},
	{
		url: 'https://www.sreality.cz/hledani/prodej/pozemky/stavebni-parcely?stari=mesic&cena-do=1500&plocha-do=1500&za-m2=1&q=Kanalizace',
		type: 'LAND_INVESTMENT',
	},
	{
		url: "https://www.sreality.cz/hledani/prodej/ostatni/garaze,garazova-stani/kralovehradecky-kraj,moravskoslezsky-kraj,olomoucky-kraj,pardubicky-kraj,praha,stredocesky-kraj,ustecky-kraj,zlinsky-kraj?stari=mesic&razeni=nejlevnejsi",
		type: 'OTHER'
	}
];

// @NOTE: Scraping function
const scrapeAllUrls = async () => {
	console.log('🔄 Starting scraping job at', new Date().toISOString());
	
	for (const { url, type } of SCRAPING_URLS) {
		try {
			console.log(`📡 Scraping ${type} from: ${url}`);
			
			const response = await fetch('http://localhost:3005/api/scrape', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ url, type }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log(`✅ Successfully scraped ${type}:`, result.data?.savedCount || 0, 'items saved');
		} catch (error) {
			console.error(`❌ Error scraping ${type}:`, error);
		}
	}
	
	console.log('🏁 Scraping job completed at', new Date().toISOString());
};

// @NOTE: Production cron job - runs every 30 minutes
cron.schedule(
	'*/30 * * * *',
	async () => {
		await scrapeAllUrls();
	},
	{
		timezone: 'UTC',
	},
);

scrapeAllUrls().catch(error => {
	console.error('❌ Error starting initial :', error);
});

console.log('✅ Cron job scheduled successfully - will run every 30 minutes');

// @NOTE: Keep the process running
process.on('SIGINT', () => {
	console.log('\n🛑 Stopping cron job...');
	process.exit(0);
});
