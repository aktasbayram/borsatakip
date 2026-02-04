import axios from 'axios';
import { ConfigService } from "@/services/config";

const getKapConfig = async () => {
    return {
        url: await ConfigService.get("KAP_API_URL") || 'https://apigwdev.mkk.com.tr/api/vyk',
        apiKey: await ConfigService.get("MKK_API_KEY"),
        apiSecret: await ConfigService.get("MKK_API_SECRET"),
        // Legacy fallback
        username: await ConfigService.get("KAP_API_USERNAME"),
        password: await ConfigService.get("KAP_API_PASSWORD")
    }
}

// Caching configuration
let memberCache: Record<string, string> | null = null;
let lastCacheTime = 0;
let apiToken: { token: string; expires: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours caching for Member IDs

// Domain Interfaces
export interface KAPTargetNews {
    id: string;
    title: string;
    date: string;
    summary: string;
    url: string;
    companyCode?: string;
    disclosureType?: string;
}

// Helper to safely extract values from potentially nested objects in response
function getValue(obj: any): string {
    if (obj === null || obj === undefined) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
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
    /**
     * Modern Token-based Auth (MKK Portal /generateToken)
     */
    private static async getAccessToken(): Promise<string | null> {
        const now = Date.now();
        if (apiToken && apiToken.expires > now + 30000) {
            return apiToken.token;
        }

        try {
            const { url, apiKey, apiSecret } = await getKapConfig();
            if (!apiKey || !apiSecret) return null;

            const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
            const response = await axios.get(`${url}/generateToken`, {
                headers: { Authorization: `Basic ${auth}` },
                timeout: 5000
            });

            const token = response.data?.token || response.data;
            if (token) {
                // Tokens usually valid for 1 hour, let's cache for 50 mins
                apiToken = { token, expires: now + (50 * 60 * 1000) };
                return token;
            }
            return null;
        } catch (error) {
            console.error('KAP Token Generation Failed:', error);
            return null;
        }
    }

    private static async getAuthHeader() {
        const token = await this.getAccessToken();
        if (token) return { Authorization: `Bearer ${token}` };

        // Legacy Fallback to Basic Auth if Token fails
        const { username, password } = await getKapConfig();
        if (!username || !password) return {};
        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        return { Authorization: `Basic ${auth}` };
    }

    public static async getMembers(): Promise<Record<string, string>> {
        if (memberCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
            return memberCache;
        }

        try {
            const { url } = await getKapConfig();
            const response = await axios.get(`${url}/members`, {
                headers: await this.getAuthHeader(),
                timeout: 5000
            });

            let members: any[] = [];
            const data = response.data;
            if (Array.isArray(data)) members = data;
            else if (data?.members) members = data.members;

            const cache: Record<string, string> = {};
            for (const member of members) {
                const code = getValue(member.stockCode);
                const id = getValue(member.id);
                if (code && id) cache[code] = id;
            }

            memberCache = cache;
            lastCacheTime = Date.now();
            return cache;
        } catch (error) {
            console.error('Failed to fetch KAP members:', error);
            return memberCache || {};
        }
    }

    private static async getMemberId(symbol: string): Promise<string | null> {
        const members = await this.getMembers();
        return members[symbol] || null;
    }

    public static async getLastDisclosureIndex(): Promise<number | null> {
        try {
            const { url } = await getKapConfig();
            const response = await axios.get(`${url}/lastDisclosureIndex`, {
                headers: await this.getAuthHeader(),
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

    /**
     * Fetches a list of global disclosures (not filtered by symbol)
     */
    public static async getAllDisclosures(limit: number = 50): Promise<KAPTargetNews[]> {
        try {
            const lastIndex = await this.getLastDisclosureIndex();
            if (!lastIndex) return [];

            const queryIndex = Math.max(0, lastIndex - 500); // Look back 500 records
            const { url } = await getKapConfig();

            const response = await axios.get(`${url}/disclosures`, {
                params: { disclosureIndex: queryIndex },
                headers: await this.getAuthHeader(),
                timeout: 8000
            });

            const data = response.data?.disclosures || response.data || [];
            const rawDisclosures = Array.isArray(data) ? data : [data];

            const mappedDisclosures = rawDisclosures
                .map(d => {
                    const id = getValue(d.disclosureIndex);
                    if (!id) return null;

                    return {
                        id: String(id),
                        title: getValue(d.title),
                        date: getValue(d.publishDateTime) || new Date().toISOString(),
                        summary: getValue(d.summary) || getValue(d.title),
                        url: `https://www.kap.org.tr/tr/Bildirim/${id}`,
                        companyCode: getValue(d.stockCode) || getValue(d.companyName) || undefined,
                        disclosureType: getValue(d.disclosureType) || undefined
                    } as KAPTargetNews;
                })
                .filter((d): d is KAPTargetNews => d !== null);

            return mappedDisclosures
                .sort((a, b) => Number(b.id) - Number(a.id))
                .slice(0, limit);

        } catch (error) {
            console.error('Error fetching global KAP disclosures:', error);
            return [];
        }
    }

    public static async getNews(symbol: string): Promise<KAPTargetNews[]> {
        try {
            const memberId = await this.getMemberId(symbol);
            if (!memberId) return [];

            const lastIndex = await this.getLastDisclosureIndex();
            if (!lastIndex) return [];

            const queryIndex = Math.max(0, lastIndex - 2000);
            const { url } = await getKapConfig();

            const response = await axios.get(`${url}/disclosures`, {
                params: {
                    disclosureIndex: queryIndex,
                    companyId: memberId,
                },
                headers: await this.getAuthHeader(),
                timeout: 5000
            });

            const data = response.data?.disclosures || response.data || [];
            const rawDisclosures = Array.isArray(data) ? data : [data];

            return rawDisclosures
                .map(d => {
                    const id = getValue(d.disclosureIndex);
                    if (!id) return null;
                    return {
                        id: String(id),
                        title: getValue(d.title),
                        date: getValue(d.publishDateTime) || new Date().toISOString(),
                        summary: getValue(d.summary) || getValue(d.title),
                        url: `https://www.kap.org.tr/tr/Bildirim/${id}`
                    };
                })
                .filter((d): d is KAPTargetNews => d !== null)
                .sort((a, b) => Number(b.id) - Number(a.id));

        } catch (error) {
            console.error(`Error fetching KAP news for ${symbol}:`, error);
            return [];
        }
    }
}
