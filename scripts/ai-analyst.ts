
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();
const parser = new Parser();

async function getSystemConfig(key: string): Promise<string | null> {
    const setting = await prisma.systemSetting.findUnique({
        where: { key }
    });
    return setting?.value || process.env[key] || null;
}

async function analyzeNews(text: string, apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Analyze the financial sentiment of this news title/summary.
    Text: "${text}"
    
    Return a JSON object:
    {
      "sentiment": number (0-10, where 0 is very negative, 5 neutral, 10 very positive),
      "summary": "1 sentence Turkish summary"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return { sentiment: 5, summary: "Analiz edilemedi." };
    } catch (e) {
        console.error("Gemini Error:", e);
        return { sentiment: 5, summary: "Hata oluştu." };
    }
}

async function main() {
    console.log("Starting AI Analyst...");

    const apiKey = await getSystemConfig("GEMINI_API_KEY");
    if (!apiKey) {
        console.error("No API Key found!");
        process.exit(1);
    }

    const feeds = [
        { url: 'https://finance.yahoo.com/rss/headline?s=THYAO.IS', symbol: 'THYAO', market: 'BIST' },
        { url: 'https://finance.yahoo.com/rss/headline?s=ASELS.IS', symbol: 'ASELS', market: 'BIST' },
        { url: 'https://finance.yahoo.com/rss/headline?s=GARAN.IS', symbol: 'GARAN', market: 'BIST' },
        { url: 'https://finance.yahoo.com/rss/headline?s=AAPL', symbol: 'AAPL', market: 'US' },
        { url: 'https://finance.yahoo.com/rss/headline?s=TSLA', symbol: 'TSLA', market: 'US' },
    ];

    let processedCount = 0;

    for (const feed of feeds) {
        try {
            const feedData = await parser.parseURL(feed.url);

            // Limit to top 2 news per symbol to save tokens/time
            for (const item of feedData.items.slice(0, 2)) {
                if (!item.title || !item.link) continue;

                // Check if exists
                const existing = await prisma.newsAnalysis.findUnique({
                    where: { url: item.link }
                });

                if (existing) {
                    console.log(`Skipping existing: ${item.title.substring(0, 20)}...`);
                    continue;
                }

                console.log(`Analyzing: ${item.title}`);
                const analysis = await analyzeNews(item.title + " " + (item.contentSnippet || ""), apiKey);

                await prisma.newsAnalysis.create({
                    data: {
                        symbol: feed.symbol,
                        market: feed.market,
                        url: item.link,
                        title: item.title,
                        sentiment: analysis.sentiment,
                        summary: analysis.summary,
                        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
                    }
                });
                processedCount++;
                // Small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            console.error(`Feed Error for ${feed.symbol}:`, e);
        }
    }

    console.log(`Analysis complete. Processed ${processedCount} new items.`);
    await prisma.$disconnect();
}

main();
