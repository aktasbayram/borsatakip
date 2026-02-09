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

        const items = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article.index-list')).map(el => {
                const header = el.querySelector('h3')?.innerText || '';
                const text = el.innerText;
                const time = el.querySelector('time')?.innerText || '';
                const isNew = !!el.querySelector('.il-new');

                return {
                    company: header.trim(),
                    textSample: text.substring(0, 100).replace(/\n/g, ' '), // First 100 chars
                    hasTalepText: /Talep\s*Toplanıyor/i.test(text),
                    timeText: time,
                    isNew
                };
            });
        });

        console.log('Found Items:', JSON.stringify(items, null, 2));

        // Also check if selector 'article.index-list' is still valid or key elements changed
        const articleCount = await page.evaluate(() => document.querySelectorAll('article').length);
        console.log(`Total articles found: ${articleCount}`);

    } catch (e) {
        console.error('Debug failed:', e);
    } finally {
        await browser.close();
    }
}

debugScraper();
