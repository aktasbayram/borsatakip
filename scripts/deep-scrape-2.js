
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Starting deep scrape 2...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        let clicks = 0;
        const maxClicks = 10;

        for (let i = 0; i < maxClicks; i++) {
            const result = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('button, a, div, span'));
                const btn = elements.find(el => el.innerText && el.innerText.toUpperCase().includes('DAHA FAZLA GÖSTER'));
                if (btn) {
                    const beforeCount = document.querySelectorAll('article.index-list').length;
                    btn.scrollIntoView();
                    btn.click();
                    return { clicked: true, beforeCount, html: btn.outerHTML, text: btn.innerText };
                }
                return { clicked: false };
            });

            if (result.clicked) {
                console.log(`Clicked button "${result.text}" (Before count: ${result.beforeCount})...`);
                await new Promise(r => setTimeout(r, 4000)); // Wait for 4s
                const afterCount = await page.evaluate(() => document.querySelectorAll('article.index-list').length);
                console.log(`After count: ${afterCount}`);
                if (afterCount === result.beforeCount) {
                    console.log('Count did not change, breaking.');
                    break;
                }
            } else {
                console.log('Button not found.');
                break;
            }
        }

        const items = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article.index-list')).map(el => {
                const h3 = el.querySelector('h3');
                return h3 ? h3.innerText : 'Unknown';
            });
        });

        console.log(`Final total: ${items.length} items.`);
        fs.writeFileSync('scripts/deep_scrape_list.json', JSON.stringify(items, null, 2));

    } catch (error) {
        console.error('Scrape 2 failed:', error);
    } finally {
        await browser.close();
    }
})();
