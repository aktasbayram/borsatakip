
import axios from 'axios';
import * as cheerio from 'cheerio';
import { MarketDataProvider, MarketQuote, MarketCandle, SymbolSearchResult } from './provider';
import { marketCache } from './cache';

export class YahooProvider implements MarketDataProvider {
    // Mapping for common symbols to Google Finance format
    // Google format: SYMBOL:MARKET (e.g. GARAN:IST)
    private SPECIAL_SYMBOLS: Record<string, string> = {
        'GUMUS': 'XAGUSD',
        'XAGUSD': 'XAGUSD',
        'XAUUSD': 'XAUUSD',
        'USDTRY': 'USD-TRY', // Fixed: Google uses USD-TRY
        'EURTRY': 'EUR-TRY', // Fixed: Google uses EUR-TRY
        'BTC': 'BTC-USD',
        'ETH': 'ETH-USD',
        'USDTRY=X': 'USD-TRY',
        'EURTRY=X': 'EUR-TRY',
        'XAUUSD=X': 'XAUUSD',
        // Indices - These might still be problematic if Google blocks them or uses different DOM
        'XU100': 'XU100:INDEXBIST',
        'XU030': 'XU030:INDEXBIST'
    };

    private normalizeSymbol(symbol: string): string {
        const upper = symbol.toUpperCase();

        // Check special map first (Exact match)
        if (this.SPECIAL_SYMBOLS[upper]) {
            return this.SPECIAL_SYMBOLS[upper];
        }
        // Check special map with clean symbol (removing .IS)
        const cleanSymbol = upper.replace('.IS', '');
        if (this.SPECIAL_SYMBOLS[cleanSymbol]) {
            return this.SPECIAL_SYMBOLS[cleanSymbol];
        }

        // Handle BIST
        if (upper.endsWith('.IS')) {
            return `${upper.replace('.IS', '')}:IST`;
        }

        // Default BIST assumption if no suffix and 4-5 chars
        if (!upper.includes(':') && !upper.includes('-')) {
            return `${upper}:IST`;
        }

        return upper;
    }

    async getQuote(symbol: string): Promise<MarketQuote> {
        // Cache Logic
        const cacheKey = `quote:YF:${symbol}`;
        const cached = marketCache.get<MarketQuote>(cacheKey);
        if (cached) return cached;

        try {
            // Priority 1: Yahoo Finance Library (More stable than scraping)
            // Correct instantiation for CJS/Next.js environment compatibility
            const yahooFinance = require('yahoo-finance2').default;
            const yf = new yahooFinance();

            // Map symbol to Yahoo format
            let yahooSymbol = symbol;
            if (symbol === 'XU100') yahooSymbol = 'XU100.IS';
            if (symbol === 'XU030') yahooSymbol = 'XU030.IS';
            if (symbol === 'USDTRY') yahooSymbol = 'USDTRY=X';
            if (symbol === 'EURTRY') yahooSymbol = 'EURTRY=X';
            if (symbol === 'XAUUSD') yahooSymbol = 'GC=F'; // Gold Futures

            // Auto-append .IS for simple tickers that look like BIST stocks
            if (!yahooSymbol.includes('=') && !yahooSymbol.includes('.') &&
                !yahooSymbol.includes('-') && !yahooSymbol.includes(':')) {
                // If it is likely a currency pair (e.g. BTCUSD), don't add .IS, but here we assume stocks 
                // However, for consistency with our previous logic:
                if (symbol.length <= 5) yahooSymbol += '.IS';
            }

            const quote = await yf.quote(yahooSymbol);

            if (!quote) {
                throw new Error(`No quote found for ${yahooSymbol}`);
            }

            const price = quote.regularMarketPrice || 0;
            const change = quote.regularMarketChange || 0;
            const changePercent = quote.regularMarketChangePercent || 0;

            const marketQuote: MarketQuote = {
                symbol: symbol, // Return original requested symbol (e.g. SASA)
                price: price,
                change: change,
                changePercent: changePercent,
                currency: quote.currency || 'TRY',
                market: (quote.currency === 'TRY' || quote.exchange === 'IST') ? 'BIST' : 'US',
                timestamp: Date.now(),
            };

            marketCache.set(cacheKey, marketQuote, 60);
            return marketQuote;

        } catch (error: any) {
            console.error(`Yahoo Finance library error for ${symbol}:`, error.message);
            // Fallback: return zero'd object to prevent UI crash
            return {
                symbol: symbol,
                price: 0,
                change: 0,
                changePercent: 0,
                currency: 'TRY',
                market: 'BIST',
                timestamp: Date.now(),
            };
        }
    }

    // Backup method using direct Yahoo API (lightweight)
    private async getQuoteFromYahooDirect(symbol: string): Promise<MarketQuote> {
        // Map to Yahoo Symbol
        let yahooSymbol = symbol;
        if (symbol === 'XU100') yahooSymbol = 'XU100.IS';
        if (symbol === 'XU030') yahooSymbol = 'XU030.IS';
        if (symbol === 'USDTRY') yahooSymbol = 'USDTRY=X';
        if (symbol === 'EURTRY') yahooSymbol = 'EURTRY=X';
        if (!yahooSymbol.includes('=') && !yahooSymbol.includes('.') && !yahooSymbol.includes('-')) yahooSymbol += '.IS';

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;
        console.log(`Fetching Yahoo Direct for ${symbol}: ${url}`);

        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const result = response.data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0]; // Could use close price

