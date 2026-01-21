
async function run() {
    try {
        const { default: yahooFinance } = await import('yahoo-finance2');

        console.log("📡 Yahoo Finance (Library) 'den GARAN.IS verisi isteniyor...");
        const symbol = 'GARAN.IS';

        // suppressNotices removed checks


        const quote = await yahooFinance.quote(symbol);

        console.log("✅ Yanıt Başarılı:");
        console.log(`Sembol: ${quote.symbol}`);
        console.log(`Fiyat: ${quote.regularMarketPrice} ${quote.currency}`);
        console.log(`Değişim: ${quote.regularMarketChangePercent}%`);

    } catch (error) {
        console.error("❌ Hata:", error.message);
        if (error.errors) {
            console.error("Detaylar:", JSON.stringify(error.errors, null, 2));
        }
    }
}

run();
