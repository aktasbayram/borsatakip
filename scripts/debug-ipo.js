const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Use a real-user agent to avoid anti-bot page delivery
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        // Navigate to a known existing IPO detail page
        const url = 'https://halkarz.com/netcad-yazilim-a-s/';
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Dump key info
        const data = await page.evaluate(() => {
            const bodyText = document.body.innerText;

            // Helper to grab text around known labels
            const lookAround = (term) => {
                const index = bodyText.indexOf(term);
                return index !== -1 ? bodyText.substring(index, index + 100).replace(/\n/g, ' ') : 'NOT FOUND';
            };

            return {
                title: document.title,
                h1: document.querySelector('h1')?.innerText,
                metaDescription: document.querySelector('meta[name="description"]')?.content,
                sampleText: bodyText.substring(0, 500),
                priceContext: lookAround('Halka Arz Fiyatı'),
                lotContext: lookAround('Dağıtılacak Pay'),
                methodContext: lookAround('Dağıtım Yöntemi'),
                tableCount: document.querySelectorAll('table').length,
                listCount: document.querySelectorAll('li').length,
                imgCount: document.querySelectorAll('img').length,
                mainImgSrc: document.querySelector('.slogo')?.getAttribute('src') || document.querySelector('article img')?.getAttribute('src')
            };
        });

        console.log('--- DEBUG DATA ---');
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();
