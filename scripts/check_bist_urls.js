
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const items = await prisma.newsAnalysis.findMany({
        where: { market: 'BIST' },
        select: { id: true, title: true, url: true, createdAt: true }
    });
    console.log(JSON.stringify(items, null, 2));
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
