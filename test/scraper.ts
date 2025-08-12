import { scrapePage } from '@/scraper/scraper.utils';
import { sleep } from '@/utils/time';

scrapePage('https://www.sreality.cz/hledani/prodej/byty/praha-9?strana=2&velikost=3%2Bkk%2C4%2Bkk%2C5%2Bkk%2C6-a-vice&navic=garaz%2Cparkovani&stari=mesic', async page => {
    // @NOTE: Check if we can find the estates list
    try {
        await page.waitForSelector('[data-e2e="estates-list"]', { timeout: 3000 });
        console.log('Estates list found successfully');
    } catch (error) {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');

        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        await page.waitForSelector('[data-e2e="estates-list"]', { timeout: 3000 });
        console.log('Estates list found successfully');
    }

	return 0;
});