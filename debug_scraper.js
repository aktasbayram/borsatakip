const puppeteer = require('puppeteer');

async function scrapeIpos() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to halkarz.com...');
    await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Take screenshot to see what's happening
    await page.screenshot({ path: 'scraper_debug.png', fullPage: true });

    const data = await page.evaluate(() => {
        const items = [];
        // Use exact selector from IpoService
        const cards = document.querySelectorAll('article.index-list');

        cards.forEach(card => {
            const get = (sel) => card.querySelector(sel)?.innerText?.trim() || '';
            const link = card.querySelector('a')?.getAttribute('href') || '';
            const title = card.querySelector('h3, h2')?.innerText?.trim() || '';

            // Try to detect status like the service does
            let status = 'New'; // Default
            if (title.includes('Taslak')) status = 'Draft';

            items.push({
                title,
                link,
                status,
                htmlPreview: card.innerHTML.substring(0, 100)
            });
        });
        return items;
    });

    console.log('Found IPOs:', data.length);
    console.log(data);

    // Test Detail Scraping for specific item or first one
    const netcad = data.find(i => i.title.toLowerCase().includes('netcad'));
    const targetUrl = netcad ? netcad.link : data[0]?.link;

    if (targetUrl) {
        console.log(`\nScraping details for: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

        const details = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            const extract = (patterns) => {
                // simple mocking of service logic
                for (const pattern of patterns) {
                    // regex passing in evaluate is tricky, recreating locally
                    const regex = new RegExp(pattern.source, pattern.flags);
                    const match = bodyText.match(regex);
                    if (match && match[1]) return match[1].trim();
                }
                return '';
            };

            const codeRegex = /Bist Kodu\s*:\s*\n?\s*([A-Z]+)/i;
            const company = document.querySelector('h1')?.innerText || '';
            const summaryListItems = document.querySelectorAll('.sp-arz-extra ul.aex-in li').length;

            return {
                company,
                hasCode: codeRegex.test(bodyText),
                summarySectionCount: summaryListItems,
                bodyPreview: bodyText.substring(0, 500)
            };
        });
        console.log('Detail Result:', details);
    }

    await browser.close();
}

scrapeIpos().catch(console.error);
