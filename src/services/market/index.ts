import { FinnhubProvider } from './finnhub';
import { YahooProvider } from './yahoo';
import { MarketDataProvider } from './provider';

const finnhub = new FinnhubProvider();
const yahoo = new YahooProvider();

export function getMarketProvider(market: 'BIST' | 'US'): MarketDataProvider {
    if (market === 'BIST') {
        return yahoo;
    }
    return finnhub; // US as default for others
}

export const MarketService = {
    getQuote: (symbol: string, market: 'BIST' | 'US') => getMarketProvider(market).getQuote(symbol),
    getQuotes: (symbols: string[], market: 'BIST' | 'US' = 'BIST') => getMarketProvider(market).getQuotes(symbols),
    getCandles: (symbol: string, market: 'BIST' | 'US', range: any, interval?: string) => getMarketProvider(market).getCandles(symbol, range, interval),
    search: async (query: string, market: 'BIST' | 'US') => getMarketProvider(market).search(query)
};
