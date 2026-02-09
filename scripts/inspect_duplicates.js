const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for duplicates...');

    // Check specific known duplicates
    const atatr = await prisma.ipo.findFirst({ where: { code: 'ATATR' } });
    const ataturizmi = await prisma.ipo.findFirst({ where: { code: 'ATATURIZMI' } });

    console.log('ATATR:', atatr ? JSON.stringify(atatr, null, 2) : 'Not Found');
    console.log('ATATURIZMI:', ataturizmi ? JSON.stringify(ataturizmi, null, 2) : 'Not Found');

    // List all "New" or "Active" IPOs to see what's being returned
    const all = await prisma.ipo.findMany({
        where: {
            OR: [{ status: 'NEW' }, { status: 'ACTIVE' }, { isNew: true }]
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    console.log('Recent IPOs in DB:', all.map(i => `${i.code} - ${i.status} - ${i.date}`).join('\n'));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
