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
            // Look for the main IPO list
            // Based on common structures, let's try to grab header texts or look for specific classes
            // We'll dump the first few list items text to identifying selectors
            const items = Array.from(document.querySelectorAll('article, .halkarz-list-item, .post'));
            return items.slice(0, 3).map(i => ({
                html: i.outerHTML.substring(0, 300), // First 300 chars of HTML
                text: i.innerText.split('\n').slice(0, 5) // First 5 lines of text
            }));
        });

        console.log("Found items:", JSON.stringify(data, null, 2));

        // Also take a screenshot to visualize
        await page.screenshot({ path: 'local_ipo_inspect.png' });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
})();
