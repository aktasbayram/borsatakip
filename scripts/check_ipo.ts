import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for ATATR in DB...');
    const ipo = await prisma.ipo.findFirst({
        where: { code: 'ATATR' }
    });

    if (ipo) {
        console.log('Found ATATR:', JSON.stringify(ipo, null, 2));
    } else {
        console.log('ATATR NOT FOUND in DB.');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
