
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Starting deep scrape...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://halkarz.com/', { waitUntil: 'networkidle2', timeout: 60000 });

        let loadMoreFound = true;
        let clicks = 0;
        const maxClicks = 15; // Should be enough to get several years of data

        while (loadMoreFound && clicks < maxClicks) {
            console.log(`Searching for button (Click ${clicks + 1})...`);

            const buttonSelector = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('button, a, div, span'));
                const btn = elements.find(el => el.innerText && el.innerText.toUpperCase().includes('DAHA FAZLA GÖSTER'));
                if (btn) {
                    // Try to get a unique selector or just use xpath-like approach
                    btn.scrollIntoView();
                    return true;
                }
                return false;
            });

            if (buttonSelector) {
                console.log('Button found, clicking...');
                await page.evaluate(() => {
                    const elements = Array.from(document.querySelectorAll('button, a, div, span'));
                    const btn = elements.find(el => el.innerText && el.innerText.toUpperCase().includes('DAHA FAZLA GÖSTER'));
                    if (btn) btn.click();
                });
                clicks++;
                await new Promise(r => setTimeout(r, 2000)); // Wait for load
            } else {
                console.log('No more buttons found.');
                loadMoreFound = false;
            }
        }

        const items = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article.index-list')).map(el => el.innerText.split('\n')[0]);
        });

        console.log(`Final count: ${items.length} items.`);
        fs.writeFileSync('scripts/deep_scrape_results.json', JSON.stringify(items, null, 2));

    } catch (error) {
        console.error('Deep scrape failed:', error);
    } finally {
        await browser.close();
    }
})();
