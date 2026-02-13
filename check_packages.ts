
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const packages = await prisma.package.findMany();
    console.log('--- PACKAGES ---');
    console.log(JSON.stringify(packages, null, 2));

    const userCounts = await prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: {
            _all: true
        }
    });
    console.log('\n--- USER COUNTS BY subscriptionTier ---');
    console.log(JSON.stringify(userCounts, null, 2));

    // Also check if any users have 'ÜCRETSİZ' as their subscriptionTier string
    // though subscriptionTier is usually an enum or common string like 'FREE'
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
