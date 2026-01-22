
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    // Delete all analysis records to start fresh with correct market data
    const deleted = await prisma.newsAnalysis.deleteMany({});
    console.log(`Deleted ${deleted.count} records.`);
}

clean()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
