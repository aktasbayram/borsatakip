
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const count = await prisma.newsAnalysis.count();
    const items = await prisma.newsAnalysis.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
    console.log(`Total Analysis Records: ${count}`);
    console.log(JSON.stringify(items, null, 2));
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
