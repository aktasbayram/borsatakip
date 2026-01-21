
const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
    const url = 'https://bigpara.hurriyet.com.tr/borsa/hisse-fiyatlari/bist-100-endeksi-fiyati-xu100-detay/';
    console.log(`Fetching ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const $ = cheerio.load(response.data);

        // Bigpara detail page
        // Price usually in .price-container .value or similar
        // Try to find the price text directly

        let price = $('span.text-xl.font-bold').first().text(); // Modern tailwind classes if they use them?

        if (!price) {
            // Classic classes
            price = $('.kurBox .value').text();
        }

        if (!price) {
            // Search by content context
            // "Son Fiyat" label?
            console.log("Searching generic containers...");
            price = $('.fu-price').text();
        }

        console.log(`Bigpara Price: '${price.trim()}'`);
        console.log(`Page Title: ${$('title').text()}`);

    } catch (error) {
        console.error(error.message);
    }
}

run();
