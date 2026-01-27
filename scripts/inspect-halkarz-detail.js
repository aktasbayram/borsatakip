const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        console.log("Navigating to halkarz.com...");
        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Evaluate page content to find list of IPOs
        const data = await page.evaluate(() => {
            const item = document.querySelector('article.index-list');
            return {
                html: item ? item.outerHTML : 'No item found',
                innerText: item ? item.innerText : 'No item found',
                // Try to find specific details if they exist in common classes
                hasPrice: !!item.querySelector('.il-price'),
                hasLots: !!item.querySelector('.il-lot'),
            };
        });

        console.log("Item Details:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
})();
