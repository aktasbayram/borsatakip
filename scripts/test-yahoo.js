
const axios = require('axios');

async function run() {
    console.log("📡 Yahoo Finance'den GARAN.IS verisi isteniyor...");
    const symbol = 'GARAN.IS';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

    try {
        const response = await axios.get(url, {
            params: { interval: '1m', range: '1d' },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const result = response.data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        const items = quote.close;
        const price = items[items.length - 1] || meta.regularMarketPrice;

        console.log("✅ Yanıt Başarılı:");
        console.log(`Sembol: ${meta.symbol}`);
        console.log(`Fiyat: ${price} ${meta.currency}`);
        console.log(`Sonraki işlem saati: ${new Date(meta.regularMarketTime * 1000).toLocaleString()}`);

    } catch (error) {
        console.error("❌ Hata:", error.response ? error.response.status + ' ' + error.response.statusText : error.message);
        if (error.response && error.response.data) {
            console.log('Hata Detayı:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

run();
