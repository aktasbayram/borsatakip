import { NextResponse } from 'next/server';
import { GoogleNewsProvider } from '@/services/market/google-news';
import { YahooProvider } from '@/services/market/yahoo';

const googleNews = new GoogleNewsProvider();
const yahoo = new YahooProvider();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const symbol = searchParams.get('symbol');
    const market = (searchParams.get('market') as 'BIST' | 'US') || 'BIST';

    try {
        let newsItems = [];

        if (symbol) {
            // Priority to Yahoo for specific symbol news as it links to financial data often
            // But Google News is also good. Let's try Google News with symbol first as it's our main provider here.
            // Actually, Yahoo's getNews might be better for specific tickers.
            // Let's stick to GoogleNewsProvider for consistency based on previous plan mostly.
            // But the plan said "If symbol is provided, use YahooProvider".
            newsItems = await yahoo.getNews(symbol);
            if (newsItems.length === 0) {
                newsItems = await googleNews.getNews(symbol, market);
            }
        } else if (query) {
            newsItems = await googleNews.getNews(query, market);
        } else {
            // Default feed
            const defaultQuery = market === 'BIST' ? 'Borsa İstanbul ekonomi' : 'Stock market economy';
            newsItems = await googleNews.getNews(defaultQuery, market);
        }

        return NextResponse.json(newsItems);
    } catch (error: any) {
        console.error('News API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch news', details: error.message }, { status: 500 });
    }
}
