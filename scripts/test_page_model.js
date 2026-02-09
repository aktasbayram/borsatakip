const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing Page model access...');
        const pages = await prisma.page.findMany();
        console.log('Successfully fetched pages:', pages.length);
        console.log('Pages:', pages);
    } catch (e) {
        console.error('Error accessing Page model:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
