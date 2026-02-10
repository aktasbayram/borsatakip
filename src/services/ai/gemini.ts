import { ConfigService } from "@/services/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = async () => {
    return await ConfigService.get("GEMINI_API_KEY");
}

export const analyzeWithGemini = async (prompt: string) => {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let retries = 0;
    const maxRetries = 3;
    const baseDelay = 5000; // 5 seconds start

    while (retries <= maxRetries) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanText);
        } catch (error: any) {
            if (error.status === 429 || (error.message && error.message.includes('429'))) {
                retries++;
                if (retries > maxRetries) {
                    console.error("Gemini Rate Limit Exceeded after retries.");
                    break;
                }
                const waitTime = baseDelay * Math.pow(2, retries - 1);
                console.log(`Gemini Rate Limit (429). Retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                console.error("Gemini Analysis Error:", error);
                break;
            }
        }
    }
    return null;
};

export class GeminiService {
    async analyzeNews(symbol: string, newsTitle: string): Promise<{ sentiment: number; summary: string } | null> {
        const apiKey = await getApiKey();
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set!");
            return null;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Sen bir Borsa ve Finans Analistisin.
        Aşağıdaki haber başlığını analiz et ve bu haberin "${symbol}" hissesi üzerindeki olası etkisini puanla.

        Haber: "${newsTitle}"

        Çıktı Formatı (JSON olmalı):
        {
            "sentiment": <1 ile 10 arası puan, 1=Çok Olumsuz, 5=Nötr, 10=Çok Olumlu>,
            "summary": "<Haberi ve etkisini tek cümle ile özetle>"
        }
        
        Sadece JSON döndür. Markdown block kullanma.
        `;

        let retries = 0;
        const maxRetries = 3;
        const baseDelay = 5000; // 5 seconds start

        while (retries <= maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean markdown code blocks if present
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                return JSON.parse(cleanText);
            } catch (error: any) {
                if (error.status === 429 || (error.message && error.message.includes('429'))) {
                    retries++;
                    if (retries > maxRetries) {
                        console.error("Gemini Rate Limit Exceeded after retries.");
                        throw new Error("Gemini Rate Limit Exceeded after retries.");
                    }
                    const waitTime = baseDelay * Math.pow(2, retries - 1);
                    console.log(`Gemini Rate Limit (429). Retrying in ${waitTime / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    console.error("Gemini Analysis Error:", error);
                    throw error; // Throw to let the API route handle it
                }
            }
        }
        throw new Error("Failed to analyze news after retries");
    }

    async generateBlogPost(keyword: string): Promise<{
        title: string;
        excerpt: string;
        content: string;
        seoTitle: string;
        seoDescription: string;
        keywords: string;
        category: string;
        focusKeyword: string;
    } | null> {
        const apiKey = await getApiKey();
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set!");
            return null;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Sen bir SEO uzmanı ve içerik yazarı olarak hareket et. 
        Odak Anahtar Kelime: "${keyword}"

        Talimat: Aşağıdaki gerekliliklere göre kaliteli, özgün ve %100 SEO uyumlu bir makale yaz.
        
        Makale Gereklilikleri:
        - ODAK ANAHTAR KELİME: Makale başlığında (H1) ve ilk paragrafın içinde mutlaka geçmeli.
        - Başlık ve alt başlıklarla yapılandırılmış (H1, H2, H3) olmalı.
        - Giriş, gelişme ve sonuç bölümleri olmalı.
        - Okuyucunun ilgisini çeken, bilimsel veriler veya güvenilir kaynaklarla desteklenmiş olmalı.
        - 1000-1500 kelime arasında olmalı.
        - Listeler, tablolar veya önemli bilgileri vurgulayan bölümler içermeli.
        - Doğal, akıcı ve kullanıcı dostu bir dille basit ve anlaşılır şekilde yazılmış olmalı.
        - Konuyu detaylı bir şekilde ele almalı.

        SEO Gereklilikleri:
        - Anahtar kelime yoğunluğu %1-2 arasında olmalı.
        - META AÇIKLAMASI (seoDescription) Sınırı: 140 ile 155 karakter arasında olmalı. Kesinlikle 158 karakteri geçme. 
        - En az 3 farklı alt başlık (H2) ve her alt başlığın altında 1-2 alt kategori (H3) oluşturulmalı.
        - İçeriğe, konuyla alakalı görsellerin eklenebileceği açıklamalar yazılmalı.
        - Doğrudan okuyucuya hitap eden sorular sorarak onları yorum yapmaya teşvik etmeli.

        İstenen Çıktı Formatı (Saf JSON):
        {
            "title": "Odak anahtar kelimeyi içeren SEO uyumlu H1 Başlığı",
            "excerpt": "Kısa ve öz 140-155 karakter arası özet",
            "content": "Makale içeriği (HTML formatında: p, h2, h3, ul, li, strong, table, image_placeholders). İlk paragrafta odak anahtar kelime mutlaka geçsin.",
            "seoTitle": "SEO Başlığı (max 60 karakter)",
            "seoDescription": "Meta Açıklama (Tam olarak 140-155 karakter arası olmalı)",
            "keywords": "5-10 adet virgülle ayrılmış anahtar kelime",
            "focusKeyword": "${keyword}",
            "category": "Tek kelime kategori"
        }

        Kurallar:
        1. Dil Türkçe olsun.
        2. Sadece JSON döndür. Markdown bloğu (\`\`\`) kullanma.
        `;

        let retries = 0;
        const maxRetries = 3;
        const baseDelay = 5000;

        while (retries <= maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean markdown code blocks if present
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanText);

                // Programmatic Failsafe:
                // If it still exceeds 160 chars, truncate it nicely.
                const truncateTo160 = (str: string) => {
                    if (!str || str.length <= 160) return str;
                    return str.substring(0, 157) + "...";
                };

                if (parsed.seoDescription) parsed.seoDescription = truncateTo160(parsed.seoDescription);
                if (parsed.excerpt) parsed.excerpt = truncateTo160(parsed.excerpt);

                return parsed;
            } catch (error: any) {
                if (error.status === 429 || (error.message && error.message.includes('429'))) {
                    retries++;
                    if (retries > maxRetries) {
                        console.error("Gemini Rate Limit Exceeded after retries.");
                        throw new Error("Gemini Rate Limit Exceeded after retries.");
                    }
                    const waitTime = baseDelay * Math.pow(2, retries - 1);
                    console.log(`Gemini Rate Limit (429). Retrying in ${waitTime / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    console.error("Gemini Blog Generation Error:", error);
                    throw error; // Throw to let the API route handle it
                }
            }
        }
        throw new Error("Failed to generate blog post after retries");
    }
}
