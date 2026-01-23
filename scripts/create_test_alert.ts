
import { PrismaClient } from '@prisma/client';
import { MarketService } from '../src/services/market/index';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createTestAlert() {
    try {
        // 1. Get or create a test user
        let user = await prisma.user.findFirst();
        if (!user) {
            console.log("Creating test user...");
            user = await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    password: 'hashed_password_placeholder',
                    name: 'Test User'
                }
            });
        }
        console.log(`Using user: ${user.email} (${user.id})`);

        // 2. Define a test symbol
        const symbol = 'THYAO'; // Turkish Airlines is usually active
        const market = 'BIST';

        // 3. Get current price to be sure what we are doing
        console.log(`Fetching current price for ${symbol}...`);
        const quote = await MarketService.getQuote(symbol, market);

        if (!quote || quote.price === undefined) {
            console.error("Could not fetch price. Aborting.");
            return;
        }
        const currentPrice = quote.price;
        console.log(`Current Price: ${currentPrice}`);

        // 4. Create an alert that SHOULD trigger immediately
        // Target = Current Price - 10 (PRICE_ABOVE) -> trigger
        const target = Math.max(0, currentPrice - 10);

        console.log(`Creating alert for ${symbol} > ${target}...`);

        const alert = await prisma.alert.create({
            data: {
                userId: user.id,
                symbol: symbol,
                market: market,
                type: 'PRICE_ABOVE',
                target: target,
                status: 'ACTIVE'
            }
        });

        console.log(`Alert created! ID: ${alert.id}`);
        console.log("Run the worker now to verify triggering.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestAlert();
