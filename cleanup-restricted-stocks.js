
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
    console.log('--- Database Cleanup Start ---');

    // Find all restricted stocks where code contains a space or newline
    // These are the "dirty" records from previous scraper versions
    const dirtyStocks = await prisma.restrictedStock.findMany({
        where: {
            OR: [
                { code: { contains: ' ' } },
                { code: { contains: '\n' } }
            ]
        }
    });

    console.log(`Found ${dirtyStocks.length} dirty records.`);

    if (dirtyStocks.length > 0) {
        const idsToDelete = dirtyStocks.map(s => s.id);
        const deleteResult = await prisma.restrictedStock.deleteMany({
            where: {
                id: { in: idsToDelete }
            }
        });
        console.log(`Deleted ${deleteResult.count} local dirty records.`);
    }

    // Also check for duplicates (same code and same startDate)
    // This might happen if multiple syncs ran with different logic
    const allStocks = await prisma.restrictedStock.findMany({
        orderBy: { updatedAt: 'desc' }
    });

    const seen = new Set();
    const duplicatesToDelete = [];

    for (const stock of allStocks) {
        const key = `${stock.code}-${stock.startDate}`;
        if (seen.has(key)) {
            duplicatesToDelete.push(stock.id);
        } else {
            seen.add(key);
        }
    }

    console.log(`Found ${duplicatesToDelete.length} duplicate records.`);

    if (duplicatesToDelete.length > 0) {
        const deleteResult = await prisma.restrictedStock.deleteMany({
            where: {
                id: { in: duplicatesToDelete }
            }
        });
        console.log(`Deleted ${deleteResult.count} duplicate records.`);
    }

    console.log('--- Database Cleanup End ---');
}

cleanup()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
