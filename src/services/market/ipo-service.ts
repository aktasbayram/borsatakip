import puppeteer from 'puppeteer';
import { unstable_cache } from 'next/cache';

export interface IpoItem {
    code: string;
    company: string;
    date: string;       // e.g. "28-29-30 Ocak 2026"
    price: string;      // e.g. "21,50 TL"
    lotCount: string;   // e.g. "54,700,000 Lot"
    market: string;     // e.g. "Ana Pazar"
    url: string;
    imageUrl: string;
    distributionMethod: string; // "Eşit Dağıtım" etc.
    isNew?: boolean;
}

export interface IpoDetail extends IpoItem {
    fundsUse: string[];
    allocationGroups: string[];
    leadUnderwriter: string; // Aracı Kurum
    pazar: string; // Pazar
    financials: string[]; // Simple list for now
    pledges: string[]; // Satmama Taahhüdü
    discount: string; // İskonto
    size: string; // Halka Arz Büyüklüğü
    firstTradingDate: string; // Bist İlk İşlem Tarihi
    summaryInfo: { title: string, items: string[] }[]; // Generic list of all summary sections
}

export class IpoService {
    private static CACHE_KEY = 'ipo-data';
    private static CACHE_DURATION = 3600; // 1 hour
    private static cache: { data: IpoItem[], timestamp: number } | null = null;
    private static detailCache: Map<string, { data: IpoDetail, timestamp: number }> = new Map();

    /**
     * Main entry point to get IPOs.
     * Uses in-memory cache or handles re-fetching.
     */
    static async getActiveIpos(): Promise<IpoItem[]> {
        // Check cache first
        if (this.cache && (Date.now() - this.cache.timestamp < this.CACHE_DURATION * 1000)) {
            return this.cache.data;
        }

        try {
            const data = await this.scrapeIpos();
            if (data.length > 0) {
                this.cache = { data, timestamp: Date.now() };
            }
            return data;
        } catch (error) {
            console.error('Failed to scrape IPOs:', error);
            // Return cached data if available even if expired, as fallback
            if (this.cache) return this.cache.data;
            return [];
        }
    }

