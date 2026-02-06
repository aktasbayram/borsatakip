import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating symbol_detail_banner test ad...');

    const adData = {
        label: 'Symbol Detail Banner',
        location: 'symbol_detail_banner',
        adCode: `<div style="background:linear-gradient(90deg, #3498db, #8e44ad); padding: 25px; color: white; border-radius: 12px; text-align: center; font-family: sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h3 style="margin:0 0 10px 0;">Premium Borsa Analizleri</h3>
          <p style="margin:0;">Bu alan hisse detay sayfasında grafik altına yerleştirilmiştir.</p>
          <button style="margin-top:15px; padding: 8px 20px; background: white; color: #3498db; border: none; border-radius: 20px; font-weight: bold; cursor: pointer;">Hemen İncele</button>
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
