import axios from 'axios';
import { MarketDataProvider, MarketQuote, MarketCandle, SymbolSearchResult } from './provider';
import { marketCache } from './cache';


export class YahooProvider implements MarketDataProvider {
    private SPECIAL_SYMBOLS: Record<string, string> = {
        'XAGUSD': 'XAGUSD=X', // Silver
        'XAGUS': 'XAGUSD=X',  // Handle common typo
        'XAUUSD': 'XAUUSD=X', // Gold
        'BTC': 'BTC-USD',
        'ETH': 'ETH-USD',
        'USDT': 'USDT-USD'
    };

    private normalizeSymbol(symbol: string): string {
        const upperSymbol = symbol.toUpperCase();

        // Check special map first
        if (this.SPECIAL_SYMBOLS[upperSymbol]) {
            return this.SPECIAL_SYMBOLS[upperSymbol];
        }

        // If it already has a suffix or is a special symbol (like currencies =X), leave it
        if (symbol.includes('.') || symbol.includes('=') || symbol.includes('-')) {
            return symbol;
        }
        // Default to BIST
        return `${upperSymbol}.IS`;
    }

    async getQuote(symbol: string): Promise<MarketQuote> {
        const yahooSymbol = this.normalizeSymbol(symbol);
        const cacheKey = `quote:BIST:${symbol}`;
        const cached = marketCache.get<MarketQuote>(cacheKey);
        if (cached) return cached;

        try {
            // Unofficial API endpoint
            console.log(`Fetching Yahoo quote for: ${yahooSymbol}`);
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`, {
                params: { interval: '1m', range: '1d' },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const result = response.data.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators.quote[0];
            const items = quote.close;
            const price = items[items.length - 1] || meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose;

            const marketQuote: MarketQuote = {
                symbol: symbol, // Return clean symbol
                price: price,
                change: price - prevClose,
                changePercent: ((price - prevClose) / prevClose) * 100,
                currency: 'TRY',
                market: 'BIST',
                timestamp: Date.now(),
            };

            marketCache.set(cacheKey, marketQuote, 30);
            return marketQuote;
        } catch (error) {
            console.error('Yahoo quote error:', error);
            throw new Error('Failed to fetch quote from Yahoo');
        }
    }

    async getCandles(symbol: string, range: '1D' | '1W' | '1M' | '3M' | '1Y'): Promise<MarketCandle[]> {
        const yahooSymbol = this.normalizeSymbol(symbol);
        const cacheKey = `candles:BIST:${symbol}:${range}`;
        const cached = marketCache.get<MarketCandle[]>(cacheKey);
        if (cached) return cached;

        let interval = '1d';
        let rangeParam = '1mo';

        switch (range) {
            case '1D': interval = '5m'; rangeParam = '1d'; break;
            case '1W': interval = '1h'; rangeParam = '5d'; break;
            case '1M': interval = '1d'; rangeParam = '1mo'; break;
            case '3M': interval = '1d'; rangeParam = '3mo'; break;
            case '1Y': interval = '1wk'; rangeParam = '1y'; break;
        }

        try {
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`, {
                params: { interval, range: rangeParam }
            });

            const result = response.data.chart.result[0];
            const timestamp = result.timestamp;
            const quote = result.indicators.quote[0];

            const candles: MarketCandle[] = [];

            if (timestamp && quote) {
                timestamp.forEach((t: number, i: number) => {
                    if (quote.open[i] !== null) {
                        candles.push({
                            timestamp: t * 1000,
                            open: quote.open[i],
                            high: quote.high[i],
                            low: quote.low[i],
                            close: quote.close[i],
                            volume: quote.volume[i] || 0
                        });
                    }
                });
            }

            marketCache.set(cacheKey, candles, 300);
            return candles;

        } catch (error) {
            console.error('Yahoo candle error:', error);
            return [];
        }
    }

    async search(query: string): Promise<SymbolSearchResult[]> {
        // Search in local DB for BIST symbols
        // This assumes Prisma Client is available
        // For now, implementing basic DB search logic
        // PRIMARY: Search in Hardcoded List (Fastest & Most Reliable for common Stocks)
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
            { s: 'BIMAS', d: 'BIM MAGAZALAR' },
            { s: 'AEFES', d: 'ANADOLU EFES' },
            { s: 'AGHOL', d: 'AG ANADOLU GRUBU HOLDING' },
            { s: 'AKSA', d: 'AKSA' },
            { s: 'AKSEN', d: 'AKSA ENERJI' },
            { s: 'ALARK', d: 'ALARKO HOLDING' },
            { s: 'ARCLK', d: 'ARCELIK' },
            { s: 'ASTOR', d: 'ASTOR ENERJI' },
            { s: 'BERA', d: 'BERA HOLDING' },
            { s: 'BRSAN', d: 'BORUSAN BORU SANAYI' },
            { s: 'CIMSA', d: 'CIMSA CIMENTO' },
            { s: 'CWENE', d: 'CW ENERJI' },
            { s: 'DOAS', d: 'DOGUS OTOMOTIV' },
            { s: 'DOHOL', d: 'DOGAN HOLDING' },
            { s: 'EGEEN', d: 'EGE ENDUSTRI' },
            { s: 'EKGYO', d: 'EMLAK KONUT GAYRIMENKUL YATIRIM ORTAKLIGI' },
            { s: 'ENJSA', d: 'ENERJISA ENERJI' },
            { s: 'ENKAI', d: 'ENKA INSAAT' },
            { s: 'EUPWR', d: 'EUROPOWER ENERJI' },
            { s: 'FROTO', d: 'FORD OTOSAN' },
            { s: 'GESAN', d: 'GIRISIM ELEKTRIK SANAYI' },
            { s: 'GUBRF', d: 'GUBRE FABRIKALARI' },
            { s: 'HEKTS', d: 'HEKTAS' },
            { s: 'KONTR', d: 'KONTROLMATIK TEKNOLOJI' },
            { s: 'KOZAA', d: 'KOZA ANADOLU METAL' },
            { s: 'KOZAL', d: 'KOZA ALTIN ISLETMELERI' },
            { s: 'KRDMD', d: 'KARDEMIR KARABUK DEMIR CELIK SANAYI VE TICARET' },
            { s: 'MGROS', d: 'MIGROS TICARET' },
            { s: 'MIATK', d: 'MIA TEKNOLOJI' },
            { s: 'ODAS', d: 'ODAS ELEKTRIK' },
            { s: 'OYAKC', d: 'OYAK CIMENTO' },
            { s: 'PETKIM', d: 'PETKIM PETROKIMYA HOLDING' },
            { s: 'PGSUS', d: 'PEGASUS HAVA TASIMACILIGI' },
            { s: 'SASA', d: 'SASA POLYESTER' },
            { s: 'SKBNK', d: 'SEKERBANK' },
            { s: 'SOKM', d: 'SOK MARKETLER TICARET' },
            { s: 'TAVHL', d: 'TAV HAVALIMANLARI HOLDING' },
            { s: 'TCELL', d: 'TURKCELL ILETISIM HIZMETLERI' },
            { s: 'TOASO', d: 'TOFAS TURK OTOMOBIL FABRIKASI' },
            { s: 'TSKB', d: 'TURKIYE SINAI KALKINMA BANKASI' },
            { s: 'TTKOM', d: 'TURK TELEKOMUNIKASYON' },
            { s: 'ULKER', d: 'ULKER BISKUVI SANAYI' },
            { s: 'VESTL', d: 'VESTEL ELEKTRONIK SANAYI VE TICARET' },
            { s: 'YEOTK', d: 'YEO TEKNOLOJI ENERJI VE ENDUSTRI' }
        ];

        const qUpper = query.toUpperCase();
        const localMatches = COMMON_STOCKS
            .filter(item => item.s.includes(qUpper) || item.d.includes(qUpper))
            .map(item => ({
                symbol: item.s,
                description: item.d,
                market: 'BIST' as 'BIST'
            }));

        if (localMatches.length > 0) return localMatches;

        // Fallback to DB (If seeded)
        /*
        try {
            const results = await prisma.bistSymbol.findMany({
                where: { OR: [{ code: { contains: qUpper } }, { title: { contains: qUpper } }], isActive: true },
                take: 10
            });
            if (results.length > 0) return results.map(r => ({ symbol: r.code, description: r.title, market: 'BIST' }));
        } catch (e) { console.error(e); }
        */

        try {
            // Fallback to Yahoo API
            const response = await axios.get(`https://query2.finance.yahoo.com/v1/finance/search`, {
                params: {
                    q: query,
                    quotesCount: 10,
                    newsCount: 0,
                    enableFuzzyQuery: true
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*'
                }
            });

            return response.data.quotes
                .filter((q: any) =>
                    q.exchange === 'IST' ||
                    q.exchange === 'ISE' ||
                    q.exchange === 'Istanbul' ||
                    q.symbol.endsWith('.IS')
                )
                .map((q: any) => ({
                    symbol: q.symbol.replace('.IS', ''), // Clean symbol
                    description: q.longname || q.shortname || q.symbol,
                    market: 'BIST'
                }));

        } catch (error: any) {
            console.error("BIST search error", error);
            // Return error as a result to make it visible to user
            return [{
                symbol: 'HATA',
                description: `Arama başarısız: ${error.message}`,
                market: 'BIST'
            }];
        }
    }
}
