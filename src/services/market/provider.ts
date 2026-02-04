export interface MarketQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    currency: string;
    market: 'BIST' | 'US';
    timestamp: number;
    name?: string;
}

export interface MarketCandle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface SymbolSearchResult {
    symbol: string;
    description: string;
    market: 'BIST' | 'US';
    type?: string;
}

export interface MarketDataProvider {
    getQuote(symbol: string): Promise<MarketQuote>;
    getQuotes(symbols: string[]): Promise<MarketQuote[]>;
    getCandles(symbol: string, range: '1D' | '1W' | '1M' | '3M' | '1Y', interval?: string): Promise<MarketCandle[]>;
    search(query: string): Promise<SymbolSearchResult[]>;
}
