const puppeteer = require('puppeteer');

async function debugScraper() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const data = await page.evaluate(() => {
            const articles = Array.from(document.querySelectorAll('article.index-list'));
            // Get the 5th item (likely old)
            const el = articles[4];
            return {
                html: el ? el.outerHTML : 'Not found',
                text: el ? el.innerText : '',
                total: articles.length
            };
        });

        console.log('Old Article HTML:', data.html);

    } catch (e) {
        console.error('Debug failed:', e);
    } finally {
        await browser.close();
    }
}

debugScraper();