    /**
     * Get details for a specific IPO by slug
     */
    static async getIpoDetail(slug: string): Promise<IpoDetail | null> {
        // Check cache
        const cached = this.detailCache.get(slug);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION * 1000)) {
            return cached.data;
        }

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            const url = `https://halkarz.com/${slug}/`;
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const details = await page.evaluate(() => {
                const getText = (selector: string) => document.querySelector(selector)?.innerText?.trim() || '';
                const bodyText = document.body.innerText;

                const extract = (patterns: RegExp[]) => {
                    for (const pattern of patterns) {
                        const match = bodyText.match(pattern);
                        if (match && match[1]) return match[1].trim();
                    }
                    return '';
                };

                const company = document.querySelector('h1')?.innerText || '';
                console.log('Scraping detail for:', company);

                const code = extract([/Bist Kodu\s*:\s*\n?\s*([A-Z]+)/i]) || '';
                const date = extract([
                    /Halka Arz Tarihi\s*:\s*\n?\s*(.*?)(?:\s\d{2}:\d{2}|$)/m,
                    /Talep Toplama Tarihi\s*:\s*\n?\s*(.*?)(?:\n|$)/
                ]);
                const price = extract([
                    /Halka Arz Fiyatı(?:\/Aralığı)?\s*:\s*\n?\s*(.*?TL)/i,
                    /Fiyat\s*:\s*\n?\s*(.*?TL)/i
                ]);

                console.log('Extracted:', { code, price, date });

                const lotCount = extract([
                    /Pay\s*:\s*\n?\s*(.*?Lot)/i,
                    /Dağıtılacak Pay\s*:\s*\n?\s*(.*?Lot)/i
                ]);
                const distributionMethod = extract([
                    /Dağıtım Yöntemi\s*:\s*\n?\s*(.*?)(?:\n|$)/i
                ]);
                const market = extract([
                    /Pazar\s*:\s*\n?\s*(.*?)(?:\n|$)/i
                ]);
                const size = extract([
                    /Halka Arz Büyüklüğü\s*:\s*\n?\s*(.*?)(?:\n|$)/i
                ]);
                const leadUnderwriter = extract([
                    /Aracı Kurum\s*:\s*\n?\s*(.*?)(?:\n|$)/i
                ]);
                const firstTradingDate = extract([
                    /Bist İlk İşlem Tarihi\s*:\s*\n?\s*(.*?)(?:\n|$)/i,
                    /İlk İşlem Tarihi\s*:\s*\n?\s*(.*?)(?:\n|$)/i
                ]) || 'Tarih Bekleniyor';

                // Generic Summary Info Extraction -> Finds all sections in the "Özet Bilgiler" area
                const summaryInfo: { title: string, items: string[] }[] = [];
                const summaryListItems = document.querySelectorAll('.sp-arz-extra ul.aex-in li');

                summaryListItems.forEach(li => {
                    const title = li.querySelector('h5')?.innerText?.trim();
                    if (!title) return;

                    // Handle Table specially (Finansal Tablo)
                    const table = li.querySelector('table');
                    if (table) {
                        const rows = Array.from(table.querySelectorAll('tr'));
                        const tableData = rows.map(r => r.innerText.replace(/\t/g, ' ').trim()).filter(Boolean);
                        summaryInfo.push({ title, items: tableData });
                        return;
                    }

                    // Handle Paragraphs
                    const p = li.querySelector('p');
                    if (p) {
                        // Split by <br> or newlines
                        const html = p.innerHTML;
                        const lines = html.split(/<br\s*\/?>|\n/);
                        const cleanedLines = lines
                            .map(l => l.replace(/<[^>]*>/g, '').trim()) // Remove tags (like <small>)
                            .filter(l => l.length > 2 && !l.startsWith('SPK Bülteni') && !l.startsWith('İzahname')); // Filter junk

                        // Remove leading dashes
                        const finalItems = cleanedLines.map(l => l.replace(/^[-•*]\s*/, ''));

                        if (finalItems.length > 0) {
                            summaryInfo.push({ title, items: finalItems });
                        }
                    }
                });

                const imageUrl = document.querySelector('.slogo')?.getAttribute('src') || document.querySelector('article img')?.getAttribute('src') || '';

                // Helper to parse currency string (46,50 TL -> 46.50)
                const parsePrice = (str: string) => {
                    const clean = str.replace(/[^\d,]/g, '').replace(',', '.');
                    return parseFloat(clean) || 0;
                };

                // Helper to parse lot string (40.000.000 Lot -> 40000000)
                const parseLot = (str: string) => {
                    const clean = str.replace(/[^\d]/g, '');
                    return parseInt(clean) || 0;
                };

                const formatCurrency = (val: number) => {
                    if (val >= 1_000_000_000) {
                        return (val / 1_000_000_000).toFixed(1).replace('.', ',') + ' Milyar TL';
                    }
                    if (val >= 1_000_000) {
                        return (val / 1_000_000).toFixed(1).replace('.', ',') + ' Milyon TL';
                    }
                    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
                };

                let calculatedSize = size;
                if (!calculatedSize || calculatedSize === '-' || calculatedSize.length < 2) {
                    const p = parsePrice(price);
                    const l = parseLot(lotCount);
                    if (p > 0 && l > 0) {
                        calculatedSize = formatCurrency(p * l);
                    }
                }

                return {
                    code, company, date, price, lotCount, market, distributionMethod,
                    imageUrl, size: calculatedSize, leadUnderwriter, firstTradingDate,
                    summaryInfo // NEW generic field
                };
            });

            const ipoDetail: IpoDetail = {
                url,
                isNew: false,
                ...details,
                discount: '',
                pazar: details.market,
                // Map old fields for backward comp or use new generic one
                fundsUse: details.summaryInfo.find(x => x.title.includes('Fon'))?.items || [],
                allocationGroups: details.summaryInfo.find(x => x.title.includes('Tahsisat'))?.items || [],
                pledges: details.summaryInfo.find(x => x.title.includes('Satmama'))?.items || [],
                financials: details.summaryInfo.find(x => x.title.includes('Finansal'))?.items || [],
                summaryInfo: details.summaryInfo,
                firstTradingDate: details.firstTradingDate
            };

            this.detailCache.set(slug, { data: ipoDetail, timestamp: Date.now() });
            await browser.close();
            return ipoDetail;

        } catch (error) {
            console.error(`Failed to scrape IPO detail for ${slug}:`, error);
            if (browser) await browser.close();
            return null;
        }
    }

    /**
     * Scrapes halkarz.com for the latest IPOs
     */
    private static async scrapeIpos(): Promise<IpoItem[]> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // 1. Get the list of recent IPOs
            await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Extract basic list info
            const basicList = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('article.index-list'));
                // Limit to top 10
                return items.slice(0, 10).map(el => {
                    const linkEl = el.querySelector('a');
                    const imgEl = el.querySelector('img');
                    const codeEl = el.innerText.split('\n').find(l => /^[A-Z]{4,5}$/.test(l));
                    const isNew = !!el.querySelector('.il-new');

                    return {
                        url: linkEl?.href || '',
                        imageUrl: imgEl?.src || '',
                        code: codeEl || '',
                        isNew
                    };
                });
            });

            // 2. Fetch details for each item in parallel
            const detailedIpos: IpoItem[] = [];

            // We use a new page/tab for each detail to speed up? Or reuse page?
            // Reusing page is safer for resource usage.
            for (const item of basicList) {
                if (!item.url) continue;

                const slug = item.url.split('/').filter(Boolean).pop() || '';
                const cachedDetail = this.detailCache.get(slug);
                if (cachedDetail && (Date.now() - cachedDetail.timestamp < this.CACHE_DURATION * 1000)) {
                    detailedIpos.push(cachedDetail.data);
                    continue;
                }

                try {
                    await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                    const details = await page.evaluate(() => {
                        const bodyText = document.body.innerText;

                        // Helper to extract value by label regex
                        const extract = (pattern: RegExp) => {
                            const match = bodyText.match(pattern);
                            return match && match[1] ? match[1].trim() : '';
                        };

                        const company = document.querySelector('h1')?.innerText || '';
                        const date = extract(/Halka Arz Tarihi\s*:\s*(.*?)(?:\s\d{2}:\d{2}|$)/m);
                        const price = extract(/Halka Arz Fiyatı.*?:\s*(.*?TL)/);
                        const lotCount = extract(/Pay\s*:\s*(.*?Lot)/i);
                        const distributionMethod = extract(/Dağıtım Yöntemi\s*:\s*(.*?)(?:\n|$)/);
                        const market = extract(/Pazar\s*:\s*(.*?)(?:\n|$)/);
                        const code = extract(/Bist Kodu\s*:\s*([A-Z]+)/) || '';

                        return { company, date, price, lotCount, distributionMethod, market, code };
                    });

                    detailedIpos.push({
                        ...item,
                        code: details.code || item.code, // Fallback to list code
                        company: details.company,
                        date: details.date,
                        price: details.price,
                        lotCount: details.lotCount,
                        market: details.market,
                        distributionMethod: details.distributionMethod
                    });

                } catch (err) {
                    console.warn(`Failed to scrape details for ${item.url}:`, err);
                }
            }

            await browser.close();
            return detailedIpos;

        } catch (error) {
            if (browser) await browser.close();
            throw error;
        }
    }
}
