
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ API Key bulunamadı! .env dosyasını kontrol edin.");
        return;
    }

    console.log("🔑 API Key bulundu:", apiKey.substring(0, 5) + "...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        console.log("📡 Gemini API'ye istek gönderiliyor...");
        const result = await model.generateContent("Merhaba, sen kimsin?");
        const response = await result.response;
        const text = response.text();

        console.log("✅ Başarılı! Yanıt:");
        console.log(text);
    } catch (error) {
        console.error("❌ Hata oluştu:");
        console.error(error);
    }
}

run();
