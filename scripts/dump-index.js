
const axios = require('axios');
const fs = require('fs');

async function run() {
    const url = 'https://www.google.com/finance/quote/XU100:INDEXBIST';
    console.log(`Dumping ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        fs.writeFileSync('index_dump.html', response.data);
        console.log('Saved to index_dump.html');

    } catch (error) {
        console.error(error.message);
    }
}

run();
