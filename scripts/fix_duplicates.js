const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting deduplication...');

    // 1. Specific Fix for ATATURIZMI (Deleting the old draft)
    try {
        const atatr = await prisma.ipo.findFirst({ where: { code: 'ATATR' } });
        if (atatr) {
            const deleted = await prisma.ipo.deleteMany({
                where: {
                    code: 'ATATURIZMI'
                }
            });
            console.log(`Deleted ${deleted.count} records for ATATURIZMI because ATATR exists.`);
        }
    } catch (e) {
        console.error('Error deleting ATATURIZMI:', e);
    }

    // 2. Generic Deduplication by URL
    // Find groups of IPOs with the same URL
    const allIpos = await prisma.ipo.findMany();
    const urlMap = {};

    for (const ipo of allIpos) {
        if (!ipo.url) continue;
        if (!urlMap[ipo.url]) urlMap[ipo.url] = [];
        urlMap[ipo.url].push(ipo);
    }

    for (const url in urlMap) {
        const dups = urlMap[url];
        if (dups.length > 1) {
            console.log(`Found duplicates for URL ${url}: ${dups.map(d => d.code).join(', ')}`);

            // Sort: Prefer entries with valid dates first, then newer createdAt
            dups.sort((a, b) => {
                const aValidDate = a.date && !a.date.toLowerCase().includes('hazır');
                const bValidDate = b.date && !b.date.toLowerCase().includes('hazır');
                if (aValidDate !== bValidDate) return bValidDate ? 1 : -1;

                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            const toKeep = dups[0];
            const toDelete = dups.slice(1);

            console.log(`Keeping ${toKeep.code}, deleting: ${toDelete.map(d => d.code).join(', ')}`);

            for (const d of toDelete) {
                await prisma.ipo.delete({ where: { id: d.id } });
            }
        }
    }

    console.log('Deduplication complete.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
