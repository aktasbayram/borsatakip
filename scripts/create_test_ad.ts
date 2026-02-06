
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating test ad...');

    const adData = {
        label: 'Dashboard Test Ad',
        location: 'dashboard_grid_1',
        adCode: `<div style="background:linear-gradient(45deg, #FF6B6B, #4ECDC4); padding: 20px; color: white; border-radius: 8px; text-align: center; font-family: sans-serif;">
          <b>Test Reklam Alanı</b><br/>Bu alan otomatik olarak oluşturuldu.
      </div>`,
        platform: 'ALL',
        isActive: true,
    };

    try {
        const ad = await prisma.adPlacement.upsert({
            where: { location: 'dashboard_grid_1' },
            update: adData,
            create: adData,
        });
        console.log('Success! Test ad created/updated:', ad);
    } catch (error) {
        console.error('Error creating ad:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
