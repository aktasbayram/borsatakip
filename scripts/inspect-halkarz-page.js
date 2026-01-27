const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        const url = 'https://halkarz.com/akhan-un-fabrikasi-ve-tarim-urunleri-gida-sanayi-tic-a-s/';
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Evaluate page content to find details
        const data = await page.evaluate(() => {
            // Usually these sites use tables or lists for details
            // Let's dump the text of the main content area or look for specific known labels
            const content = document.querySelector('.post-content') || document.body;

            // Helper to find text near a label
            const findValue = (label) => {
                const elements = Array.from(document.querySelectorAll('li, tr, p, div'));
                const found = elements.find(el => el.innerText.includes(label));
                return found ? found.innerText : 'Not found';
            };

            return {
                price: findValue('Halka Arz Fiyatı'),
                lot: findValue('Dağıtılacak Pay'),
                method: findValue('Dağıtım Yöntemi'),
                bistCode: findValue('Bist Kodu'),
                size: findValue('Halka Arz Büyüklüğü'),
                fullText: document.body.innerText.substring(0, 1000) // Dump first 1k chars to see structure
            };
        });

        console.log("Detail Page Data:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
})();
