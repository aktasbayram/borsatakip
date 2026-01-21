
const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
    const url = 'https://www.bloomberght.com/borsa/endeks/bist-100';
    console.log(`Fetching ${url} from Bloomberg HT...`);

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);

        // Inspect Bloomberg HT structure
        // Usually .LastPrice or .data-info

        // Example: <span data-type="son_fiyat" class="value">9.639,77</span>
        let price = $('[data-type="son_fiyat"]').first().text();

        if (!price) {
            // Fallback
            price = $('.value').first().text();
        }

        console.log(`Bloomberg Price: ${price}`);
        console.log(`Page Title: ${$('title').text()}`);

    } catch (error) {
        console.error(error.message);
    }
}

run();
