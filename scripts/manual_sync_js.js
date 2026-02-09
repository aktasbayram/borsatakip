const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function syncIpos() {
    console.log('Starting manual sync...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('Navigating to homepage...');
        await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const items = await page.evaluate(() => {
            const monthMap = {
                'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3, 'Mayıs': 4, 'Haziran': 5,
                'Temmuz': 6, 'Ağustos': 7, 'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
            };

            const parseDateRange = (dateStr) => {
                try {
                    const parts = dateStr.trim().split(' ');
                    if (parts.length < 2) return null;

                    const yearStr = parts.find(p => /20\d{2}/.test(p));
                    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

                    const monthStr = parts.find(p => monthMap[p] !== undefined);
                    const month = monthStr ? monthMap[monthStr] : -1;

                    if (month === -1) return null;

                    const dayPart = parts[0];
                    const days = dayPart.split('-').map(d => parseInt(d)).filter(n => !isNaN(n));
                    if (days.length === 0) return null;

                    const start = new Date(year, month, days[0]);
                    const end = new Date(year, month, days[days.length - 1]);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);

                    return { start, end };
                } catch (e) { return null; }
            };

            return Array.from(document.querySelectorAll('article.index-list')).map(el => {
                const header = el.querySelector('h3')?.innerText || '';
                const text = el.innerText;
                const timeText = el.querySelector('time')?.innerText?.trim() || '';
                const link = el.querySelector('a')?.href || '';
                const img = el.querySelector('img')?.src || '';
                const isNew = !!el.querySelector('.il-new');

                let code = '';
                const codeMatch = text.split('\n').find(l => /^[A-Z]{4,5}$/.test(l.trim()));
                if (codeMatch) code = codeMatch.trim();

                let statusText = '';

                // 1. Text checks
                if (text.match(/Talep\s*Toplanıyor/i)) statusText = 'TALEP TOPLANIYOR';

                // 2. Date checks
                if (!statusText && timeText) {
                    const range = parseDateRange(timeText);
                    if (range) {
                        const now = new Date();
                        if (now >= range.start && now <= range.end) {
                            statusText = 'TALEP TOPLANIYOR';
                        }
                    }
                }

                const draftRegex = /haz[ıi]rla|taslak|bekle/i;
                const isHazirlaniyor = draftRegex.test(timeText) || draftRegex.test(header) || draftRegex.test(text);

                return {
                    company: header.trim(),
                    url: link,
                    imageUrl: img,
                    code,
                    date: timeText,
                    statusText,
                    isNew,
                    isHazirlaniyor
                };
            });
        });

        console.log(`Found ${items.length} items.`);

        // Assign sortOrder: Top of list (index 0) gets highest number
        const totalItems = items.length;
        items.forEach((item, index) => {
            item.sortOrder = totalItems - index;
        });

        // Upsert to DB
        for (const item of items) {
            if (!item.code) {
                const slug = item.url.split('/').filter(Boolean).pop();
                if (slug) item.code = slug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                else item.code = 'UNKNOWN-' + Date.now();
            }

            console.log(`Processing ${item.code} - SortOrder: ${item.sortOrder}`);

            const status = item.isHazirlaniyor ? 'DRAFT' : (item.statusText.includes('TALEP') ? 'ACTIVE' : 'NEW');

            // Simplified upsert - we don't scrape details here to be safe/fast, just list
            // But we need to preserve existing details if any
            const existing = await prisma.ipo.findFirst({ where: { code: item.code } });

            await prisma.ipo.upsert({
                where: { code: item.code },
                update: {
                    company: item.company,
                    url: item.url,
                    imageUrl: item.imageUrl,
                    date: item.date,
                    statusText: item.statusText,
                    status: status,
                    isNew: item.isNew,
                    sortOrder: item.sortOrder
                    // Preserve existing fields if not gathered here
                },
                create: {
                    code: item.code,
                    company: item.company,
                    url: item.url,
                    imageUrl: item.imageUrl,
                    date: item.date,
                    statusText: item.statusText,
                    status: status,
                    isNew: item.isNew,
                    price: '-',
                    lotCount: '-',
                    market: '-',
                    distributionMethod: '-',
                    showOnHomepage: false,
                    isLocked: false,
                    sortOrder: item.sortOrder
                }
            });
        }

        console.log('Sync complete.');

    } catch (e) {
        console.error('Script failed:', e);
    } finally {
        await browser.close();
        await prisma.$disconnect();
    }
}

syncIpos();
