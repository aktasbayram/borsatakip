import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking all ad placements in database...\n');

    const ads = await prisma.adPlacement.findMany({
        orderBy: { createdAt: 'desc' }
    });

    if (ads.length === 0) {
        console.log('No ads found in database.');
    } else {
        ads.forEach((ad) => {
            console.log(`ID: ${ad.id}`);
            console.log(`Label: ${ad.label}`);
            console.log(`Location: ${ad.location}`);
            console.log(`isActive: ${ad.isActive} ${ad.isActive ? '✅' : '❌'}`);
            console.log(`Platform: ${ad.platform}`);
            console.log(`Updated: ${ad.updatedAt}`);
            console.log('---');
        });
    }

    await prisma.$disconnect();
}

main();
