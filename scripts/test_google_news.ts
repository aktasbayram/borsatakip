
import { GoogleNewsProvider } from '../src/services/market/google-news';

async function test() {
    const provider = new GoogleNewsProvider();
    const symbol = 'THYAO';
    console.log(`Testing Google News for ${symbol}...`);

    const news = await provider.getNews(symbol, 'BIST');
    console.log(`Found ${news.length} items.`);
    news.forEach((n, i) => {
        console.log(`\n${i + 1}. ${n.title}`);
        console.log(`   Link: ${n.link}`);
        console.log(`   Date: ${n.pubDate}`);
    });
}

test();
