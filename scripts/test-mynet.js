
const axios = require('axios');
const cheerio = require('cheerio');

const indices = [
    { url: 'https://finans.mynet.com/borsa/endeks/xu100-bist-100/', name: 'XU100' },
    { url: 'https://finans.mynet.com/borsa/endeks/xu030-bist-30/', name: 'XU030' }
];

async function run() {
    for (const item of indices) {
        console.log(`Fetching ${item.name} from Mynet...`);
        try {
            const response = await axios.get(item.url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(response.data);

            // Inspect Mynet structure
            // Usually internal 'my-text-h1' or dynamic?
            // Let's assume standard class or test common ones

            // Mynet usually puts price in:
            // .dynamic-price-XU100 (maybe dynamic loaded?)
            // Or simple h1/span

            // Let's look for specific semantic classes
            const price = $('span[dynamic-price]').first().text() ||
                $('.val').first().text() ||
                $('h1').next().text(); // dummy strategy

            // Better: find specific "son" value
            // View source logic:
            // <span dynamic-price="XU100" class="val">9.600,23</span>

            const dynamicPrice = $(`span[dynamic-price="${item.name}"]`).text();

            console.log(`Dynamic Price: ${dynamicPrice}`);

            // Try generic search for numbers if dynamic failing
            if (!dynamicPrice) {
                console.log("Searching generic classes...");
                console.log(".val: " + $('.val').first().text());
            }

        } catch (error) {
            console.error(error.message);
        }
    }
}

run();
