const puppeteer = require('puppeteer');

async function debugScraper() {
    console.log('Starting debug scrape...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to homepage...');
        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const firstItemHTML = await page.evaluate(() => {
            const el = document.querySelector('article.index-list');
            return el ? el.outerHTML : 'Not found';
        });

        console.log('First Article HTML:', firstItemHTML);

    } catch (e) {
        console.error('Debug failed:', e);
    } finally {
        await browser.close();
    }
}

debugScraper();
