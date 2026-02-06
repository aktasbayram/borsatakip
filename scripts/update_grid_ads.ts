import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating grid ads to be responsive (100% width)...');

    const adStyle = "width: 100%; height: 100%; min-height: 250px; background:linear-gradient(135deg, #FF9966, #FF5E62); color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: bold; font-size: 1.2rem; text-align: center; padding: 20px; border-radius: 12px;";
    const adStyle2 = "width: 100%; height: 100%; min-height: 250px; background:linear-gradient(135deg, #F2994A, #F2C94C); color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: bold; font-size: 1.2rem; text-align: center; padding: 20px; border-radius: 12px;";

    try {
        // Update Dashboard Grid 1
        await prisma.adPlacement.update({
            where: { location: 'dashboard_grid_1' },
            data: {
                adCode: `<div style="${adStyle}">
          <h3>Sol Widget Reklamı</h3>
          <p style="font-size: 0.9rem; font-weight: normal; margin-top: 10px;">Bu alan kutuyu tamamen doldurur.</p>
        </div>`
            }
        });
        console.log('Updated dashboard_grid_1');

        // Update Dashboard Grid 2
        await prisma.adPlacement.update({
            where: { location: 'dashboard_grid_2' },
            data: {
                adCode: `<div style="${adStyle2}">
          <h3>Sağ Widget Reklamı</h3>
          <p style="font-size: 0.9rem; font-weight: normal; margin-top: 10px;">Responsive (Esnek) Yapı</p>
        </div>`
            }
        });
        console.log('Updated dashboard_grid_2');

    } catch (error) {
        console.error('Error updating ads:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
