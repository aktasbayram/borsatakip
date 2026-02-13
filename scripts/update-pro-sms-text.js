
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const proPackage = await prisma.package.findUnique({
            where: { name: 'PRO' },
        });

        if (!proPackage) {
            console.log('PRO package not found');
            return;
        }

        let features = proPackage.features;

        // Replace "SMS Bildirimleri" with "50 SMS Bildirimi"
        features = features.map(f => f === 'SMS Bildirimleri' ? '50 SMS Bildirimi' : f);

        // Ensure it exists if it wasn't there
        if (!features.includes('50 SMS Bildirimi')) {
            // If we didn't replace it (maybe it wasn't there), add it? 
            // Or maybe it was already "50 SMS Bildirimi".
            // Let's just check if "SMS Bildirimleri" is gone and "50..." is there.
            if (!features.includes('50 SMS Bildirimi')) {
                features.push('50 SMS Bildirimi');
            }
        }

        await prisma.package.update({
            where: { name: 'PRO' },
            data: { features },
        });

        console.log('PRO package features updated successfully.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
