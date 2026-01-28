
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateTiers() {
    try {
        // Migrate PRO_100 -> PRO
        const updatePro = await prisma.user.updateMany({
            where: { subscriptionTier: 'PRO_100' },
            data: { subscriptionTier: 'PRO' }
        });
        console.log(`Updated ${updatePro.count} users from PRO_100 to PRO`);

        // Migrate BASIC_50 -> BASIC
        const updateBasic = await prisma.user.updateMany({
            where: { subscriptionTier: 'BASIC_50' },
            data: { subscriptionTier: 'BASIC' }
        });
        console.log(`Updated ${updateBasic.count} users from BASIC_50 to BASIC`);

    } catch (error) {
        console.error('Error migrating tiers:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateTiers();
