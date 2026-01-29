import puppeteer from 'puppeteer';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

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
    statusText?: string;
    status?: 'New' | 'Active' | 'Draft';
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
     * Uses Next.js persistent cache (unstable_cache) to store data across restarts.
     */
    static async getActiveIpos(): Promise<IpoItem[]> {
        const getCached = unstable_cache(
            async () => {
                // 1. Fetch Scraped Data
                const scrapedIpos = await this.scrapeIpos();

                // 2. Fetch Manual Data from DB
                let manualIpos: any[] = [];
                try {
                    // @ts-ignore - Prisma client might be out of sync
                    if (db.ipo) {
                        // @ts-ignore
                        manualIpos = await db.ipo.findMany();
                    }
                } catch (error) {
                    console.warn('Failed to fetch manual IPOs, relying on scraped data:', error);
                }

                // 3. Merge Strategies
                // We must be careful not to drop scraped items that might share a code (like 'TASLAK') 
                // or have no code.

                // Create a map of Manual items for quick lookup by Code
                const manualMap = new Map<string, any>();
                manualIpos.forEach((m: any) => {
                    if (m.code) manualMap.set(m.code.toUpperCase(), m);
                });

                const combined: IpoItem[] = [];

                // Helper to normalize status
                const normalizeStatus = (status: string): any => {
                    if (status === 'NEW') return 'New';
                    if (status === 'ACTIVE') return 'Active';
                    if (status === 'DRAFT') return 'Draft';
                    return status;
                };

                // Iterate Scraped Items
                scrapedIpos.forEach(scraped => {
                    const code = scraped.code ? scraped.code.toUpperCase() : '';

                    if (code && manualMap.has(code)) {
                        // Found a manual override for this code
                        const manual = manualMap.get(code);

                        // Merge: Manual takes precedence, fall back to scraped data for blanks
                        combined.push({
                            code: manual.code,
                            company: manual.company,
                            date: manual.date || scraped.date,
                            price: manual.price || scraped.price,
                            lotCount: manual.lotCount || scraped.lotCount,
                            market: manual.market || scraped.market,
                            url: manual.url || scraped.url,
                            imageUrl: manual.imageUrl || scraped.imageUrl,
                            distributionMethod: manual.distributionMethod || scraped.distributionMethod,
                            isNew: manual.isNew,
                            statusText: manual.statusText || undefined,
                            status: normalizeStatus(manual.status)
                        });

                        // Remove from map so we don't add it again later
                        manualMap.delete(code);
                    } else {
                        // No manual override, keep scraped item as is
                        combined.push(scraped);
                    }
                });

                // Add remaining (purely new) Manual items
                manualMap.forEach((manual: any) => {
                    // Generate a mock URL if missing so links work
                    const slug = manual.company.toLowerCase()
                        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-').replace(/^-|-$/g, '');

                    const finalUrl = manual.url || `https://halkarz.com/${slug}`;

                    combined.push({
                        code: manual.code,
                        company: manual.company,
                        date: manual.date || '-',
                        price: manual.price || '-',
                        lotCount: manual.lotCount || '-',
                        market: manual.market || '-',
                        url: finalUrl,
                        imageUrl: manual.imageUrl || '',
                        distributionMethod: manual.distributionMethod || '-',
                        isNew: manual.isNew,
                        statusText: manual.statusText || undefined,
                        status: normalizeStatus(manual.status)
                    });
                });

                return combined;
            },
            ['active-ipos-list-reliable-v11'], // Cache key updated
            { revalidate: 7200, tags: ['ipos'] } // Cache for 2 hours
        );

        return getCached();
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
                const getText = (selector: string) => (document.querySelector(selector) as HTMLElement)?.innerText?.trim() || '';
                const bodyText = document.body.innerText;

                const extract = (patterns: RegExp[]) => {
                    for (const pattern of patterns) {
                        const match = bodyText.match(pattern);
                        if (match && match[1]) return match[1].trim();
                    }
                    return '';
                };

                const company = (document.querySelector('h1') as HTMLElement)?.innerText || '';
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

            // --- MANUAL OVERRIDE LOGIC ---
            // If the scraping failed or returned partial data, OR if we have a manual override in DB, apply it.
            // We search for a manual IPO where code matches scraped code OR url matches current slug context
            let manualOverride = null;
            try {
                // Try to find by URL code segment (slug) if scraping yielded no code
                // Or by the scraped code if available
                const scrapedCode = details.code;

                if (scrapedCode) {
                    // @ts-ignore
                    manualOverride = await db.ipo.findFirst({
                        where: { code: { equals: scrapedCode, mode: 'insensitive' } }
                    });
                }

                // If not found by code (or no code scraped), try by URL matching slug
                if (!manualOverride) {
                    // @ts-ignore
                    manualOverride = await db.ipo.findFirst({
                        where: { url: { contains: slug } }
                    });
                }

                // FALLBACK: If still not found, try to match by converting slug to fuzzy company name
                // e.g. 'deneme-as' -> matches 'Deneme A.Ş.' roughly? OR assume slug is unique enough?
                // Let's try matching code as the slug itself (user might look for /market/ipo/DENEME)
                if (!manualOverride) {
                    // @ts-ignore
                    manualOverride = await db.ipo.findFirst({
                        where: { code: { equals: slug, mode: 'insensitive' } }
                    });
                }
            } catch (e) {
                console.error("Manual override lookup failed:", e);
            }

            const ipoDetail: IpoDetail = {
                url,
                isNew: false,
                ...details,
                // Override with manual data if exists
                ...(manualOverride ? {
                    code: manualOverride.code || details.code,
                    company: manualOverride.company || details.company,
                    date: manualOverride.date || details.date,
                    price: manualOverride.price || details.price,
                    lotCount: manualOverride.lotCount || details.lotCount,
                    market: manualOverride.market || details.market,
                    distributionMethod: manualOverride.distributionMethod || details.distributionMethod,
                    imageUrl: manualOverride.imageUrl || details.imageUrl,
                    // If manual status text is present, could override? Not in IpoDetail interface currently but useful.
                } : {}),
                discount: '',
                pazar: manualOverride?.market || details.market,
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
    public static async scrapeIpos(): Promise<IpoItem[]> {
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

            // Removed "Load More" logic as per user request to ensure reliable first-page data.
            // We will just scrape the initially visible items.

            // Extract basic list info with MORE details to avoid visiting every page
            const basicList = await page.evaluate(() => {
                // Find the "Talep Toplama" header to see if it exists on page
                // This is based on user feedback that "Talep Toplama / Yeni Basvurular" is a header
                const talepHeader = Array.from(document.querySelectorAll('h1, h2, h3, .content-header')).find(h => h.textContent && h.textContent.match(/Talep\s*Topl/i));
                const hasTalepHeader = !!talepHeader;

                const items = Array.from(document.querySelectorAll('article.index-list'));
                // Increase limit to 100 to capture everything
                return items.slice(0, 100).map(el => {
                    const htmlEl = el as HTMLElement;
                    const linkEl = htmlEl.querySelector('a') as HTMLAnchorElement;
                    const imgEl = htmlEl.querySelector('img') as HTMLImageElement;

                    const text = htmlEl.innerText;
                    const codeEl = text.split('\n').find((l: string) => /^[A-Z]{4,5}$/.test(l.trim()));
                    const isNew = !!htmlEl.querySelector('.il-new');

                    let statusText = '';

                    // Logic based on user request: 
                    // "Eger cektigimiz sitede talep toplaniyor yaziyorsa bizde de yazsin"
                    // Strategy:
                    // 1. Check if the specific text is in the card
                    // 2. Check if the page has a "Talep Toplama" header AND the item is marked as New (which implies it's under that header)

                    if (text.match(/Talep\s*Topl/i)) {
                        statusText = 'TALEP TOPLANIYOR';
                    } else if (isNew && hasTalepHeader) {
                        statusText = 'TALEP TOPLANIYOR';
                    }

                    const isHazirlaniyor =
                        text.toLowerCase().includes('hazırla') ||
                        text.toLowerCase().includes('taslak');

                    return {
                        url: linkEl?.href || '',
                        imageUrl: imgEl?.src || '',
                        code: codeEl || '',
                        company: htmlEl.querySelector('h3')?.innerText?.trim() || '',
                        isNew,
                        statusText,
                        isHazirlaniyor,
                        listText: text
                    };
                });
            });

            // 2. Fetch details - BUT SKIP DRAFTS to save time/resources
            const detailedIpos: IpoItem[] = [];

            for (const item of basicList) {
                if (!item.url) continue;

                // Optimization: If it's explicitly "Hazırlanıyor" (Draft), we skip the detail page
                // because typical draft pages have little info, and we can just show "Taslak" status.
                if (item.isHazirlaniyor) {
                    detailedIpos.push({
                        code: item.code || 'TASLAK',
                        company: item.company,
                        url: item.url,
                        imageUrl: item.imageUrl,
                        date: 'Hazırlanıyor...',
                        price: 'Belirlenmedi',
                        lotCount: '-',
                        market: 'Yıldız/Ana Pazar',
                        distributionMethod: '-',
                        isNew: false,
                        statusText: item.statusText,
                        status: 'Draft' // Safe fallback
                    });
                    continue;
                }

                // For Non-Drafts (Active/New), we still fetch details for accuracy
                const slug = item.url.split('/').filter(Boolean).pop() || '';
                const cachedDetail = this.detailCache.get(slug);
                if (cachedDetail && (Date.now() - cachedDetail.timestamp < this.CACHE_DURATION * 1000)) {
                    detailedIpos.push(cachedDetail.data);
                    continue;
                }

                try {
                    // Reuse page context if possible would be better, but loop is fine for < 20 items
                    await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

                    const details = await page.evaluate(() => {
                        const bodyText = document.body.innerText;
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
                        code: details.code || item.code,
                        company: details.company || item.company,
                        date: details.date,
                        price: details.price,
                        lotCount: details.lotCount,
                        market: details.market,
                        distributionMethod: details.distributionMethod,
                        statusText: item.statusText,
                        status: (details.date.toLowerCase().includes('hazırla') || details.price.includes('?')) ? 'Draft' : (item.isNew ? 'New' : 'Active')
                    });

                } catch (err) {
                    console.warn(`Failed to scrape details for ${item.url}:`, err);
                    // Fallback to basic info if detail scrape fails
                    detailedIpos.push({
                        ...item,
                        date: '-',
                        price: '-',
                        lotCount: '-',
                        market: '-',
                        distributionMethod: '-',
                        statusText: item.statusText,
                        status: 'Draft' // Default to Draft if we can't scrape details (likely obscure draft page)
                    });
                }
            }

            await browser.close();
            return detailedIpos;

        } catch (error) {
            if (browser) await browser.close();
            console.error('Scrape failed:', error);
            // Return empty list rather than throwing to prevent site crash
            return [];
        }
    }
}
