
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserTier() {
    try {
        // Find the first user (assuming single user usage or just checking the main one)
        const user = await prisma.user.findFirst();
        console.log('User Tier:', user?.subscriptionTier);
        console.log('User Email:', user?.email);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserTier();
