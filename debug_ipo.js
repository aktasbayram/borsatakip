const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ipos = await prisma.ipo.findMany({
        where: { code: { equals: 'BAYRAM', mode: 'insensitive' } }
    });
    console.log('BAYRAM IPO Records:', JSON.stringify(ipos, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
