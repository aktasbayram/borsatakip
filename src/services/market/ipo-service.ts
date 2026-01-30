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
    status: 'New' | 'Active' | 'Draft';
    showOnHomepage?: boolean;
    isLocked?: boolean;
    sortOrder?: number;
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
    /**
     * Syncs IPOs from halkarz.com to the local database.
     */
    static async syncIpos(): Promise<{ added: number, updated: number, errors: number, logs: string[] }> {
        const logs: string[] = [];
        let added = 0;
        let updated = 0;
        let errors = 0;

        try {
            logs.push('Starting sync process...');

            // 1. Scrape the list (homepage + taslak category + approved category)
            logs.push('Scraping IPO lists (Homepage + Drafts + Approved)...');
            const scrapedList = await this.scrapeIposListOnly();
            logs.push(`Found ${scrapedList.length} unique items across all pages.`);

            // Reverse the list so the newest items (at the top of the site) are processed last.
            // This ensures they have the latest createdAt timestamp in the DB.
            const reversedList = [...scrapedList].reverse();

            for (const item of reversedList) {
                try {
                    // Try to generate a valid code if missing
                    let code = item.code;
                    if (!code) {
                        const slug = item.url.split('/').filter(Boolean).pop();
                        if (slug) code = slug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                        else code = 'UNKNOWN-' + Date.now();
                    }

                    const existing = await db.ipo.findFirst({
                        where: {
                            OR: [
                                { code: code },
                                { url: item.url }
                            ]
                        }
                    });

                    // Skip if locked (prevent overwrite of manual changes)
                    if (existing?.isLocked) {
                        logs.push(`Skipping ${item.company} (Locked)`);
                        continue;
                    }

                    // Scrape details if new or incomplete
                    // We used to skip drafts, but users want content for drafts too
                    const isDraft = item.isHazirlaniyor;
                    const shouldScrapeDetails = (!existing || !existing.summaryInfo || (existing.summaryInfo as any[]).length === 0 || item.isNew || item.statusText?.includes('Talep'));

                    let details: Partial<IpoDetail> = {};
                    if (shouldScrapeDetails) {
                        logs.push(`Scraping details for ${item.company}...`);
                        const detailData = await this.scrapeIpoDetailForSync(item.url);
                        if (detailData) {
                            details = detailData;
                        } else {
                            logs.push(`Warning: Could not scrape details for ${item.company}`);
                        }
                    }

                    // Prepare DB payload
                    const payload = {
                        code: code,
                        company: item.company,
                        url: item.url,
                        imageUrl: item.imageUrl,
                        date: details.date || item.dateRaw || existing?.date || '-',
                        price: details.price || existing?.price,
                        lotCount: details.lotCount || existing?.lotCount,
                        market: details.market || existing?.market,
                        distributionMethod: details.distributionMethod || existing?.distributionMethod,
                        leadUnderwriter: details.leadUnderwriter || existing?.leadUnderwriter,
                        firstTradingDate: details.firstTradingDate || existing?.firstTradingDate,
                        statusText: item.statusText || existing?.statusText,
                        // Map status: Taslak -> DRAFT, Talep -> ACTIVE, New -> NEW
                        status: isDraft ? 'DRAFT' : (item.statusText?.includes('Talep') ? 'ACTIVE' : 'NEW'),
                        isNew: item.isNew,
                        summaryInfo: details.summaryInfo ? (details.summaryInfo as any) : existing?.summaryInfo,
                    };

                    if (existing) {
                        await db.ipo.update({
                            where: { id: existing.id },
                            data: payload
                        });
                        updated++;
                    } else {
                        await db.ipo.create({
                            data: {
                                ...payload,
                                showOnHomepage: false
                            }
                        });
                        added++;
                    }

                } catch (itemError: any) {
                    console.error(`Error syncing item ${item.company}:`, itemError);
                    errors++;
                    logs.push(`Error syncing ${item.company}: ${itemError.message}`);
                }
            }

            this.forceRevalidate();
            logs.push('Sync completed successfully.');

        } catch (error: any) {
            console.error('Sync failed:', error);
            logs.push(`Fatal sync error: ${error.message}`);
            throw error;
        }

        return { added, updated, errors, logs };
    }

    /**
     * Get active IPOs purely from the database.
     */
    static async getActiveIpos(): Promise<IpoItem[]> {
        const getCached = unstable_cache(
            async () => {
                let allIpos: any[] = [];
                try {
                    // @ts-ignore
                    if (db.ipo) {
                        // @ts-ignore
                        allIpos = await db.ipo.findMany();
                    }
                } catch (error) {
                    console.error('Failed to fetch IPOs from DB:', error);
                    return [];
                }

                const mapped: IpoItem[] = allIpos.map((ipo: any) => {
                    const dateText = ipo.date || '-';
                    // Fail-safe: Force Draft status if date implies it
                    const isDraftDate = /haz[ıi]rla|taslak|bekle/i.test(dateText);

                    return {
                        code: ipo.code,
                        company: ipo.company,
                        date: dateText,
                        price: ipo.price || '-',
                        lotCount: ipo.lotCount || '-',
                        market: ipo.market || '-',
                        url: ipo.url || '',
                        imageUrl: ipo.imageUrl || '',
                        distributionMethod: ipo.distributionMethod || '-',
                        isNew: ipo.isNew,
                        statusText: ipo.statusText || undefined,
                        status: (ipo.status === 'DRAFT' || (isDraftDate && !ipo.isLocked)) ? 'Draft' :
                            (ipo.status === 'ACTIVE' ? 'Active' : 'New'),
                        showOnHomepage: ipo.showOnHomepage,
                        isLocked: ipo.isLocked,
                        sortOrder: ipo.sortOrder || 0
                    };
                });

                // Sort: Homepage items first, then by status, then by intelligence
                mapped.sort((a, b) => {
                    // 1. Pinned to homepage
                    const aShow = a.showOnHomepage ? 1 : 0;
                    const bShow = b.showOnHomepage ? 1 : 0;
                    if (aShow !== bShow) return bShow - aShow;

                    // 2. Manual Sort Order (Higher numbers first)
                    if ((a.sortOrder || 0) !== (b.sortOrder || 0)) {
                        return (b.sortOrder || 0) - (a.sortOrder || 0);
                    }

                    // 3. Currently active / collecting bids
                    const isTalepA = a.statusText?.includes('TALEP') || a.status === 'Active';
                    const isTalepB = b.statusText?.includes('TALEP') || b.status === 'Active';
                    if (isTalepA !== isTalepB) return isTalepB ? 1 : -1;

                    // 3. New tag
                    if (a.isNew !== b.isNew) return b.isNew ? 1 : -1;

                    // 4. Year aware sort
                    const getYear = (d: string) => {
                        const match = String(d).match(/20\d{2}/);
                        return match ? parseInt(match[0]) : 0;
                    };
                    const yearA = getYear(a.date || '');
                    const yearB = getYear(b.date || '');
                    if (yearA !== yearB) return yearB - yearA;

                    return 0; // Default same
                });

                return mapped;
            },
            ['active-ipos-db-only-v2'],
            { revalidate: 60, tags: ['ipos'] }
        );

        return getCached();
    }

    /**
     * Get detail for an IPO. 
     */
    static async getIpoDetail(slug: string): Promise<IpoDetail | null> {
        const code = slug.toUpperCase();
        const ipo = await db.ipo.findFirst({
            where: {
                OR: [
                    { code: code },
                    { url: { contains: slug } }
                ]
            }
        });

        if (!ipo) return null;

        const dateText = ipo.date || '-';
        const isDraftDate = /haz[ıi]rla|taslak|bekle/i.test(dateText);

        const detail: IpoDetail = {
            code: ipo.code,
            company: ipo.company,
            date: dateText,
            price: ipo.price || '-',
            lotCount: ipo.lotCount || '-',
            market: ipo.market || '-',
            url: ipo.url || '',
            imageUrl: ipo.imageUrl || '',
            distributionMethod: ipo.distributionMethod || '-',
            isNew: ipo.isNew,
            statusText: ipo.statusText || undefined,
            status: (ipo.status === 'DRAFT' || (isDraftDate && !ipo.isLocked)) ? 'Draft' : (ipo.status === 'ACTIVE' ? 'Active' : 'New'),
            showOnHomepage: ipo.showOnHomepage,
            isLocked: ipo.isLocked,

            // Detail fields
            fundsUse: [],
            allocationGroups: [],
            leadUnderwriter: ipo.leadUnderwriter || '-',
            pazar: ipo.market || '-',
            financials: [],
            pledges: [],
            discount: '',
            size: '',
            firstTradingDate: ipo.firstTradingDate || '-',
            summaryInfo: (ipo.summaryInfo as any) || []
        };

        // Calculate size automatically if not present
        const currentSize = (detail.summaryInfo as any[])?.find((x: any) => x.title?.includes("Halka Arz Büyüklüğü"))?.items?.[0];
        if (!currentSize || currentSize === '-' || currentSize === '') {
            try {
                const cleanPrice = (ipo.price || '').replace(/[^\d,]/g, '').replace(',', '.');
                const cleanLots = (ipo.lotCount || '').replace(/[^\d]/g, '');
                const p = parseFloat(cleanPrice);
                const l = parseFloat(cleanLots);
                if (!isNaN(p) && !isNaN(l) && l > 0) {
                    const total = p * l;
                    if (total >= 1000000000) detail.size = (total / 1000000000).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' Milyar TL';
                    else if (total >= 1000000) detail.size = (total / 1000000).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' Milyon TL';
                    else detail.size = total.toLocaleString('tr-TR') + ' TL';
                }
            } catch (e) { }
        } else {
            detail.size = currentSize;
        }

        return detail;
    }

    static forceRevalidate() {
        const { revalidateTag } = require('next/cache');
        try { revalidateTag('ipos'); } catch (e) { }
    }


    /* -------------------------------------------------------------------------- */
    /*                               Scraper Helpers                              */
    /* -------------------------------------------------------------------------- */

    private static async scrapeIposListOnly(): Promise<any[]> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote']
            });
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort().catch(() => { });
                else req.continue().catch(() => { });
            });

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            const allItems: any[] = [];
            const urlsSeen = new Set<string>();

            // Helper for extraction
            const extractItems = async () => {
                return await page.evaluate(() => {
                    const talepHeader = Array.from(document.querySelectorAll('h1, h2, h3, .content-header')).find(h => h.textContent && h.textContent.match(/Talep\s*Topl/i));
                    const hasTalepHeader = !!talepHeader;

                    return Array.from(document.querySelectorAll('article.index-list')).map(el => {
                        const htmlEl = el as HTMLElement;
                        const linkEl = htmlEl.querySelector('a') as HTMLAnchorElement;
                        const imgEl = htmlEl.querySelector('img') as HTMLImageElement;
                        const headerEl = htmlEl.querySelector('h3');
                        const timeEl = htmlEl.querySelector('time');

                        const text = htmlEl.innerText;
                        const headerText = headerEl?.innerText || '';
                        const timeText = timeEl?.innerText?.trim() || '';

                        const codeEl = text.split('\n').find((l: string) => /^[A-Z]{4,5}$/.test(l.trim()));
                        const isNew = !!htmlEl.querySelector('.il-new');

                        let statusText = '';
                        if (text.match(/Talep\s*Topl/i)) statusText = 'TALEP TOPLANIYOR';
                        else if (isNew && hasTalepHeader) statusText = 'TALEP TOPLANIYOR';

                        const draftRegex = /haz[ıi]rla|taslak|bekle/i;
                        const isHazirlaniyor = draftRegex.test(timeText) || draftRegex.test(headerText) || draftRegex.test(text) || timeText.includes('Hazırlanıyor');

                        return {
                            url: linkEl?.href || '',
                            imageUrl: imgEl?.src || '',
                            code: codeEl || '',
                            company: headerText.trim(),
                            isNew,
                            statusText,
                            isHazirlaniyor,
                            dateRaw: timeText
                        };
                    });
                });
            };

            // 1. Homepage
            await page.goto('https://halkarz.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
            const homeItems = await extractItems();
            for (const item of homeItems) {
                if (!urlsSeen.has(item.url)) { allItems.push(item); urlsSeen.add(item.url); }
            }

            // 2. Drafts (k/taslak) - 8 pages
            for (let p = 1; p <= 8; p++) {
                const url = p === 1 ? 'https://halkarz.com/k/taslak/' : `https://halkarz.com/k/taslak/page/${p}/`;
                try {
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    const pagedItems = await extractItems();
                    if (pagedItems.length === 0) break;
                    for (const item of pagedItems) {
                        if (!urlsSeen.has(item.url)) { allItems.push({ ...item, isHazirlaniyor: true }); urlsSeen.add(item.url); }
                    }
                } catch (e) { break; }
            }

            // 3. Approved (k/halka-arz) - 10 pages
            for (let p = 1; p <= 10; p++) {
                const url = p === 1 ? 'https://halkarz.com/k/halka-arz/' : `https://halkarz.com/k/halka-arz/page/${p}/`;
                try {
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    const pagedItems = await extractItems();
                    if (pagedItems.length === 0) break;
                    for (const item of pagedItems) {
                        if (!urlsSeen.has(item.url)) { allItems.push(item); urlsSeen.add(item.url); }
                    }
                } catch (e) { break; }
            }

            return allItems;
        } finally {
            if (browser) await browser.close();
        }
    }

    private static async scrapeIpoDetailForSync(url: string): Promise<IpoDetail | null> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote']
            });
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort().catch(() => { });
                else req.continue().catch(() => { });
            });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

            const details = await page.evaluate(() => {
                const extract = (pattern: RegExp) => {
                    const match = document.body.innerText.match(pattern);
                    return match && match[1] ? match[1].trim() : '';
                };
                const company = document.querySelector('h1')?.innerText || '';
                const date = extract(/Halka Arz Tarihi\s*:\s*(.*?)(?:\s\d{2}:\d{2}|$)/m);
                const price = extract(/Halka Arz Fiyatı.*?:\s*(.*?)(?:\n|$)/);
                const lotCount = extract(/Pay\s*:\s*(.*?)(?:\n|$)/i);
                const distributionMethod = extract(/Dağıtım Yöntemi\s*:\s*(.*?)(?:\n|$)/);
                const market = extract(/Pazar\s*:\s*(.*?)(?:\n|$)/);
                const code = extract(/Bist Kodu\s*:\s*([A-Z0-9]+)/) || '';
                const leadUnderwriter = extract(/Aracı Kurum\s*:\s*(.*?)(?:\n|$)/);
                const firstTradingDate = extract(/Bist İlk İşlem Tarihi\s*:\s*(.*?)(?:\n|$)/) || 'Tarih Bekleniyor';

                const summaryInfo: { title: string, items: string[] }[] = [];
                const summaryListItems = document.querySelectorAll('.sp-arz-extra ul.aex-in li');
                summaryListItems.forEach(li => {
                    const title = li.querySelector('h5')?.innerText?.trim();
                    if (!title) return;
                    const items: string[] = [];
                    const table = li.querySelector('table');
                    if (table) {
                        const rows = Array.from(table.querySelectorAll('tr'));
                        rows.forEach(r => { const txt = r.innerText.replace(/\t/g, ' ').trim(); if (txt) items.push(txt); });
                    } else {
                        const p = li.querySelector('p');
                        if (p) {
                            const lines = p.innerHTML.split(/<br\s*\/?>|\n/);
                            lines.forEach(l => { const txt = l.replace(/<[^>]*>/g, '').trim(); if (txt.length > 2) items.push(txt.replace(/^[-•*]\s*/, '')); });
                        }
                    }
                    if (items.length > 0) summaryInfo.push({ title, items });
                });
                return { company, date, price, lotCount, distributionMethod, market, code, leadUnderwriter, firstTradingDate, summaryInfo } as any;
            });
            return details;
        } catch (e) { return null; } finally { if (browser) await browser.close(); }
    }
}
