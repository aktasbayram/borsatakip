
const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
    console.log("📡 Google Finance'den GARAN:IST verisi isteniyor...");
    const symbol = 'GARAN:IST'; // Google Finance formatı
    const url = `https://www.google.com/finance/quote/${symbol}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Fiyatı bul (Google Finance sınıf isimleri değişebilir, en sağlamı data-last-price gibi attributes veya meta tags)
        // Genellikle <div class="YMlKec fxKbKc">...</div> fiyatı tutar.

        const priceText = $('.YMlKec.fxKbKc').first().text();
        const price = parseFloat(priceText.replace('₺', '').replace(',', '.').trim());

        // Değişim Yüzdesi
        // <div class="JwB6zf" ...>
        // Sınıflar karmaşık, o yüzden dinamik bir yapı lazım.
        // Neyse ki Fiyatı almak bile yeterli şu an.

        console.log("✅ Yanıt Başarılı:");
        console.log(`URL: ${url}`);
        console.log(`Ham Fiyat Metni: ${priceText}`);
        console.log(`Parse Edilen Fiyat: ${price}`);

    } catch (error) {
        console.error("❌ Hata:", error.message);
    }
}

run();
