import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { log } from '../../../utils/logger';

const TARGET_URL = 'https://www.miroslavkrnac.cz/';
const SELECTOR = '.introduction';

const scrapeText = async (url: string, selector: string): Promise<string> => {
	const browser = await puppeteer.launch({
		headless: 'shell',
		executablePath:
			process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
	});

	const page = await browser.newPage();

	try {
		await page.goto(url, {
			waitUntil: 'domcontentloaded',
			timeout: 10000,
		});

		await page.waitForSelector(selector, { timeout: 5000 });
		const text = await page.$eval(selector, element => element.textContent?.trim() || '');

		return text;
	} finally {
		await page.close();
		await browser.close();
	}
};

export async function POST(): Promise<NextResponse> {
	try {
		log('Starting manual scraping of', TARGET_URL);

		const text = await scrapeText(TARGET_URL, SELECTOR);

		log('Scraped introduction text:', text);
		log('Manual scraping completed successfully');

		return NextResponse.json({
			success: true,
			data: {
				url: TARGET_URL,
				selector: SELECTOR,
				text,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		log('Error during manual scraping:', error);

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
