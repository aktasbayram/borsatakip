
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { ConfigService } from "@/services/config";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await ConfigService.get("GEMINI_API_KEY");
    if (!apiKey) {
        return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    // Initialize Gemini dynamically
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
    });

    try {
        const { type, data } = await request.json();
        const userName = session?.user?.name || 'Yatırımcı';

        let prompt = '';

        if (type === 'STOCK') {
            prompt = `
            Sen uzman bir finansal analistsin.
            Kullanıcının Adı: ${userName}
            
            Aşağıdaki borsa verilerine dayanarak kullanıcıya kısa, net ve profesyonel bir yorum yap.
            Yatırım tavsiyesi vermeden (YTD), teknik ve temel göstergeleri yorumla.
            
            Hisse: ${data.symbol} (${data.market})
            Fiyat: ${data.price}
            Değişim: %${data.change}
            Grafik Özeti (Son mumlar): ${JSON.stringify(data.candles?.slice(-5))}
            
            Yanıtın Markdown formatında olsun. Aşağıdaki yapıyı kullan:

            # Sayın ${userName}, ${data.symbol} Analiziniz Hazır 📊
            
            ### 1. Fiyat Hareketi
            *Fiyat yönü ve değişim yorumu buraya*

            ### 2. Önemli Seviyeler
            *Destek ve direnç noktaları buraya*

            ### 3. Genel Görüş
            *Kısa özet (Pozitif/Negatif/Nötr) buraya*
            `;
        } else if (type === 'PORTFOLIO') {
            prompt = `
            Sen uzman bir portföy yöneticisisin.
            Kullanıcının Adı: ${userName}

            Aşağıdaki kullanıcı portföyünü analiz et.
            Risk dağılımı ve çeşitlilik açısından değerlendir.
            
            Portföy: ${data.name}
            Toplam Değer: ${data.totalValue}
            Varlıklar:
            ${JSON.stringify(data.items)}
            
            Yanıtın Markdown formatında olsun. Aşağıdaki yapıyı kullan:

            # Sayın ${userName}, Portföy Sağlık Raporunuz 🛡️
            
            ### 1. Çeşitlilik Durumu
            *Sektörel ve varlık bazlı dağılım yorumu*

            ### 2. Risk Analizi
            *Mevcut risk seviyesi değerlendirmesi*

            ### 3. Öneriler
            *Kısa ve uygulanabilir strateji önerileri*
            `;
        } else {
            return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
        }

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ analysis: text });

    } catch (error) {
        console.error('AI Analysis Error Detailed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json({ error: 'Failed to generate analysis: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
    }
}
