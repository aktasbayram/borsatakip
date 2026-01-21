
const axios = require('axios');
require('dotenv').config();

async function run() {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
        console.error("❌ Finnhub API Key bulunamadı!");
        return;
    }

    console.log("🔑 API Key:", apiKey.substring(0, 5) + "...");

    try {
        // Test with GARAN (BIST)
        console.log("📡 Finnhub'dan GARAN.IS verisi isteniyor...");
        const url = `https://finnhub.io/api/v1/quote?symbol=GARAN.IS&token=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        console.log("✅ Yanıt:", data);

        if (data.c === 0 && data.d === null) {
            console.warn("⚠️ Veri boş gibi görünüyor (Tüm değerler 0 veya null). API Key limiti dolmuş olabilir.");
        } else {
            console.log(`💰 Fiyat: ${data.c}, Değişim: ${data.dp}%`);
        }

    } catch (error) {
        console.error("❌ Hata:", error.response ? error.response.data : error.message);
    }
}

run();
