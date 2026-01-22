
import { prisma } from '../src/lib/db';
require('dotenv').config();
import { YahooProvider } from '../src/services/market/yahoo';
import { GeminiService } from '../src/services/ai/gemini';

const yahoo = new YahooProvider();
const gemini = new GeminiService();

async function runBistTest() {
    const symbol = 'THYAO';
    const market = 'BIST';
    console.log(`🤖 Testing BIST Analysis for ${symbol}...`);

    // Force .IS suffix for search
    const searchSymbol = `${symbol}.IS`;
    console.log(`Fetching news for ${searchSymbol}...`);
    const newsItems = await yahoo.getNews(searchSymbol);

    if (newsItems.length > 0) {
        const news = newsItems[0];
        console.log(`Found news: ${news.title}`);

        const analysis = await gemini.analyzeNews(symbol, news.title);

        if (analysis) {
            const result = await prisma.newsAnalysis.create({
                data: {
                    symbol: symbol,
                    url: news.link,
                    title: news.title,
                    sentiment: analysis.sentiment,
                    summary: analysis.summary,
                    market: market,
                    publishedAt: new Date()
                }
            });
            console.log("Saved BIST analysis:", result);
        }
    } else {
        console.log("No news found for THYAO.IS");
    }
}

runBistTest()
    .then(() => process.exit(0))
    .catch(e => { console.error(e); process.exit(1); });
