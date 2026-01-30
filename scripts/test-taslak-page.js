
const puppeteer = require('puppeteer');

(async () => {
    console.log('Checking taslak category page...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://halkarz.com/k/taslak/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const data = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('article.index-list'));
            return {
                count: items.length,
                firstItem: items[0]?.innerText?.split('\n')[0],
                pagination: !!document.querySelector('.pagination, .nav-links')
            };
        });

        console.log('Result:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await browser.close();
    }
})();
