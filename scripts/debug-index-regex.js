
const axios = require('axios');

async function run() {
    // Normal browser User-Agent
    const url = 'https://www.google.com/finance/quote/XU100:INDEXBIST';
    console.log(`Fetching ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const data = response.data;
        const index = data.indexOf('BIST 100');

        if (index !== -1) {
            console.log('Found "BIST 100". Context around it:');
            // Show 200 chars before and 1000 chars after
            console.log(data.substring(index - 200, index + 1000));
        } else {
            console.log('"BIST 100" string not found in response!');
        }

        // Search for current value pattern (e.g. 9000-11000 range)
        // regex for 9,xxx.xx or 9.xxx,xx or 10,xxx.xx
        const regex = /([9|1][0-9][,.][0-9]{3}[,.][0-9]{2})/g;
        const matches = data.match(regex);
        if (matches) {
            console.log("Potential price matches found:", matches.slice(0, 10)); // Top 10
        }

    } catch (error) {
        console.error(error.message);
    }
}

run();
