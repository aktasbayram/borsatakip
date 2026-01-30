
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('Starting debug scrape...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const data = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('article.index-list')).slice(0, 10); // Get first 10
            return items.map(el => {
                return {
                    html: el.outerHTML,
                    text: el.innerText
                };
            });
        });

        const outputPath = path.join(__dirname, 'debug_ipos_dump.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Saved debug data to ${outputPath}`);

    } catch (error) {
        console.error('Debug scrape failed:', error);
    } finally {
        await browser.close();
    }
})();
