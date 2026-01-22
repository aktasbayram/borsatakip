import { PrismaClient } from '@prisma/client';
require('dotenv').config();
import { marketCache } from '../src/services/market/cache'; // Reuse cache if helpful (or not)
import { YahooProvider } from '../src/services/market/yahoo';
import { GoogleNewsProvider } from '../src/services/market/google-news';
import { GeminiService } from '../src/services/ai/gemini';
import { TelegramService } from '../src/lib/telegram';
import { EmailService } from '../src/lib/email';

// Services
const yahoo = new YahooProvider();
const googleNews = new GoogleNewsProvider();
const gemini = new GeminiService();
const prisma = new PrismaClient();

async function runAnalyst() {
    console.log("🤖 AI Analyst Starting...");

    // 1. Get unique symbols from all watchlists
    const watchlists = await prisma.watchlist.findMany({ include: { items: true, user: { include: { notificationSettings: true } } } });

    // Create a map of Symbol -> { users: User[], market: string }
    const symbolDataMap = new Map<string, { users: any[], market: string }>();

    watchlists.forEach(list => {
        list.items.forEach(item => {
            if (!symbolDataMap.has(item.symbol)) {
                symbolDataMap.set(item.symbol, { users: [], market: item.market || 'US' });
            }
            symbolDataMap.get(item.symbol)?.users.push(list.user);
        });
    });

    console.log(`Tracking ${symbolDataMap.size} unique symbols.`);

    // 2. Iterate and Analyze
    for (const [symbol, data] of symbolDataMap.entries()) {
        const { users, market } = data;
        // 2. Fetch News (Hybrid Approach)
        let newsItems = [];
        try {
            if (market === 'BIST') {
                console.log(`Fetching BIST news for ${symbol} via Google News...`);
                // Use Google News for Turkish stocks
                newsItems = await googleNews.getNews(symbol, 'BIST');
            } else {
                console.log(`Fetching US news for ${symbol} via Yahoo...`);
                // Use Yahoo for US stocks
                newsItems = await yahoo.getNews(symbol);
            }
        } catch (error) {
            console.error(`Error fetching news for ${symbol}:`, error);
            continue;
        }

        // Limit to top 3 most recent news items to avoid rate limits and long processing
        const recentNews = newsItems.slice(0, 3);

        for (const news of recentNews) {
            // Check if already analyzed
            const existing = await prisma.newsAnalysis.findUnique({
                where: { url: news.link }
            });

            if (existing) continue; // Skip

            // Artificial delay to respect rate limits (basic)
            await new Promise(resolve => setTimeout(resolve, 5000));

            let analysis;
            try {
                analysis = await gemini.analyzeNews(symbol, news.title);
            } catch (e) {
                console.error("Gemini failed, using fallback.");
            }

            // Fallback if AI fails or returns null
            if (!analysis) {
                console.log("Using fallback analysis for", news.title);
                analysis = {
                    sentiment: 5,
                    summary: "Yapay zeka servisi şu anda yoğun olduğu için otomatik analiz yapılamadı. Haberin detayları için başlığa tıklayarak kaynağa gidebilirsiniz."
                };
            }

            if (analysis) {
                // Save to DB
                await prisma.newsAnalysis.create({
                    data: {
                        symbol: symbol,
                        url: news.link,
                        title: news.title,
                        sentiment: analysis.sentiment,
                        summary: analysis.summary,
                        market: market, // Use the correct trusted market from watchlist
                        publishedAt: (() => {
                            const timestamp = news.providerPublishTime;
                            if (!timestamp) return new Date();
                            // If timestamp > 100 billion, assume milliseconds (year 5138+)
                            if (timestamp > 100000000000) {
                                return new Date(timestamp);
                            } else {
                                return new Date(timestamp * 1000);
                            }
                        })()
                    }
                });

                // Check for high impact
                if (analysis.sentiment <= 3 || analysis.sentiment >= 8) {
                    const impact = analysis.sentiment <= 3 ? "🔴 OLUMSUZ" : "🟢 OLUMLU";
                    const message = `
🤖 **Yapay Zeka Analisti**
Hisse: #${symbol}
Etki: ${impact} (${analysis.sentiment}/10)

📰 ${news.title}
💡 ${analysis.summary}

[Habere Git](${news.link})
                    `;

                    // Notify relevant users
                    for (const user of users) {
                        const settings = user.notificationSettings;
                        if (settings?.telegramEnabled && settings.telegramChatId) {
                            await TelegramService.sendMessage(settings.telegramChatId, message);
                        }
                    }
                    console.log(`Alert sent for ${symbol}`);
                }
            } else {
                // Analysis failed
            }

            // Artificial delay to respect rate limits (Free tier: ~2-4 RPM usually safe)
            await new Promise(r => setTimeout(r, 10000));
        }
    }

    console.log("Analysis cycle complete.");
}

// Run
runAnalyst()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
