
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating additional test ads...');

    const ads = [
        {
            label: 'Footer Test Ad',
            location: 'footer_top',
            adCode: `<div style="background:linear-gradient(90deg, #2c3e50, #3498db); padding: 15px; color: white; border-radius: 8px; text-align: center; font-family: sans-serif; margin-bottom: 20px;">
          <b>Footer Reklam Alanı</b><br/>Bu alan sayfa altında görünür.
      </div>`,
            platform: 'ALL',
            isActive: true,
        },
        {
            label: 'Mobile Menu Ad',
            location: 'mobile_menu_bottom',
            adCode: `<div style="background:linear-gradient(to right, #8e44ad, #c0392b); padding: 10px; color: white; border-radius: 6px; text-align: center; font-family: sans-serif; margin-top: 10px;">
            <b>Mobil Menü Reklamı</b><br/>Menünün en altında çıkar.
        </div>`,
            platform: 'MOBILE',
            isActive: true,
        }
    ];

    for (const adData of ads) {
        try {
            const ad = await prisma.adPlacement.upsert({
                where: { location: adData.location },
                update: adData,
                create: adData,
            });
            console.log(`Success! Created/Updated: ${ad.label}`);
        } catch (error) {
            console.error(`Error creating ${adData.label}:`, error);
        }
    }

    try {
        await prisma.$disconnect();
    } catch (e) { }
}

main();
