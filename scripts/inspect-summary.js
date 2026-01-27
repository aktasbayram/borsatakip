const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        const url = 'https://halkarz.com/netcad-yazilim-a-s/';
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const analysis = await page.evaluate(() => {
            const bodyText = document.body.innerHTML;
            const index = bodyText.indexOf('İşlem Tarihi'); // Changed search term

            if (index === -1) return { found: false, message: 'Text "Bist İlk İşlem Tarihi" not found in HTML' };

            // Get context chars
            const context = bodyText.substring(Math.max(0, index - 200), Math.min(bodyText.length, index + 200));

            return {
                found: true,
                contextSnippet: context
            };
        });

        console.log(JSON.stringify(analysis, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();
