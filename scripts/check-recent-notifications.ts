import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotifications() {
    try {
        // Get the most recent 5 notifications
        const notifications = await prisma.notification.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });

        console.log('\n=== Recent Notifications ===\n');
        notifications.forEach(n => {
            console.log(`ID: ${n.id}`);
            console.log(`User: ${n.user.email}`);
            console.log(`Title: ${n.title}`);
            console.log(`Message: ${n.message}`);
            console.log(`Type: ${n.type}`);
            console.log(`sendBrowser: ${n.sendBrowser}`);
            console.log(`sendInApp: ${n.sendInApp}`);
            console.log(`read: ${n.read}`);
            console.log(`Created: ${n.createdAt}`);
            console.log('---\n');
        });

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

checkNotifications();
