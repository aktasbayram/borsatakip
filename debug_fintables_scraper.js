const puppeteer = require('puppeteer');

async function debugScraper() {
    console.log('Starting Fintables scraper debug...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to https://fintables.com/piyasalar...');
        await page.goto('https://fintables.com/piyasalar', { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Page loaded. Extracting sections and tables...');

        const data = await page.evaluate(() => {
            const sections = Array.from(document.querySelectorAll('section, h1, h2, h3, h4, h5, div'));
            const logs = [];

            sections.forEach((s, i) => {
                if (s.textContent?.includes('En Çok') && s.textContent?.length < 100) {
                    logs.push({
                        index: i,
                        tag: s.tagName,
                        text: s.textContent.trim(),
                        hasTable: !!s.parentElement?.querySelector('table') || !!s.querySelector('table')
                    });
                }
            });

            const tables = Array.from(document.querySelectorAll('table')).map((table, i) => {
                const header = table.querySelector('thead')?.innerText.trim() || 'No Header';
                const firstRow = table.querySelector('tbody tr')?.innerText.trim() || 'No Row';
                return { index: i, header, firstRow };
            });

            return { logs, tables, bodyText: document.body.innerText.substring(0, 500) };
        });

        console.log('Sections containing "En Çok":', data.logs);
        console.log('Tables found:', data.tables);

    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
    }
}

debugScraper();
