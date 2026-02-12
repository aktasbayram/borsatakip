
import puppeteer from 'puppeteer';
import { db } from '@/lib/db';
import { unstable_cache, revalidateTag } from 'next/cache';

export interface RestrictedStockItem {
    id: string;
    code: string;
    company: string;
    measure: string;
    measureCredit: boolean;
    measureGross: boolean;
    measureSingle: boolean;
    measureOrder: boolean;
    measureNet: boolean;
    startDate: string;
    endDate: string;
    sortOrder?: number;
    isLocked?: boolean;
}

export class RestrictedStockService {

    /**
     * Scrape Fintables for restricted stocks.
     */
    static async syncRestrictedStocks(): Promise<{ added: number, updated: number, skipped: number }> {
        let added = 0;
        let updated = 0;
        let skipped = 0;
        let browser;

        try {
            console.log('Starting Restricted Stocks Sync...');
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote']
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 800 });

            console.log('Navigating to Fintables...');
            await page.goto('https://fintables.com/tedbirli-hisseler', { waitUntil: 'networkidle2', timeout: 60000 });

            console.log('Extracting data...');
            const stocks = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('table tbody tr'));
                return rows.map(row => {
                    const cols = row.querySelectorAll('td');
                    if (cols.length < 8) return null;

                    const hasIcon = (colIndex: number) => {
                        const cell = cols[colIndex];
                        return cell && cell.querySelector('svg') !== null;
                    };

                    const codeEl = cols[0].querySelector('.text-foreground-01.text-sm');
                    const codeText = codeEl ? codeEl.textContent?.trim() : cols[0].innerText.split(/[\s\n]+/)[0].trim();

                    const img = cols[0].querySelector('img');
                    let companyName = '';
                    if (img && img.getAttribute('alt')) {
                        companyName = img.getAttribute('alt')!.replace(' Şirket Logosu', '').trim();
                    }

                    return {
                        code: codeText,
                        company: companyName,
                        startDate: cols[1]?.innerText?.trim() || '',
                        endDate: cols[2]?.innerText?.trim() || '',
                        measureCredit: hasIcon(3),
                        measureGross: hasIcon(4),
                        measureSingle: hasIcon(5),
                        measureOrder: hasIcon(6),
                        measureNet: hasIcon(7),
                    };
                }).filter(Boolean) as any[];
            });

            console.log(`Scraped ${stocks.length} restricted stocks.`);

            for (let i = 0; i < stocks.length; i++) {
                const item = stocks[i];
                if (!item.code) continue;

                const activeMeasures = [];
                if (item.measureCredit) activeMeasures.push('Kredili İşlem');
                if (item.measureGross) activeMeasures.push('Brüt Takas');
                if (item.measureSingle) activeMeasures.push('Tek Fiyat');
                if (item.measureOrder) activeMeasures.push('Emir Paketi');
                if (item.measureNet) activeMeasures.push('İnternet Yasağı');

                const measureStr = activeMeasures.join(', ');

                // @ts-ignore
                const existing = await db.restrictedStock.findFirst({
                    where: { code: item.code, startDate: item.startDate }
                });

                if (existing?.isLocked) {
                    skipped++;
                    continue;
                }

                if (existing) {
                    // @ts-ignore
                    await db.restrictedStock.update({
                        where: { id: existing.id },
                        data: {
                            company: item.company || existing.company,
                            endDate: item.endDate,
                            measure: measureStr,
                            measureCredit: item.measureCredit,
                            measureGross: item.measureGross,
                            measureSingle: item.measureSingle,
                            measureOrder: item.measureOrder,
                            measureNet: item.measureNet
                        }
                    });
                    updated++;
                } else {
                    // @ts-ignore
                    await db.restrictedStock.create({
                        data: {
                            code: item.code,
                            company: item.company,
                            measure: measureStr,
                            measureCredit: item.measureCredit,
                            measureGross: item.measureGross,
                            measureSingle: item.measureSingle,
                            measureOrder: item.measureOrder,
                            measureNet: item.measureNet,
                            startDate: item.startDate,
                            endDate: item.endDate,
                            sortOrder: i
                        }
                    });
                    added++;
                }
            }
            (revalidateTag as any)('restricted-stocks');
            return { added, updated, skipped };
        } catch (error) {
            console.error('Restricted Stock Sync Failed:', error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }

    /**
     * Get stocks from DB. Triggers auto-sync if stale.
     */
    static async getRestrictedStocks(): Promise<{ stocks: RestrictedStockItem[], lastUpdated: Date | null }> {
        const getCached = unstable_cache(async () => {
            // @ts-ignore
            const stocks = await db.restrictedStock.findMany({
                orderBy: { sortOrder: 'asc' }
            });

            let lastUpdated: Date | null = null;
            let isStale = false;

            if (stocks.length > 0) {
                // @ts-ignore
                lastUpdated = stocks[0].updatedAt;
                if (new Date().getTime() - new Date(lastUpdated!).getTime() > 6 * 60 * 60 * 1000) {
                    isStale = true;
                }
            } else {
                isStale = true;
            }

            if (isStale) {
                console.log('Restricted stocks stale, syncing...');
                RestrictedStockService.syncRestrictedStocks().catch(e => console.error('Bg sync failed', e));
            }

            const mappedStocks = stocks.map((s: any) => ({
                id: s.id,
                code: s.code,
                company: s.company,
                measure: s.measure,
                measureCredit: s.measureCredit,
                measureGross: s.measureGross,
                measureSingle: s.measureSingle,
                measureOrder: s.measureOrder,
                measureNet: s.measureNet,
                startDate: s.startDate,
                endDate: s.endDate,
                sortOrder: s.sortOrder,
                isLocked: s.isLocked
            }));
            return { stocks: mappedStocks, lastUpdated };
        }, ['restricted-stocks'], { tags: ['restricted-stocks'], revalidate: 3600 });
        return getCached();
    }

    static async reorder(items: { id: string, sortOrder: number }[]) {
        const transactions = items.map(item =>
            // @ts-ignore
            db.restrictedStock.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder }
            })
        );
        // @ts-ignore
        return await db.$transaction(transactions);
    }

    static async delete(id: string) {
        // @ts-ignore
        return await db.restrictedStock.delete({ where: { id } });
    }
}
