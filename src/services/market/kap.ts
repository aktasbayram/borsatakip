import axios from 'axios';

// Environment variables
const KAP_API_URL = process.env.KAP_API_URL || 'https://apigwdev.mkk.com.tr/api/vyk';
const KAP_USERNAME = process.env.KAP_API_USERNAME;
const KAP_PASSWORD = process.env.KAP_API_PASSWORD;

// Caching configuration
let memberCache: Record<string, string> | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours caching for Member IDs

// Domain Interfaces
export interface KAPTargetNews {
    id: string;
    title: string;
    date: string;
    summary: string;
    url: string;
}

// Helper to safely extract values from potentially nested objects in response
function getValue(obj: any): string {
    if (obj === null || obj === undefined) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
        // Handle { key: { key: "value" } } pattern commonly seen in this API spec
        const values = Object.values(obj);
        if (values.length === 1) {
            const inner = values[0];
            if (typeof inner === 'string') return inner;
            if (typeof inner === 'object') return getValue(inner);
        }
    }
    return '';
}

export class KAPService {
    private static getAuthHeader() {
        if (!KAP_USERNAME || !KAP_PASSWORD) return {};
        const auth = Buffer.from(`${KAP_USERNAME}:${KAP_PASSWORD}`).toString('base64');
        return { Authorization: `Basic ${auth}` };
    }

    private static async getMembers(): Promise<Record<string, string>> {
        // Return cached member list if available and fresh
        if (memberCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
            return memberCache;
        }

        try {
            console.log('Fetching KAP members from API...');
            const response = await axios.get(`${KAP_API_URL}/members`, {
                headers: this.getAuthHeader(),
                timeout: 5000
            });

            // Handle response data structure variations
            let members: any[] = [];
            const data = response.data;

            if (Array.isArray(data)) {
                members = data;
            } else if (data && Array.isArray(data.members)) {
                members = data.members;
            } else if (typeof data === 'object') {
                members = Object.values(data);
            }

            const cache: Record<string, string> = {};

            for (const member of members) {
                // Extract stockCode and ID using safe getter
                const code = getValue(member.stockCode);
                const id = getValue(member.id);

                if (code && id) {
                    cache[code] = id;
                }
            }

            console.log(`Cached ${Object.keys(cache).length} KAP members.`);
            memberCache = cache;
            lastCacheTime = Date.now();
            return cache;
        } catch (error) {
            console.error('Failed to fetch KAP members:', error);
            // Return stale cache if available, otherwise empty object
            return memberCache || {};
        }
    }

    private static async getMemberId(symbol: string): Promise<string | null> {
        const members = await this.getMembers();
        return members[symbol] || null;
    }

    private static async getLastDisclosureIndex(): Promise<number | null> {
        try {
            const response = await axios.get(`${KAP_API_URL}/lastDisclosureIndex`, {
                headers: this.getAuthHeader(),
                timeout: 3000
            });

            const idxStr = getValue(response.data?.lastDisclosureIndex || response.data);
            const idx = parseInt(idxStr);
            return isNaN(idx) ? null : idx;
        } catch (error) {
            console.error('Failed to get last disclosure index:', error);
            return null;
        }
    }

    public static async getNews(symbol: string): Promise<KAPTargetNews[]> {
        try {
            const memberId = await this.getMemberId(symbol);
            if (!memberId) {
                console.warn(`KAP Member ID not found for symbol: ${symbol}`);
                return [];
            }

            // Get the last disclosure index to know where to start looking
            const lastIndex = await this.getLastDisclosureIndex();
            if (!lastIndex) {
                console.warn('Could not determine last disclosure index.');
                return [];
            }

            // Strategy: Look back X indices to find company news.
            // Since we can't filter by date directly, we use the index.
            // 2000 indices should cover recent activity.
            const queryIndex = Math.max(0, lastIndex - 2000);

            console.log(`Fetching KAP news for ${symbol} (MemberID: ${memberId}, QueryIndex: ${queryIndex})...`);

            const response = await axios.get(`${KAP_API_URL}/disclosures`, {
                params: {
                    disclosureIndex: queryIndex,
                    companyId: memberId,
                },
                headers: this.getAuthHeader(),
                timeout: 5000
            });

            // Parse response
            let rawDisclosures: any[] = [];
            const data = response.data;

            if (Array.isArray(data)) {
                rawDisclosures = data;
            } else if (data && Array.isArray(data.disclosures)) {
                rawDisclosures = data.disclosures;
            } else if (typeof data === 'object') {
                // Single object wrapper or single item
                rawDisclosures = [data];
            }

            // Map to UI format
            const news = rawDisclosures.map(d => {
                const id = getValue(d.disclosureIndex);
                const title = getValue(d.title);
                const dateRaw = getValue(d.publishDateTime);
                const summaryRaw = getValue(d.summary);

                if (!id || !title) return null;

                return {
                    id: String(id),
                    title: String(title),
                    // If date is missing (common in list view), use current time as fallback 
                    // or ideally we should fetch details. For now, fallback to avoid UI break.
                    date: dateRaw || new Date().toISOString(),
                    summary: summaryRaw || title,
                    url: `https://www.kap.org.tr/tr/Bildirim/${id}`
                };
            }).filter((d): d is KAPTargetNews => d !== null);

            // Sort by ID descending (newest first)
            return news.sort((a, b) => Number(b.id) - Number(a.id));

        } catch (error) {
            console.error(`Error fetching KAP news for ${symbol}:`, error);
            if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
                console.warn('KAP API Auth failed. Check credentials.');
            }
            return [];
        }
    }
}
