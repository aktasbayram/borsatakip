
import Parser from 'rss-parser';

interface NewsItem {
    title: string;
    link: string;
    pubDate: Date;
    summary?: string;
    source?: string;
}

export class GoogleNewsProvider {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
    }

    async getNews(symbol: string, market: 'BIST' | 'US' = 'US'): Promise<NewsItem[]> {
        try {
            // Remove .IS suffix for search query to be cleaner
            const cleanSymbol = symbol.replace('.IS', '');

            // Construct query based on market
            // For BIST: "SYMBOL hisse" or "SYMBOL borsa" works well
            const query = market === 'BIST'
                ? `${cleanSymbol} hisse`
                : `${cleanSymbol} stock`;

            const hl = market === 'BIST' ? 'tr-TR' : 'en-US';
            const gl = market === 'BIST' ? 'TR' : 'US';
            const ceid = market === 'BIST' ? 'TR:tr' : 'US:en';

            const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

            console.log(`Fetching Google News RSS for ${symbol} (${market}): ${url}`);

            const feed = await this.parser.parseURL(url);

            if (!feed.items) return [];

            return feed.items.map(item => ({
                title: item.title || '',
                link: item.link || '',
                pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                summary: item.contentSnippet,
                source: item.source,
                id: item.guid || item.link || Math.random().toString(36).substr(2, 9)
            }));

        } catch (error) {
            console.error(`Error fetching Google News for ${symbol}:`, error);
            return [];
        }
    }
}
