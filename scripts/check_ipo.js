const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for ATATR in DB...');
    try {
        const ipo = await prisma.ipo.findFirst({
            where: { code: 'ATATR' }
        });

        if (ipo) {
            console.log('Found ATATR:', JSON.stringify(ipo, null, 2));
        } else {
            console.log('ATATR NOT FOUND in DB.');
        }

        const count = await prisma.ipo.count();
        console.log(`Total IPOs in DB: ${count}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
