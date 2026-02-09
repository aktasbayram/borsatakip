
import { IpoService } from '../src/services/market/ipo-service';
import { db } from '../src/lib/db';

async function main() {
    console.log('Running IPO Sync...');
    try {
        const result = await IpoService.syncIpos();
        console.log('Sync Result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Sync failed:', e);
    } finally {
        await db.$disconnect();
    }
}

main();
