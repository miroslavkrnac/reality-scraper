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


    return page.evaluate(async () => {
        const estates = document.querySelectorAll('[data-e2e="estates-list"] > li[id^="estate-list-item-"]');
        return Array.from(estates).map(estate => ({
            id: estate.getAttribute('id')?.replace('estate-list-item-', ''),
            link: estate.querySelector('a')?.getAttribute('href'),
            img: estate.querySelector('img:nth-of-type(2)')?.getAttribute('src')?.replace("//", "https://"),
            title: estate.querySelector('a p:first-of-type')?.textContent?.trim(),
            location: estate.querySelector('a p:nth-of-type(2)')?.textContent?.trim(),
            price: estate.querySelector('a p:nth-of-type(3)')?.textContent?.trim(),
        }));
    });
});