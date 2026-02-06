
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating dashboard_grid_2 test ad...');

    const adData = {
        label: 'Dashboard Right Test Ad',
        location: 'dashboard_grid_2',
        adCode: `<div style="background:linear-gradient(135deg, #f39c12, #d35400); padding: 20px; color: white; border-radius: 8px; text-align: center; font-family: sans-serif;">
          <b>Sağ Widget Altı Reklam</b><br/>Bu alan sağ tarafta görünür.
      </div>`,
        platform: 'ALL',
        isActive: true,
    };

    try {
        const ad = await prisma.adPlacement.upsert({
            where: { location: adData.location },
            update: adData,
            create: adData,
        });
        console.log(`Success! Created/Updated: ${ad.label}`);
    } catch (error) {
        console.error(`Error creating ad:`, error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
