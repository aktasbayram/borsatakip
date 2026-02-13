
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateProPackage() {
    try {
        const proPackage = await prisma.package.findUnique({
            where: { name: 'PRO' },
        });

        if (!proPackage) {
            console.log('PRO package not found. Creating it...');
            // Logic to create if not exists, but usually seeded
            return;
        }

        const currentFeatures = proPackage.features || [];
        if (!currentFeatures.includes('SMS Bildirimleri')) {
            const updatedFeatures = [...currentFeatures, 'SMS Bildirimleri'];
            await prisma.package.update({
                where: { name: 'PRO' },
                data: { features: updatedFeatures },
            });
            console.log('Added "SMS Bildirimleri" to PRO package.');
        } else {
            console.log('"SMS Bildirimleri" already exists in PRO package.');
        }

    } catch (error) {
        console.error('Error updating package:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateProPackage();
