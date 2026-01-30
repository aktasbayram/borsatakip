
const puppeteer = require('puppeteer');

(async () => {
    console.log('Checking taslak page...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://halkarz.com/taslak-halka-arzlar/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const count = await page.evaluate(() => {
            return document.querySelectorAll('article.index-list').length;
        });

        console.log(`Found ${count} items on taslak page.`);

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await browser.close();
    }
})();
