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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    private model: any;

    constructor() {
        this.initializeModel();
    }

    private async initializeModel() {
        const apiKey = await getApiKey();
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set!");
        } else {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Upgrade to Pro model
            this.model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        }
    }

    async analyzeNews(symbol: string, newsTitle: string): Promise<{ sentiment: number; summary: string } | null> {
        if (!this.model) return null;

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
                const result = await this.model.generateContent(prompt);
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
    }
}
