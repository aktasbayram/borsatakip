import axios from 'axios';
import puppeteer from 'puppeteer';

export interface AgendaItem {
    id: string;
    time: string;
    countryCode: 'TR' | 'US' | 'EU' | 'CA' | 'CN' | 'JP' | 'GB' | 'DE';
    title: string;
    expectation?: string;
    actual?: string;
    impact: 'low' | 'medium' | 'high';
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
    private static cache: { data: FintablesAgendaItem[]; timestamp: number } | null = null;
    private static CACHE_DURATION = 60 * 60 * 1000; // 1 hour

    /**
     * Fetches agenda items for a specific date.
     * Uses cached data or fetches fresh data from Fintables API via Puppeteer.
     */
    static async getDailyAgenda(date: string): Promise<AgendaItem[]> {
        try {
            const allItems = await this.getOrFetchData();

            // Filter by date
            const daysItems = allItems.filter(item => item.day === date);

            return daysItems.map((item, index) => this.mapToAgendaItem(item, index));
        } catch (error) {
            console.error('Agenda fetching failed, using fallback:', error);
            return this.getFallbackData(date);
        }
    }

    private static async getOrFetchData(): Promise<FintablesAgendaItem[]> {
        const now = Date.now();
        if (this.cache && (now - this.cache.timestamp < this.CACHE_DURATION)) {
            return this.cache.data;
        }

        const data = await this.fetchFromFintables();
        if (data.length > 0) {
            this.cache = { data, timestamp: now };
        }
        return data;
    }

    private static async fetchFromFintables(): Promise<FintablesAgendaItem[]> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Define the API URLs we found
            const urls = [
                'https://api.fintables.com/mobile/agenda/?time=thisWeek',
                'https://api.fintables.com/mobile/agenda/?time=nextWeek'
            ];

            const allData: FintablesAgendaItem[] = [];

            for (const url of urls) {
                try {
                    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
                    // Sometimes responses are wrapped in <pre> or just body text
                    const text = await page.evaluate(() => document.body.innerText);

                    try {
                        const json = JSON.parse(text);
                        if (Array.isArray(json)) {
                            allData.push(...json);
                        }
                    } catch (parseError) {
                        console.warn(`Failed to parse JSON from ${url}:`, parseError);
                    }
                } catch (err) {
                    console.warn(`Failed to fetch ${url}`, err);
                }
            }

            await browser.close();
            return allData;

        } catch (error) {
            console.error('Puppeteer API fetch error:', error);
            if (browser) await browser.close();
            return [];
        }
    }

    private static mapToAgendaItem(item: FintablesAgendaItem, index: number): AgendaItem {
        // Map country code
        let countryCode: AgendaItem['countryCode'] = 'TR';
        // Sometimes image_fallback_text is null, try to guess from title or default to TR
        const fallback = item.image_fallback_text || '';

        if (['US', 'EU', 'CA', 'CN', 'JP', 'GB', 'DE'].includes(fallback)) {
            countryCode = fallback as AgendaItem['countryCode'];
        } else if (item.title.includes('ABD') || item.title.includes('Fed')) {
            countryCode = 'US';
        } else if (item.title.includes('Euro') || item.title.includes('ECB')) {
            countryCode = 'EU';
        }

        // Extract Expectation
        let expectation = undefined;
        // Check for specific labels
        const expData = item.data?.find(d => d.label === 'Beklenti' || d.label === 'Bedelsiz IK (%)' || d.label === 'Önceki');

        if (expData) {
            if (expData.label === 'Bedelsiz IK (%)') {
                expectation = `%${expData.value}`; // Format percentage for capital increase
            } else {
                expectation = expData.value;
            }
        }

        // Determine Impact
        // Heuristic based on type or content
        let impact: 'low' | 'medium' | 'high' = 'medium';
        const titleLower = item.title.toLowerCase();

        if (item.type === 'capitalincrease' || item.type === 'dividend') impact = 'high';
        else if (titleLower.includes('faiz oranı') || titleLower.includes('gsyih') || titleLower.includes('enflasyon') || titleLower.includes('tüfe')) impact = 'high';
        else if (titleLower.includes('konuşması') && (titleLower.includes('başkanı') || titleLower.includes('powell'))) impact = 'high';
        else if (titleLower.includes('işsizlik')) impact = 'high';
        else if (item.type === 'ipo') impact = 'medium';
        else impact = 'medium';

        return {
            id: `api-${item.day}-${index}`,
            time: item.time || 'Gün Boyu',
            countryCode,
            title: item.title,
            expectation,
            impact
        };
    }

    private static getFallbackData(date: string): AgendaItem[] {
        // Fallback only returns data for specific critical dates/items we know about for demo purposes
        // Realistically this would be empty or very basic if live scrape fails for future dates
        const today = new Date().toISOString().split('T')[0];

        if (date === today) {
            return [
                {
                    id: `fallback-1`,
                    time: '09:00',
                    countryCode: 'TR',
                    title: 'QNBTR Sermaye Artırımı (~%64 Bedelsiz)',
                    expectation: '%64.17',
                    impact: 'high'
                },
                {
                    id: `fallback-2`,
                    time: '18:00',
                    countryCode: 'US',
                    title: 'Conference Board (CB) Tüketici Güveni (Oca)',
                    expectation: '90.6',
                    impact: 'medium'
                }
            ];
        }
        return [];
    }
}
