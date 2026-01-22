
import { YahooProvider } from '../src/services/market/yahoo';

const yahoo = new YahooProvider();

async function check() {
    const symbol = 'THYAO.IS';
    console.log(`Fetching news for ${symbol}...`);
    try {
        const news = await yahoo.getNews(symbol);
        console.log(`Found ${news.length} items.`);
        news.forEach((n, i) => {
            console.log(`\n--- Item ${i + 1} ---`);
            console.log(`Title: ${n.title}`);
            console.log(`Link: ${n.link}`);
            console.log(`Time: ${new Date(n.providerPublishTime).toISOString()}`); // Check if it matches Yahoo's typical seconds timestamp
            console.log(`Type: ${n.type}`);
        });
    } catch (e) {
        console.error(e);
    }
}

check();
