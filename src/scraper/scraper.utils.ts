import puppeteer, { type Browser, type Page } from 'puppeteer';
import { log } from '../utils/logger';
import { sleep } from '../utils/time';

let browserInstance: Browser | null = null;

const getBrowser = async () => {
	if (!browserInstance) {
		browserInstance = await puppeteer.launch({
			headless: false,
			executablePath:
				process.env.PUPPETEER_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-blink-features=AutomationControlled',
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
				'--disable-client-side-phishing-detection',
				'--disable-component-update',
				'--disable-domain-reliability',
				'--disable-ipc-flooding-protection',
				'--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
		
		// @NOTE: Set anti-detection measures
		await page.evaluateOnNewDocument(() => {
			// @NOTE: Remove webdriver property
			(navigator as any).webdriver = undefined;
			
			// @NOTE: Override plugins to look more human
			Object.defineProperty(navigator, 'plugins', {
				get: () => [1, 2, 3, 4, 5],
			});
			
			// @NOTE: Override languages
			Object.defineProperty(navigator, 'languages', {
				get: () => ['cs-CZ', 'cs', 'en'],
			});
			
			// @NOTE: Override permissions
			const originalQuery = window.navigator.permissions.query;
			window.navigator.permissions.query = (parameters: any) => {
				if (parameters.name === 'notifications') {
					return Promise.resolve({ 
						state: Notification.permission,
						name: 'notifications',
						onchange: null,
						addEventListener: () => {
							// @NOTE: Empty implementation for anti-detection
						},
						removeEventListener: () => {
							// @NOTE: Empty implementation for anti-detection
						},
						dispatchEvent: () => true,
					} as PermissionStatus);
				}
				return originalQuery(parameters);
			};
			
			// @NOTE: Override chrome runtime
			(window as any).chrome = {
				runtime: {},
			};
			
			// @NOTE: Override permissions API
			Object.defineProperty(navigator, 'permissions', {
				get: () => ({
					query: window.navigator.permissions.query,
				}),
			});
		});

		// @NOTE: Set realistic viewport
		await page.setViewport({
			width: 1920,
			height: 1080,
			deviceScaleFactor: 1,
		});

		// @NOTE: Set user agent
		await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

		// @NOTE: Set longer timeouts for better reliability
		page.setDefaultNavigationTimeout(30000);
		page.setDefaultTimeout(30000);

		await page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: 30000,
		});

		// @NOTE: Wait a bit for any dynamic content to load
		await sleep(2000 + Math.random() * 3000); // @NOTE: Random delay to appear more human

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
		try {
			await page.close();
		} catch (closeError) {
			// @NOTE: Ignore close errors as the page might already be closed
			log('Page close error (ignored):', closeError);
		}
	}
};

export const closeBrowser = async () => {
	if (browserInstance) {
		await browserInstance.close();
		browserInstance = null;
	}
};
