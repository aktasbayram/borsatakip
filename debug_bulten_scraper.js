
const puppeteer = require('puppeteer');

async function debugScraper() {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to Fintables Piyasalar...');
        await page.goto('https://fintables.com/piyasalar', { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Waiting for tables...');
        await page.waitForSelector('table');

        const data = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            const result = {
                gainers: [],
                losers: [],
                active: []
            };

            // Fintables usually has Gainers, Losers, and Most Active in order or distinguishable by headers
            // Let's try to find headers
            const tableContainers = Array.from(document.querySelectorAll('div')).filter(el => el.innerText.includes('En Çok Yükselenler') || el.innerText.includes('En Çok Düşenler') || el.innerText.includes('En Çok İşlem Görenler'));

            console.log(`Found ${tableContainers.length} containers`);

            const extractFromTable = (headerText) => {
                const container = document.body.innerText.includes(headerText) ?
                    Array.from(document.querySelectorAll('div, section')).find(el => el.children.length > 0 && el.innerText.startsWith(headerText)) : null;

                // Fallback: search for the table near the text
                const allDivs = Array.from(document.querySelectorAll('div'));
                const targetHeader = allDivs.find(d => d.innerText.trim() === headerText);
                if (!targetHeader) return [];

                const table = targetHeader.parentElement.querySelector('table');
                if (!table) return [];

                const rows = Array.from(table.querySelectorAll('tbody tr')).slice(0, 5);
                return rows.map(row => {
                    const cols = row.querySelectorAll('td');
                    if (cols.length < 3) return null;

                    const code = cols[0].innerText.trim().split('\n')[0];
                    const price = cols[1].innerText.trim();
                    const change = cols[2].innerText.trim();
                    const volume = cols[3] ? cols[3].innerText.trim() : null;

                    return { code, price, change, volume };
                }).filter(Boolean);
            };

            result.gainers = extractFromTable('En Çok Yükselenler');
            result.losers = extractFromTable('En Çok Düşenler');
            result.active = extractFromTable('En Çok İşlem Görenler');

            return result;
        });

        console.log('Scraped Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Debug Scraper Failed:', error);
    } finally {
        if (browser) await browser.close();
    }
}

debugScraper();
