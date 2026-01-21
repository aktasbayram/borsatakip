
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
        const cacheKey = `quote:GF:${symbol}`;
        const cached = marketCache.get<MarketQuote>(cacheKey);
        if (cached) return cached;

        const googleSymbol = this.normalizeSymbol(symbol);
        const url = `https://www.google.com/finance/quote/${googleSymbol}`;

        try {
            // Priority 1: Google Finance Scraping (Best for RT price)
            console.log(`Scraping Google Finance: ${url}`);
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: 5000
            });

            const $ = cheerio.load(response.data);
            let priceText = $('.YMlKec.fxKbKc').first().text();
            if (!priceText) priceText = $('[data-last-price]').first().attr('data-last-price') || '0';

            // Cleanup price text
            let cleanPrice = priceText.replace('₺', '').replace('$', '').trim();
            if (cleanPrice.includes(',') && !cleanPrice.includes('.')) {
                cleanPrice = cleanPrice.replace(',', '.');
            } else if (cleanPrice.includes('.') && cleanPrice.includes(',')) {
                cleanPrice = cleanPrice.replace('.', '').replace(',', '.');
            } else if (cleanPrice.includes(',')) {
                cleanPrice = cleanPrice.replace(',', '');
            }

            let price = parseFloat(cleanPrice);

            // If Google fails (e.g. for Indices like XU100 that return empty), TRY YAHOO BACKUP
            if (isNaN(price) || price === 0) {
                console.warn(`Google scrape failed for ${symbol}, trying Yahoo Backup...`);
                return this.getQuoteFromYahooDirect(symbol);
            }

            let changePercentText = $('.JwB6zf').first().text();
            let changePercent = parseFloat(changePercentText.replace('%', '').replace('+', '').trim()) || 0;
            if (changePercentText.includes('-') && changePercent > 0) changePercent = -changePercent;

            const prevClose = price / (1 + changePercent / 100);
            const change = price - prevClose;

            const marketQuote: MarketQuote = {
                symbol: symbol,
                price: price,
                change: change,
                changePercent: changePercent,
                currency: 'TRY',
                market: 'BIST',
                timestamp: Date.now(),
            };

            marketCache.set(cacheKey, marketQuote, 60);
            return marketQuote;

        } catch (error: any) {
            console.error(`Google Finance scrape error for ${symbol}:`, error.message);
            // Fallback to Yahoo Direct if Google completely errors out
            try {
                return await this.getQuoteFromYahooDirect(symbol);
            } catch (yahooError) {
                console.error("Yahoo Backup also failed:", yahooError);
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
            market: 'BIST',
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
        const COMMON_STOCKS = [
            { s: 'THYAO', d: 'TURK HAVA YOLLARI' },
            { s: 'GARAN', d: 'TURKIYE GARANTI BANKASI' },
            { s: 'ASELS', d: 'ASELSAN' },
            { s: 'AKBNK', d: 'AKBANK' },
            { s: 'YKBNK', d: 'YAPI VE KREDI BANKASI' },
            { s: 'ISCTR', d: 'TURKIYE IS BANKASI' },
            { s: 'SAHOL', d: 'SABANCI HOLDING' },
            { s: 'KCHOL', d: 'KOC HOLDING' },
            { s: 'TUPRS', d: 'TUPRAS' },
            { s: 'EREGL', d: 'EREGLI DEMIR CELIK' },
            { s: 'SISE', d: 'SISE CAM' },
            { s: 'BIMAS', d: 'BIM MAGAZALAR' }
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
