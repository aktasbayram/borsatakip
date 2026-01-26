
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { ConfigService } from "@/services/config";
import { MarketService } from '@/services/market';
import { calculateRSI, calculateSMA } from '@/lib/indicators';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await ConfigService.get("GEMINI_API_KEY");
    if (!apiKey) {
        return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
    });

    try {
        const { messages, context } = await request.json();
        const userName = session?.user?.name || 'Yatırımcı';

        // Construct the full prompt history
        // Detect symbols in the last message
        const lastMessageContent = messages[messages.length - 1].content;
        const potentialSymbols = lastMessageContent.toUpperCase().match(/\b[A-Z]{3,5}\b/g) || [];

        let marketContext = context ? JSON.stringify(context) : '';

        if (potentialSymbols.length > 0) {
            // De-duplicate
            const uniqueSymbols = Array.from(new Set(potentialSymbols)) as string[];

            // Limit to first 2 to keep it fast
            for (const sym of uniqueSymbols.slice(0, 2)) {
                try {
                    // Try fetching BIST quote first (default)
                    // We assume BIST for simplicity or we could try to detect market
                    const quote = await MarketService.getQuote(sym, 'BIST');
                    if (quote && quote.price > 0) {
                        const candles = await MarketService.getCandles(sym, 'BIST', '1M'); // Last 30 days daily

                        marketContext += `\n\n[SYSTEM: LIVE DATA FOR ${sym}]\n`;
                        marketContext += `Price: ${quote.price} TRY, Change: %${quote.changePercent}\n`;
                        if (candles.length > 0) {
                            // Calculate Technical Indicators
                            const closes = candles.map((c: any) => c.close);
                            const highs = candles.map((c: any) => c.high);
                            const lows = candles.map((c: any) => c.low);
                            const times = candles.map((c: any) => c.timestamp);

                            // RSI
                            const rsiSeries = calculateRSI(closes, times, 14);
                            const latestRSI = rsiSeries.length > 0 ? rsiSeries[rsiSeries.length - 1].value.toFixed(2) : 'N/A';

                            // Moving Averages
                            const sma20 = calculateSMA(closes, 20)?.toFixed(2) || 'N/A';
                            const sma50 = calculateSMA(closes, 50)?.toFixed(2) || 'N/A';

                            // Pivot Points (Classic - based on last day)
                            const lastC = candles[candles.length - 1];
                            const P = (lastC.high + lastC.low + lastC.close) / 3;
                            const R1 = (2 * P) - lastC.low;
                            const S1 = (2 * P) - lastC.high;
                            const R2 = P + (lastC.high - lastC.low);
                            const S2 = P - (lastC.high - lastC.low);

                            marketContext += `\n[TECHNICAL INDICATORS]\n`;
                            marketContext += `RSI (14): ${latestRSI}\n`;
                            marketContext += `SMA (20): ${sma20}\n`;
                            marketContext += `SMA (50): ${sma50}\n`;
                            marketContext += `Pivot Point: ${P.toFixed(2)}\n`;
                            marketContext += `Resistance 1 (R1): ${R1.toFixed(2)}\n`;
                            marketContext += `Support 1 (S1): ${S1.toFixed(2)}\n`;
                            marketContext += `Resistance 2 (R2): ${R2.toFixed(2)}\n`;
                            marketContext += `Support 2 (S2): ${S2.toFixed(2)}\n`;
                            marketContext += `Last Close: ${lastC.close}, High: ${lastC.high}, Low: ${lastC.low}\n`;
                        }
                    }
                } catch (e) {
                    console.log(`Failed to fetch context for ${sym}`);
                }
            }
        }

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: `
Sen profesyonel, samimi ve yardımsever bir finansal asistansın.
Kullanıcının adı: ${userName}.
Kullanıcının dili: Türkçe.

Görevin:
1. Kullanıcının finans, borsa ve yatırımla ilgili sorularını yanıtlamak.
2. Analizler yaparken objektif olmak ve "Yatırım Tavsiyesi Değildir (YTD)" uyarısını gerektiğinde yapmak.
3. Kısa, net ve okunabilir (Markdown) cevaplar vermek.
4. Eğer kullanıcı bir hisse sorarsa, "Yatırım Tavsiyesi Değildir" uyarısıyla beraber [SYSTEM: LIVE DATA] verilerini kullanarak DETAYLI BİR TEKNİK ANALİZ raporu sun.
   - Pivot Noktası, Destekler (S1, S2) ve Dirençler (R1, R2) seviyelerini sayısal olarak belirt.
   - RSI ve Hareketli Ortalamalara (SMA) göre trendin yönünü yorumla.
   - Şablon olarak şunu kullan:
     "📊 Güncel Teknik Seviyeler (Fiyat: ...)"
     "Pivot Noktası: ..."
     "Destekler: ..."
     "Dirençler: ..."
     "📉 Teknik Görünüm Notları: ..."
5. SÜREKLİ MERHABA DEME. Konuşma devam ederken her cevapta ismimle hitap etmene gerek yok. Sadece ilk mesajda veya çok gerekliyse kullan.

Mevcut Piyasa/Kullanıcı Bağlamı:
${marketContext || 'Ekstra bağlam yok.'}
                    `}]
                },
                {
                    role: 'model',
                    parts: [{ text: `Anlaşıldı. ${userName} bey/hanım için finansal asistan olarak hazırım. Sorularınızı bekliyorum.` }]
                }
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // Get the last message from user
        const lastMessage = messages[messages.length - 1]; // Assuming messages array structure
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text });

    } catch (error: any) {
        console.error('Chat AI Error:', error);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }
}
