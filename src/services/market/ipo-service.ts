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

                // Lists
                const extractList = (startMarker: string, endMarker: string) => {
                    const startIdx = bodyText.indexOf(startMarker);
                    if (startIdx === -1) return [];
                    // Look for the next major header or end of section
                    const followingHeaders = ['Dağıtılacak Pay', 'Halka Açıklık', 'Fiyat İstikrarı', 'Halka Arz Satış', 'Tahsisat Grupları', 'Satmama Taahhüdü'];
                    let endIdx = -1;

                    // Find the earliest occurrence of any following header
                    for (const header of followingHeaders) {
                        const idx = bodyText.indexOf(header, startIdx + startMarker.length);
                        if (idx !== -1 && (endIdx === -1 || idx < endIdx)) {
                            endIdx = idx;
                        }
                    }

                    if (endIdx === -1) endIdx = startIdx + 500; // Fallback cap

                    const section = bodyText.substring(startIdx, endIdx);
                    return section.split('\n')
                        .map(l => l.trim())
                        .filter(l => (l.startsWith('-') || l.startsWith('*') || l.startsWith('•')) && l.length > 2)
                        .map(l => l.replace(/^[-*•]\s*/, ''));
                };

                const fundsUse = extractList('Fonun Kullanım Yeri', 'Halka Arz Satış Yöntemi'); // Markers might need tuning based on observation
                const allocationGroups = extractList('Tahsisat Grupları', 'Dağıtılacak Pay Miktarı');
                const pledges = extractList('Satmama Taahhüdü', 'Halka Açıklık');
                const financials = extractList('Finansal Tablo', 'Fiyat İstikrarı');

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
                    imageUrl, size: calculatedSize, leadUnderwriter,
                    fundsUse, allocationGroups, pledges, financials
                };
            });

            const ipoDetail: IpoDetail = {
                url,
                isNew: false, // Contextual
                ...details,
                discount: '', // Hard to extract reliably without specific pattern
                pazar: details.market // Map 'market' to 'pazar' for consistency with IpoDetail
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
                headless: true, // "new" is deprecated, usage is boolean in newer versions or "new" string in older. Using true for safety with latest types.
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
                    const codeEl = el.innerText.split('\n').find(l => /^[A-Z]{4,5}$/.test(l)); // naive code finder
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
