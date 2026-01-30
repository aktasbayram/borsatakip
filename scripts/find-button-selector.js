
const puppeteer = require('puppeteer');

(async () => {
    console.log('Finding button selector...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const buttonInfo = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button, a, div.button, span.button'));
            const target = btns.find(b => b.innerText.toUpperCase().includes('DAHA FAZLA GÖSTER'));
            if (!target) return null;

            return {
                tagName: target.tagName,
                className: target.className,
                id: target.id,
                innerText: target.innerText,
                outerHTML: target.outerHTML
            };
        });

        console.log('Button found:', JSON.stringify(buttonInfo, null, 2));

    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        await browser.close();
    }
})();
