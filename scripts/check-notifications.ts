
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const prisma = new PrismaClient();

async function main() {
    console.log('Checking recent notifications...');
    const notifs = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(notifs);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
