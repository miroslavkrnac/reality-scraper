import { NextResponse } from 'next/server';
import { scrapePage } from '../../../scraper/scraper.utils';
import { log } from '../../../utils/logger';

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const { url } = await request.json();

		if (!url || typeof url !== 'string') {
			return NextResponse.json(
				{
					success: false,
					error: 'URL is required and must be a string',
				},
				{ status: 400 },
			);
		}

		log('Starting scraping of', url);

		const estates = await scrapePage(url, async page => {
			// @NOTE: Check if we can find the estates list
			try {
				await page.waitForSelector('[data-e2e="estates-list"]', { timeout: 3000 });
				log('Estates list found successfully');
			} catch (_error) {
				await page.keyboard.press('Tab');
				await page.keyboard.press('Enter');

				await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

				await page.waitForSelector('[data-e2e="estates-list"]', { timeout: 3000 });
				log('Estates list found successfully');
			}

			return page.evaluate(async () => {
				const estateElements = document.querySelectorAll(
					'[data-e2e="estates-list"] > li[id^="estate-list-item-"]',
				);
				return Array.from(estateElements).map(estate => ({
					id: estate.getAttribute('id')?.replace('estate-list-item-', ''),
					link: estate.querySelector('a')?.getAttribute('href'),
					img: estate.querySelector('img:nth-of-type(2)')?.getAttribute('src')?.replace('//', 'https://'),
					title: estate.querySelector('a p:first-of-type')?.textContent?.trim(),
					location: estate.querySelector('a p:nth-of-type(2)')?.textContent?.trim(),
					price: estate.querySelector('a p:nth-of-type(3)')?.textContent?.trim(),
				}));
			});
		});

		log('Scraping completed successfully');

		return NextResponse.json({
			success: true,
			data: {
				url,
				estates,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		log('Error during scraping:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to scrape website',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
