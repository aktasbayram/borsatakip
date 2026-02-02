import axios from 'axios';
import puppeteer from 'puppeteer';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface AgendaItem {
    id: string;
    time: string;
    countryCode: 'TR' | 'US' | 'EU' | 'CA' | 'CN' | 'JP' | 'GB' | 'DE';
    title: string;
    expectation?: string;
    actual?: string;
    previous?: string;
    impact: 'low' | 'medium' | 'high';
    currency?: string;
    isManual?: boolean;
    isLocked?: boolean;
    sortOrder?: number;
}

interface FintablesAgendaItem {
    title: string;
    type: string;
    day: string; // YYYY-MM-DD
    time: string | null;
    image_fallback_text?: string;
    data: { label: string; value: string }[];
}

export class AgendaService {

    /**
     * Get agenda for a specific date from DB. 
     * If no data exists and date is today/future, triggers a sync.
     */
    static async getDailyAgenda(date: string): Promise<AgendaItem[]> {
        try {
            // 1. Try to fetch from DB
            // @ts-ignore
            // @ts-ignore
            const dbItems = await db.economicEvent.findMany({
                where: { date },
                orderBy: [
                    { sortOrder: 'desc' },
                    { time: 'asc' }
                ]
            });

            // 2. If data exists, check if it's stale (older than 60 mins)
            const today = new Date().toISOString().split('T')[0];
            const isToday = date === today;
            let isStale = false;

            if (dbItems.length > 0 && isToday) {
                // @ts-ignore
                const lastUpdate = dbItems[0]?.updatedAt;
                if (lastUpdate) {
                    const diff = new Date().getTime() - new Date(lastUpdate).getTime();
                    if (diff > 60 * 60 * 1000) { // 1 hour
                        isStale = true;
                    }
                }
            }

            if (dbItems.length > 0 && !isStale) {
                return dbItems.map((item: any) => ({
                    id: item.id,
                    time: item.time,
                    countryCode: item.countryCode as any,
                    title: item.title,
                    expectation: item.forecast || undefined,
                    actual: item.actual || undefined,
                    previous: item.previous || undefined,
                    impact: item.importance as any,
                    currency: item.currency || undefined,
                    isManual: item.isManual,
                    isLocked: item.isLocked,
                    sortOrder: item.sortOrder
                }));
            }

            // 3. If no data OR stale, sync
            if ((dbItems.length === 0 && date >= today) || isStale) {
                if (isStale) {
                    console.log(`Data stale for ${date}, refreshing in background...`);
                    this.syncDailyAgenda(date).catch(e => console.error('Bg sync error', e));
                    // Return stale data immediately
                    return dbItems.map((item: any) => ({
                        id: item.id,
                        time: item.time,
                        countryCode: item.countryCode as any,
                        title: item.title,
                        expectation: item.forecast || undefined,
                        actual: item.actual || undefined,
                        previous: item.previous || undefined,
                        impact: item.importance as any,
                        currency: item.currency || undefined,
                        isManual: item.isManual
                    }));
                }

                // Empty case: sync and wait
                console.log(`No data for ${date}, triggering sync...`);
                await this.syncDailyAgenda(date);


                // Fetch again after sync
                // @ts-ignore
                const freshItems = await db.economicEvent.findMany({
                    where: { date },
                    orderBy: [
                        { sortOrder: 'desc' },
                        { time: 'asc' }
                    ]
                });

                return freshItems.map((item: any) => ({
                    id: item.id,
                    time: item.time,
                    countryCode: item.countryCode as any,
                    title: item.title,
                    expectation: item.forecast || undefined,
                    actual: item.actual || undefined,
                    previous: item.previous || undefined,
                    impact: item.importance as any,
                    currency: item.currency || undefined,
                    isManual: item.isManual,
                    isLocked: item.isLocked,
                    sortOrder: item.sortOrder
                }));
            }

            return [];

        } catch (error) {
            console.error('Error fetching agenda:', error);
            return [];
        }
    }

