import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating dashboard_header_full test ad...');

    const adData = {
        label: 'Dashboard Header Full',
        location: 'dashboard_header_full',
        adCode: `<div style="background:linear-gradient(90deg, #e74c3c, #c0392b); width: 100%; height: 90px; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 20px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          🔥 ÖZEL REKLAM ALANI (970x90 / Responsive) 🔥
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
