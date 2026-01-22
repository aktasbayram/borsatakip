
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const items = await prisma.newsAnalysis.findMany({
        select: { symbol: true, market: true, title: true },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    console.log(JSON.stringify(items, null, 2));
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