    /**
     * Scrape data from source and save to DB
     */
    static async syncDailyAgenda(date?: string) {
        // If no date provided, sync today + next 7 days logic could apply, 
        // but for now let's stick to the requested logic or default to 'thisWeek' strategy.

        let browser;
        try {
            console.log('Starting Agenda Sync...');
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Fintables serves 'thisWeek' and 'nextWeek' batches.
            // We'll fetch both to ensure coverage.
            const urls = [
                'https://api.fintables.com/mobile/agenda/?time=thisWeek',
                'https://api.fintables.com/mobile/agenda/?time=nextWeek'
            ];

            let scrapedCount = 0;

            for (const url of urls) {
                try {
                    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
                    const text = await page.evaluate(() => document.body.innerText);
                    const json = JSON.parse(text);

                    if (Array.isArray(json)) {
                        for (const item of json) {
                            await this.saveScrapedItem(item);
                            scrapedCount++;
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to process ${url}`, e);
                }
            }

            console.log(`Agenda Sync Completed. Processed ${scrapedCount} items.`);
            return scrapedCount;

        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }

    private static async saveScrapedItem(item: FintablesAgendaItem) {
        // Map fields
        let countryCode = 'TR';
        const fallback = item.image_fallback_text || '';
        if (['US', 'EU', 'CA', 'CN', 'JP', 'GB', 'DE'].includes(fallback)) {
            countryCode = fallback;
        } else if (item.title.includes('ABD') || item.title.includes('Fed')) {
            countryCode = 'US';
        } else if (item.title.includes('Euro') || item.title.includes('ECB')) {
            countryCode = 'EU';
        }

        // Values
        const expectation = item.data?.find(d => d.label === 'Beklenti' || d.label === 'Bedelsiz IK (%)')?.value;
        const actual = item.data?.find(d => d.label === 'Açıklanan' || d.label === 'Gerçekleşen')?.value;
        const previous = item.data?.find(d => d.label === 'Önceki')?.value;

        // Importance
        let importance = 'medium';
        const t = item.title.toLowerCase();
        if (item.type === 'capitalincrease' || item.type === 'dividend') importance = 'high';
        else if (t.includes('faiz') || t.includes('gsyih') || t.includes('enflasyon') || t.includes('tüfe') || t.includes('işsizlik')) importance = 'high';
        else if (t.includes('konuşması') && (t.includes('başkanı') || t.includes('powell'))) importance = 'high';
        else if (item.type === 'ipo') importance = 'medium';
        else importance = 'medium';

        const timeStr = item.time || '00:00';

        // Upsert to DB
        // Custom Logic: Check if exists and isLocked
        try {
            // @ts-ignore
            const existing = await db.economicEvent.findUnique({
                where: {
                    date_time_countryCode_title: {
                        date: item.day,
                        time: timeStr,
                        countryCode: countryCode,
                        title: item.title
                    }
                }
            });

            if (existing && existing.isLocked) {
                // Skip update
                return;
            }

            if (existing) {
                // Update
                // @ts-ignore
                await db.economicEvent.update({
                    where: { id: existing.id },
                    data: {
                        actual: actual || null,
                        forecast: expectation || null,
                        previous: previous || null,
                        importance: importance
                    }
                });
            } else {
                // Create
                // @ts-ignore
                await db.economicEvent.create({
                    data: {
                        date: item.day,
                        time: timeStr,
                        countryCode: countryCode,
                        title: item.title,
                        actual: actual || null,
                        forecast: expectation || null,
                        previous: previous || null,
                        importance: importance,
                        isManual: false,
                        isLocked: false,
                        sortOrder: 0
                    }
                });
            }
        } catch (e) {
            // Ignore unique constraint errors if any race condition
            // console.error('Save failed for', item.title, e);
        }
    }

    /**
     * Manually add an event (Admin)
     */
    static async addManualEvent(data: {
        date: string,
        time: string,
        title: string,
        countryCode: string,
        importance: string,
        forecast?: string,
        actual?: string
    }) {
        // Find current max sortOrder for this date
        // @ts-ignore
        const maxSortItem = await db.economicEvent.findFirst({
            where: { date: data.date },
            orderBy: { sortOrder: 'desc' }
        });

        const newSortOrder = (maxSortItem?.sortOrder || 0) + 1;

        // @ts-ignore
        return await db.economicEvent.create({
            data: {
                ...data,
                isManual: true,
                sortOrder: newSortOrder
            }
        });
    }

    /**
     * Delete an event (Admin)
     */
    static async deleteEvent(id: string) {
        // @ts-ignore
        return await db.economicEvent.delete({
            where: { id }
        });
    }

    /**
     * Update an event (Admin)
     */
    static async updateEvent(id: string, data: any) {
        // @ts-ignore
        return await db.economicEvent.update({
            where: { id },
            data
        });
    }

    /**
     * Reorder events (Admin)
     */
    static async reorder(items: { id: string, sortOrder: number }[]) {
        const transactions = items.map(item =>
            // @ts-ignore
            db.economicEvent.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder }
            })
        );
        // @ts-ignore
        return await db.$transaction(transactions);
    }
}
