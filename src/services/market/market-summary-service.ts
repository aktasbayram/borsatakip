
import puppeteer from 'puppeteer';
import { db } from '@/lib/db';
import { MarketService } from '@/services/market';
import { unstable_cache, revalidateTag } from 'next/cache';

export interface MarketMover {
    code: string;
    price: string;
    change: string;
    volume?: string;
}

export interface MarketSummaryData {
    indices: any[];
    movers: {
        gainers: MarketMover[];
        losers: MarketMover[];
        active: MarketMover[];
    };
    events: any[];
    ipos: any[];
    updatedAt: string;
}

export class MarketSummaryService {

    /**
     * Get summary for a specific date. Triggers auto-generation if missing.
     */
    static async getSummary(date: string): Promise<any> {
        const getCached = unstable_cache(async () => {
            // @ts-ignore
            let summary = await db.marketSummary.findUnique({
                where: { date }
            });

            if (!summary) {
                // If today, try to generate it
                const today = new Date().toISOString().split('T')[0];
                if (date === today) {
                    console.log(`Generating new summary for ${date}...`);
                    summary = await this.generateSummary(date);
                }
            }

            return summary;
        }, [`market-summary-${date}`], { tags: ['market-summary'], revalidate: 3600 });

        return getCached();
    }

    /**
     * Aggregates data from various sources to create a daily summary.
     */
    static async generateSummary(date: string): Promise<any> {
        console.log(`Aggregating data for bülten: ${date}`);

        // 1. Fetch Indices (BIST 100, BIST 30, USDTRY etc.)
        const indicesSymbols = [
            { s: 'XU100.IS', n: 'BIST 100' },
            { s: 'XU030.IS', n: 'BIST 30' },
            { s: 'USDTRY=X', n: 'Dolar/TL' },
            { s: 'EURTRY=X', n: 'Euro/TL' },
            { s: 'GC=F', n: 'Altın' }
        ];

        const indices = await Promise.all(indicesSymbols.map(async (idx) => {
            try {
                const quote = await MarketService.getQuote(idx.s, 'BIST');
                return { ...quote, name: idx.n };
            } catch (err) {
                return { symbol: idx.s, name: idx.n, price: 0, changePercent: 0 };
            }
        }));

        // 2. Scrape Movers from external sources
        const movers = await this.scrapeMovers();

        // 3. Fetch Economic Events for today/tomorrow
        // @ts-ignore
        const events = await db.economicEvent.findMany({
            where: { date: date },
            orderBy: { time: 'asc' },
            take: 5
        });

        // 4. Fetch Active/New IPOs
        const ipos = await db.ipo.findMany({
            where: {
                status: { in: ['UPCOMING', 'TRANSITION', 'ACTIVE'] }
            },
            orderBy: { updatedAt: 'desc' },
            take: 3
        });

        const summaryData: MarketSummaryData = {
            indices,
            movers,
            events,
            ipos,
            updatedAt: new Date().toISOString()
        };

        // Save to DB
        // @ts-ignore
        const summary = await db.marketSummary.upsert({
            where: { date },
            update: { data: summaryData as any },
            create: {
                date,
                data: summaryData as any,
                editorNote: 'Günün piyasa özeti otomatik olarak oluşturuldu.'
            }
        });

        // Invalidate cache
        // @ts-ignore
        revalidateTag('market-summary');

        return summary;
    }

    /**
     * Scrapes Uzmanpara homepage for accurate Gainers, Losers, and Volume leaders.
     * Homepage widgets are more stable and pre-sorted.
     */
    private static async scrapeMovers(): Promise<MarketSummaryData['movers']> {
        let browser;
        const result = { gainers: [], losers: [], active: [] };

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto('https://uzmanpara.milliyet.com.tr/', { waitUntil: 'domcontentloaded', timeout: 30000 });

            const movers = await page.evaluate(() => {
                const results: any = { gainers: [], losers: [], active: [] };
                const text = document.body.innerText;
                const lines = text.split('\n');

                const stockLines = lines.map(line => {
                    const p = line.replace('\t', ' ').trim().split(/\s+/).filter(x => x.length > 0);
                    if (p.length < 4) return null;

                    const code = p[0].toUpperCase();
                    // Detect stock code: 2-6 chars, alphanumeric
                    if (!/^[A-Z0-9]{2,6}$/.test(code) || code.length < 2) return null;
                    // Detect price: must have a comma (Turkish format)
                    if (!p[1].includes(',')) return null;

                    const price = p[1];
                    // Volume can be at p[2] or p[3] depending on the widget layout
                    let volumeText = p[2];
                    let change = p[p.length - 1];

                    if (volumeText.includes('%')) {
                        // Likely [CODE] [PRICE] [%CHANGE]
                        return null; // Not a full stats line
                    }

                    const volumeValue = parseFloat(volumeText.replace(/\./g, '').replace(',', '.'));
                    const changeValue = parseFloat(change.replace('%', '').replace(',', '.'));

                    if (isNaN(volumeValue)) return null;

                    return { code, price, change: change.includes('%') ? change : `%${change}`, volume: volumeText, volumeValue, changeValue };
                }).filter(Boolean);

                // Filter out non-stocks (like "Dolar", "Euro" if they matched)
                const realStocks = stockLines.filter((s): s is NonNullable<typeof s> => !!s && !['DOLAR', 'EURO', 'ALTIN', 'GÜMÜŞ', 'PONT', 'VARAL', 'FRANK', 'RIYAL'].includes(s.code));

                results.gainers = [...realStocks].sort((a, b) => (b?.changeValue || 0) - (a?.changeValue || 0)).slice(0, 5);
                results.losers = [...realStocks].sort((a, b) => (a?.changeValue || 0) - (b?.changeValue || 0)).slice(0, 5);
                results.active = [...realStocks].sort((a, b) => (b?.volumeValue || 0) - (a?.volumeValue || 0)).slice(0, 5);

                return results;
            });

            console.log(`Final Homepage Movers: G:${movers.gainers.length} L:${movers.losers.length} A:${movers.active.length}`);
            return movers;

        } catch (error) {
            console.error('Failed to scrape movers from homepage:', error);
            return result;
        } finally {
            if (browser) await browser.close();
        }
    }
}
