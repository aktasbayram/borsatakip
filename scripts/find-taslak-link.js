
const puppeteer = require('puppeteer');

(async () => {
    console.log('Searching for Taslak link...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const links = await page.evaluate(() => {
            const allLinks = Array.from(document.querySelectorAll('a'));
            return allLinks
                .filter(a => a.innerText.toLowerCase().includes('taslak'))
                .map(a => ({ text: a.innerText, href: a.href }));
        });

        console.log('Draft links found:', JSON.stringify(links, null, 2));

    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        await browser.close();
    }
})();
