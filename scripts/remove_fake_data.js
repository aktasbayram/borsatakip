
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
    const deleted = await prisma.newsAnalysis.deleteMany({
        where: {
            market: 'BIST',
            url: { contains: 'example.com' }
        }
    });
    console.log(`Deleted ${deleted.count} fake BIST records.`);
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
