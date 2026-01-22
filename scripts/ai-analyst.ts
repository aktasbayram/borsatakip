
import { prisma } from '../src/lib/db';
require('dotenv').config();
import { marketCache } from '../src/services/market/cache'; // Reuse cache if helpful (or not)
import { YahooProvider } from '../src/services/market/yahoo';
import { GeminiService } from '../src/services/ai/gemini';
import { TelegramService } from '../src/lib/telegram';
import { EmailService } from '../src/lib/email';

const yahoo = new YahooProvider();
const gemini = new GeminiService();

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
        console.log(`Checking news for ${symbol} (${market})...`);

        // Use suffixed symbol for BIST to get local news
        const searchSymbol = market === 'BIST' ? `${symbol}.IS` : symbol;
        const newsItems = await yahoo.getNews(searchSymbol);

        if (!newsItems || newsItems.length === 0) continue;

        for (const news of newsItems) {
            // Check if already analyzed
            const existing = await prisma.newsAnalysis.findUnique({
                where: { url: news.link }
            });

            if (existing) continue; // Skip

            console.log(`Analyze: ${news.title}`);

            // Analyze with AI
            const analysis = await gemini.analyzeNews(symbol, news.title);

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
