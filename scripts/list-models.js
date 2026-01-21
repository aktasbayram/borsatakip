
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ API Key bulunamadı!");
        return;
    }

    // API Key'in ilk 5 ve son 5 karakterini göster
    console.log("🔑 API Key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5));

    try {
        // List models using direct fetch because SDK might abstract it
        // But let's verify connectivity first.

        // Using fetch directly to list models to bypass SDK helper if needed, 
        // but SDK has no direct listModels method on the main class easily in v1beta?
        // Wait, the SDK doesn't have a simple listModels method exposed on the client object in some versions.
        // Let's use fetch directly to be sure.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        console.log("📡 Modellere erişiliyor:", url.replace(apiKey, 'HIDDEN_KEY'));

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Hatası:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("✅ Erişilebilir Modeller:");
            if (data.models) {
                data.models.forEach(m => {
                    if (m.name.includes('gemini')) {
                        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                    }
                });
            } else {
                console.log("⚠️ Hiç model bulunamadı. JSON:", data);
            }
        }

    } catch (error) {
        console.error("❌ Bağlantı hatası:", error);
    }
}

run();
