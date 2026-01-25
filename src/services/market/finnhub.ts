import axios from 'axios';
import { MarketDataProvider, MarketQuote, MarketCandle, SymbolSearchResult } from './provider';
import { marketCache } from './cache';
import { ConfigService } from "../config";

const BASE_URL = 'https://finnhub.io/api/v1';

let finnhubApiKey: string | undefined;

const getFinnhubApiKey = async (): Promise<string | undefined> => {
    if (!finnhubApiKey) {
        finnhubApiKey = await ConfigService.get("FINNHUB_API_KEY");
    }
    return finnhubApiKey;
};

const isMock = async () => {
    const key = await getFinnhubApiKey();
    return !key || key === 'your_finnhub_api_key';
};

export class FinnhubProvider implements MarketDataProvider {
    async getQuote(symbol: string): Promise<MarketQuote> {
        if (await isMock()) {
            console.warn('Finnhub API Key invalid. Returning mock data for', symbol);
            return {
                symbol,
                price: 150.0 + Math.random() * 5,
                change: 1.5,
                changePercent: 1.0,
                currency: 'USD',
                market: 'US',
                timestamp: Date.now(),
            };
        }

        const cacheKey = `quote:US:${symbol}`;
        const cached = marketCache.get<MarketQuote>(cacheKey);
        if (cached) return cached;

        try {
            const apiKey = await getFinnhubApiKey();
            if (!apiKey) throw new Error("FINNHUB_API_KEY not configured");
            const response = await axios.get(`${BASE_URL}/quote`, {
                params: { symbol, token: apiKey },
            });

            const data = response.data;
            // Finnhub response: { c: current, d: change, dp: percent, h: high, l: low, o: open, pc: prev close }

            const quote: MarketQuote = {
                symbol,
                price: data.c,
                change: data.d,
                changePercent: data.dp,
                currency: 'USD',
                market: 'US',
                timestamp: Date.now(),
            };

            marketCache.set(cacheKey, quote, 30); // 30 seconds cache
            return quote;
        } catch (error) {
            console.error('Finnhub quote error:', error);
            // Fallback to mock on error to prevent UI crash
            return {
                symbol,
                price: 0,
                change: 0,
                changePercent: 0,
                currency: 'USD',
                market: 'US',
                timestamp: Date.now(),
            };
        }
    }

    async getCandles(symbol: string, range: '1D' | '1W' | '1M' | '3M' | '1Y', interval?: string): Promise<MarketCandle[]> {
        if (await isMock()) {
            const mockCandles: MarketCandle[] = [];
            const now = Date.now();
            let price = 150;
            for (let i = 0; i < 30; i++) {
                price = price + (Math.random() - 0.5) * 5;
                mockCandles.push({
                    timestamp: now - (30 - i) * 86400000,
                    open: price,
                    high: price + 2,
                    low: price - 2,
                    close: price + (Math.random() - 0.5),
                    volume: 1000000
                });
            }
            return mockCandles;
        }

        // Finnhub stock candles endpoint
        // resolution: 1, 5, 15, 30, 60, D, W, M
        // to, from: unix timestamp
        const cacheKey = `candles:US:${symbol}:${range}`;
        const cached = marketCache.get<MarketCandle[]>(cacheKey);
        if (cached) return cached;

        let resolution = 'D';
        let from = Math.floor(Date.now() / 1000) - 86400; // default 1 day

        switch (range) {
            case '1D': resolution = '5'; from = Math.floor(Date.now() / 1000) - 86400; break; // 1 day ago
            case '1W': resolution = '60'; from = Math.floor(Date.now() / 1000) - 7 * 86400; break;
            case '1M': resolution = 'D'; from = Math.floor(Date.now() / 1000) - 30 * 86400; break;
            case '3M': resolution = 'D'; from = Math.floor(Date.now() / 1000) - 90 * 86400; break;
            case '1Y': resolution = 'W'; from = Math.floor(Date.now() / 1000) - 365 * 86400; break;
        }

        try {
            const apiKey = await getFinnhubApiKey();
            const response = await axios.get(`${BASE_URL}/stock/candle`, {
                params: {
                    symbol,
                    resolution,
                    from,
                    to: Math.floor(Date.now() / 1000),
                    token: apiKey,
                },
            });

            const data = response.data;
            if (data.s !== 'ok') return [];

            const candles: MarketCandle[] = data.t.map((timestamp: number, index: number) => ({
                timestamp: timestamp * 1000,
                open: data.o[index],
                high: data.h[index],
                low: data.l[index],
                close: data.c[index],
                volume: data.v[index],
            }));

            marketCache.set(cacheKey, candles, 300); // 5 min cache
            return candles;
        } catch (error: any) {
            console.error('Finnhub candle error:', error?.response?.status, error?.message);

            // Return mock data on error (e.g., 403 Forbidden for free tier)
            const mockCandles: MarketCandle[] = [];
            const now = Date.now();
            let price = 150;
            const days = range === '1D' ? 1 : range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;

            for (let i = 0; i < Math.min(days, 100); i++) {
                price = price + (Math.random() - 0.5) * 5;
                mockCandles.push({
                    timestamp: now - (days - i) * 86400000,
                    open: price,
                    high: price + 2,
                    low: price - 2,
                    close: price + (Math.random() - 0.5),
                    volume: 1000000 + Math.random() * 500000
                });
            }

            return mockCandles;
        }
    }

    async search(query: string): Promise<SymbolSearchResult[]> {
        if (await isMock()) {
            if (query.toUpperCase().includes('A')) return [{ symbol: 'AAPL', description: 'Apple Inc', market: 'US', type: 'Common Stock' }];
            return [];
        }

        try {
            const apiKey = await getFinnhubApiKey();
            const response = await axios.get(`${BASE_URL}/search`, {
                params: { q: query, token: apiKey },
            });

            return response.data.result
                .filter((item: any) => !item.symbol.includes('.')) // Filter out non-US mostly
                .map((item: any) => ({
                    symbol: item.symbol,
                    description: item.description,
                    market: 'US',
                    type: item.type
                }));
        } catch (error) {
            console.error('Finnhub search error:', error);
            return [];
        }
    }
}
