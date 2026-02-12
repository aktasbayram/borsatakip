import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const prisma = new PrismaClient();

import axios from 'axios';

// Helper to get quote (simplified version of MarketService for script)
async function getQuote(symbol: string, market: string = 'BIST'): Promise<number | null> {
    try {
        if (market === 'BIST') {
            const s = symbol.endsWith('.IS') ? symbol : `${symbol}.IS`;
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${s}?interval=1d&range=1d`;
            const res = await axios.get(url);
            const price = res.data.chart.result[0].meta.regularMarketPrice;
            console.log(`Fetched price for ${symbol}: ${price}`);
            return price;
        } else {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
            const res = await axios.get(url);
            const price = res.data.chart.result[0].meta.regularMarketPrice;
            console.log(`Fetched price for ${symbol}: ${price}`);
            return price;
        }
    } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error instanceof Error ? error.message : error);
        return null;
    }
}

async function main() {
    console.log('Checking active alerts...');
    const alerts = await prisma.alert.findMany({
        where: { status: 'ACTIVE' },
        include: {
            user: {
                include: { notificationSettings: true }
            }
        }
    });

    console.log(`Found ${alerts.length} active alerts.`);
    for (const alert of alerts) {
        console.log('---------------------------------------------------');
        console.log(`Symbol: ${alert.symbol}`);
        console.log(`Target: ${alert.target}`);
        console.log(`Type: ${alert.type}`);

        const currentPrice = await getQuote(alert.symbol, alert.market);

        if (currentPrice !== null) {
            let triggered = false;
            if (alert.type === 'PRICE_ABOVE' && currentPrice >= alert.target) triggered = true;
            else if (alert.type === 'PRICE_BELOW' && currentPrice <= alert.target) triggered = true;

            console.log(`Trigger Status: ${triggered ? '✅ WOULD TRIGGER' : '❌ WOULD NOT TRIGGER'}`);
            if (triggered) {
                console.log(`Condition met: ${currentPrice} is ${alert.type} ${alert.target}`);
            } else {
                console.log(`Condition NOT met: ${currentPrice} is NOT ${alert.type} ${alert.target}`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
