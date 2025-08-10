import puppeteer, { type Browser, type Page } from 'puppeteer';
import { log } from '../utils/logger';
import { sleep } from '../utils/time';

let browserInstance: Browser | null = null;

const getBrowser = async () => {
	if (!browserInstance) {
		browserInstance = await puppeteer.launch({
			headless: 'shell',
			executablePath:
				process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--no-zygote',
				'--single-process',
				'--disable-gpu',
				'--disable-web-security',
				'--disable-features=VizDisplayCompositor',
				'--disable-background-timer-throttling',
				'--disable-backgrounding-occluded-windows',
				'--disable-renderer-backgrounding',
				'--disable-extensions',
				'--disable-plugins',
				'--disable-default-apps',
				'--no-default-browser-check',
				'--disable-hang-monitor',
				'--disable-popup-blocking',
				'--disable-prompt-on-repost',
				'--disable-sync',
				'--disable-translate',
				'--disable-background-networking',
				'--disable-background-timer-throttling',
				'--disable-client-side-phishing-detection',
				'--disable-component-update',
				'--disable-domain-reliability',
				'--disable-ipc-flooding-protection',
			],
		});
	}
	return browserInstance;
};

export const scrapePage = async (
	url: string,
	evaluate: (page: Page) => Promise<number>,
	retries = 5,
): Promise<number> => {
	const browser = await getBrowser();
	const page = await browser.newPage();

	try {
		log('Scraping page', url);
		// Set faster page loading
		page.setDefaultNavigationTimeout(10000);
		page.setDefaultTimeout(10000);

		// Block unnecessary resources
		await page.setRequestInterception(true);
		page.on('request', req => {
			if (
				req.resourceType() === 'stylesheet' ||
				req.resourceType() === 'font' ||
				req.resourceType() === 'image'
			) {
				req.abort();
			} else {
				req.continue();
			}
		});

		await page.goto(url, {
			waitUntil: 'domcontentloaded',
			timeout: 10000,
		});

		const result = await evaluate(page);

		log('Scraped page', url, result);

		return result;
	} catch (error) {
		if (retries > 0) {
			log('Retrying...', url, error);

			// @NOTE: Lower the retry number is the bigger sleep time
			await sleep((1 / retries) * 5000);

			return await scrapePage(url, evaluate, retries - 1);
		}

		log('Scraping failed for', url, error);
		return 0;
	} finally {
		await page.close();
	}
};

export const closeBrowser = async () => {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
	}
};
