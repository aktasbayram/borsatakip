const axios = require('axios');
const cheerio = require('cheerio');

const symbols = [
    { s: 'XU100:INDEXBIST', name: 'BIST 100 (Current)' },
    { s: 'XU100:IST', name: 'BIST 100 (Alt)' },
    { s: 'USDTRY', name: 'USDTRY (Current)' },
    { s: 'USD-TRY', name: 'USD-TRY (Hypothesis)' }
];

async function run() {
    for (const item of symbols) {
        const url = `https://www.google.com/finance/quote/${item.s}`;
        console.log(`\n📡 Testing ${item.name} (${url})...`);

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });

            const $ = cheerio.load(response.data);
            const title = $('title').text();
            console.log(`Page Title: ${title}`);

            const priceText = $('.YMlKec.fxKbKc').first().text();
            console.log(`Price Text: '${priceText}'`);

            if (priceText) {
                console.log(`✅ SUCCESS for ${item.s}`);
            } else {
                console.log(`❌ FAIL for ${item.s}`);
            }

        } catch (error) {
            console.error(`❌ Error for ${item.name} (${error.response ? error.response.status : error.message})`);
        }
    }
}

run();
