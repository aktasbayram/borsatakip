
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testIntegratedScraper() {
    console.log('Starting integrated scraper test...');
    const result = { gainers: [], losers: [], active: [] };
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const scrapeMynetPage = async (url) => {
            try {
                console.log(`Navigating to ${url}...`);
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                // Extra wait
                await new Promise(r => setTimeout(r, 2000));

                return await page.evaluate(() => {
                    const allRows = Array.from(document.querySelectorAll('tr'));
                    return allRows.map(row => {
                        const cols = row.querySelectorAll('td');
                        if (cols.length < 3) return null;
                        const code = cols[0].innerText.trim().split('\n')[0].replace(/\s+/g, '').substring(0, 6);
                        const price = cols[1].innerText.trim();
                        const changeText = cols[2].innerText.trim();
                        if (!code || code.length < 2 || !/[A-Z]/.test(code)) return null;
                        return { code, price, change: changeText, volume: cols[3]?.innerText.trim() || '' };
                    }).filter(Boolean).slice(0, 5);
                });
            } catch (e) {
                console.error(`Error: ${e.message}`);
                return [];
            }
        };

        result.gainers = await scrapeMynetPage('https://finans.mynet.com/borsa/hisseler/en-cok-yukselenler/');
        result.losers = await scrapeMynetPage('https://finans.mynet.com/borsa/hisseler/en-cok-dusenler/');
        result.active = await scrapeMynetPage('https://finans.mynet.com/borsa/hisseler/en-cok-islem-goren-hisseler/');

        console.log('Scrape result:', result);

        if (result.gainers.length > 0) {
            const date = new Date().toISOString().split('T')[0];
            const current = await db.marketSummary.findUnique({ where: { date } });
            const data = current?.data || { indices: [], movers: result, events: [], ipos: [], updatedAt: new Date().toISOString() };
            data.movers = result;
            data.updatedAt = new Date().toISOString();

            await db.marketSummary.upsert({
                where: { date },
                update: { data },
                create: { date, data, editorNote: 'Test updated' }
            });
            console.log('Database updated successfully');
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        if (browser) await browser.close();
        await db.$disconnect();
    }
}

testIntegratedScraper();
