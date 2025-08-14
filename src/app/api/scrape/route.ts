import type { RealityType } from '@prisma/client';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { scrapePage } from '../../../scraper/scraper.utils';
import { log } from '../../../utils/logger';

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const { url, type } = await request.json();

		if (!url || typeof url !== 'string') {
			return NextResponse.json(
				{
					success: false,
					error: 'URL is required and must be a string',
				},
				{ status: 400 },
			);
		}

		if (!type || !['FLAT_PERSONAL', 'FLAT_INVESTMENT', 'LAND_PERSONAL', 'LAND_INVESTMENT'].includes(type)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Type is required and must be one of: FLAT_PERSONAL, FLAT_INVESTMENT, LAND_PERSONAL, LAND_INVESTMENT',
				},
				{ status: 400 },
			);
		}

		log('Starting scraping of', url);

		const allEstates = await scrapePage(url, async page => {
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

			// @NOTE: Recursive function to scrape all pages
			const scrapeAllPages = async (): Promise<
				Array<{
					id: string | undefined;
					link: string | undefined;
					img: string | undefined;
					title: string | undefined;
					location: string | undefined;
					price: string | undefined;
				}>
			> => {
				// @NOTE: Extract data from current page
				const pageEstates = await page.evaluate(async () => {
					const estateElements = document.querySelectorAll(
						'[data-e2e="estates-list"] > li:not([id^="estate-list-native-"])',
					);
					return Array.from(estateElements).map(estate => ({
						id: estate
							.getAttribute('id')
							?.replace('estate-list-item-', '')
							.replace(/region-tip-item-\d+-/gim, ''),
						link: estate.querySelector('a')?.getAttribute('href') || undefined,
						img: estate.querySelector('img:nth-of-type(2)')?.getAttribute('src')?.replace('//', 'https://'),
						title: estate.querySelector('a p:first-of-type')?.textContent?.trim(),
						location: estate.querySelector('a p:nth-of-type(2)')?.textContent?.trim(),
						price: estate.querySelector('a p:nth-of-type(3)')?.textContent?.trim(),
					}));
				});

				log(`Extracted ${pageEstates.length} estates from current page`);

				// @NOTE: Check if there's a "show-more-btn" and click it
				const showMoreBtn = await page.$('[data-e2e="show-more-btn"]');
				if (!showMoreBtn) {
					log('No more pages to load');
					return pageEstates;
				}

				log('Found show-more-btn, clicking to load next page');
				await showMoreBtn.click();

				// @NOTE: Wait for new content to load
				await new Promise(resolve => setTimeout(resolve, 2000));

				// @NOTE: Wait for the estates list to update
				await page.waitForFunction(
					() => {
						const estateElements = document.querySelectorAll(
							'[data-e2e="estates-list"] > li[id^="estate-list-item-"]',
						);
						return estateElements.length > 0;
					},
					{ timeout: 10000 },
				);

				// @NOTE: Recursively scrape the next page and combine results
				const nextPageEstates = await scrapeAllPages();
				return [...pageEstates, ...nextPageEstates];
			};

			return scrapeAllPages();
		});

		log('Scraping completed successfully');

		// @NOTE: Save scraped data to database
		const savedEstates = [];
		const skippedEstates = [];
		for (const estate of allEstates) {
			if (estate.id && estate.link && estate.title && estate.location && estate.price) {
				try {
					// @NOTE: Check if this estate is in the deleted table
					const deletedRecord = await db.deleted.findUnique({
						where: { reality_id: estate.id },
					});

					if (deletedRecord) {
						log(`Skipping estate ${estate.id} - it was previously deleted`);
						skippedEstates.push(estate.id);
						continue;
					}

					const savedEstate = await db.reality.upsert({
						where: { reality_id: estate.id },
						update: {
							link: estate.link,
							img_src: estate.img,
							title: estate.title,
							location: estate.location,
							price: estate.price,
							type: type as RealityType,
						},
						create: {
							link: estate.link,
							img_src: estate.img,
							title: estate.title,
							location: estate.location,
							price: estate.price,
							reality_id: estate.id,
							type: type as RealityType,
						},
					});
					savedEstates.push(savedEstate);
				} catch (error) {
					log('Error saving estate:', error);
				}
			}
		}

		log(`Saved ${savedEstates.length} estates to database`);
		if (skippedEstates.length > 0) {
			log(`Skipped ${skippedEstates.length} previously deleted estates`);
		}

		return NextResponse.json({
			success: true,
			data: {
				url,
				type,
				estates: allEstates,
				savedCount: savedEstates.length,
				skippedCount: skippedEstates.length,
				skippedEstates,
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