        const price = meta.regularMarketPrice;
        const prevClose = meta.chartPreviousClose;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        return {
            symbol: symbol,
            price: price,
            change: change,
            changePercent: changePercent,
            currency: meta.currency,
            market: meta.currency === 'TRY' ? 'BIST' : 'US',
            timestamp: Date.now()
        };
    }

    async getCandles(symbol: string, range: '1D' | '1W' | '1M' | '3M' | '1Y'): Promise<MarketCandle[]> {
        const cacheKey = `candles:YD:${symbol}:${range}`;
        const cached = marketCache.get<MarketCandle[]>(cacheKey);
        if (cached) return cached;

        // Map to Yahoo Symbol
        let yahooSymbol = symbol;
        if (symbol === 'XU100') yahooSymbol = 'XU100.IS';
        if (symbol === 'XU030') yahooSymbol = 'XU030.IS';
        if (symbol === 'USDTRY') yahooSymbol = 'USDTRY=X';
        if (symbol === 'EURTRY') yahooSymbol = 'EURTRY=X';
        if (symbol === 'XAUUSD') yahooSymbol = 'GC=F';
        if (!yahooSymbol.includes('=') && !yahooSymbol.includes('.') && !yahooSymbol.includes('-')) yahooSymbol += '.IS';

        let yahooRange = '1d';
        let yahooInterval = '15m';

        switch (range) {
            case '1D': yahooRange = '1d'; yahooInterval = '5m'; break;
            case '1W': yahooRange = '5d'; yahooInterval = '15m'; break;
            case '1M': yahooRange = '1mo'; yahooInterval = '1d'; break;
            case '3M': yahooRange = '3mo'; yahooInterval = '1d'; break;
            case '1Y': yahooRange = '1y'; yahooInterval = '1wk'; break;
        }

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${yahooInterval}&range=${yahooRange}`;

        try {
            console.log(`Fetching Candles Direct: ${url}`);
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            const result = response.data.chart.result[0];
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];

            if (!timestamps || !quotes) return [];

            const candles: MarketCandle[] = [];

            for (let i = 0; i < timestamps.length; i++) {
                if (quotes.close[i] === null) continue;

                candles.push({
                    timestamp: timestamps[i] * 1000,
                    open: quotes.open[i],
                    high: quotes.high[i],
                    low: quotes.low[i],
                    close: quotes.close[i],
                    volume: quotes.volume[i] || 0
                });
            }

            marketCache.set(cacheKey, candles, 300);
            return candles;

        } catch (error: any) {
            console.error(`Yahoo Candle Direct Error for ${symbol}:`, error.message);
            return [];
        }
    }

    async search(query: string): Promise<SymbolSearchResult[]> {
        if (!query || query.length < 2) return [];

        try {
            // Correct instantiation for CJS/Next.js environment compatibility
            const yahooFinance = require('yahoo-finance2').default;
            const yf = new yahooFinance();

            const results = await yf.search(query);

            if (!results || !results.quotes) return [];

            return results.quotes
                .filter((q: any) => q.isYahooFinance) // Filter out news etc.
                .map((q: any) => ({
                    symbol: q.symbol.replace('.IS', ''), // Clean .IS suffix for display
                    description: q.longname || q.shortname || q.symbol,
                    market: q.exchange === 'IST' ? 'BIST' : 'US' // Simple heuristic
                }));

        } catch (error) {
            console.error("Yahoo Search Error:", error);
            // Fallback to static list if API fails
            const COMMON_STOCKS = [
                { s: 'THYAO.IS', d: 'TURK HAVA YOLLARI' },
                { s: 'GARAN.IS', d: 'TURKIYE GARANTI BANKASI' },
                { s: 'ASELS.IS', d: 'ASELSAN' },
                { s: 'AKBNK.IS', d: 'AKBANK' },
                { s: 'YKBNK.IS', d: 'YAPI VE KREDI BANKASI' },
                { s: 'ISCTR.IS', d: 'TURKIYE IS BANKASI' },
                { s: 'SAHOL.IS', d: 'SABANCI HOLDING' },
                { s: 'KCHOL.IS', d: 'KOC HOLDING' },
                { s: 'TUPRS.IS', d: 'TUPRAS' },
                { s: 'EREGL.IS', d: 'EREGLI DEMIR CELIK' },
                { s: 'SISE.IS', d: 'SISE CAM' },
                { s: 'BIMAS.IS', d: 'BIM MAGAZALAR' }
            ];
            const qUpper = query.toUpperCase();
            return COMMON_STOCKS
                .filter(item => item.s.includes(qUpper) || item.d.includes(qUpper))
                .map(item => ({
                    symbol: item.s,
                    description: item.d,
                    market: 'BIST' as 'BIST'
                }));
        }
    }

    async getNews(symbol: string): Promise<any[]> {
        try {
            const yahooFinance = require('yahoo-finance2').default;
            const yf = new yahooFinance();

            // Search usually returns news associated with the query
            // Using a stricter query might help get relevant news
            const results = await yf.search(symbol, { newsCount: 5 });

            if (results && results.news) {
                return results.news.map((n: any) => ({
                    title: n.title,
                    link: n.link,
                    publisher: n.publisher,
                    providerPublishTime: n.providerPublishTime,
                    type: n.type,
                    uuid: n.uuid
                }));
            }
            return [];
        } catch (error) {
            console.error(`Yahoo News Error for ${symbol}:`, error);
            return [];
        }
    }
}
