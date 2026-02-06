import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating footer and symbol detail ads to be responsive...');

    const footerStyle = "width: 100%; height: 90px; background:linear-gradient(90deg, #1CB5E0, #000851); color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-weight: bold; font-size: 1.1rem; border-radius: 8px; box-shadow: 0 -4px 10px rgba(0,0,0,0.1);";

    const symbolStyle = "width: 100%; padding: 20px; background:linear-gradient(90deg, #4b6cb7, #182848); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;";

    try {
        // Update Footer Ad
        await prisma.adPlacement.update({
            where: { location: 'footer_top' },
            data: {
                adCode: `<div style="${footerStyle}">
          🌊 Footer (Sayfa Altı) Geniş Banner - 100% Genişlik
        </div>`
            }
        });
        console.log('Updated footer_top');

        // Update Symbol Detail Banner
        await prisma.adPlacement.update({
            where: { location: 'symbol_detail_banner' },
            data: {
                adCode: `<div style="${symbolStyle}">
          <h3 style="margin:0 0 5px 0; font-size: 1.2rem;">📈 Premium Analizleri Keşfet</h3>
          <p style="margin:0 0 15px 0; opacity: 0.8; font-size: 0.9rem;">Bu alan hisse grafiğinin hemen altında yer alır ve tüm genişliği kullanır.</p>
          <button style="padding: 8px 25px; background: white; color: #182848; border: none; border-radius: 20px; font-weight: bold; cursor: pointer;">Detaylı Bilgi</button>
        </div>`
            }
        });
        console.log('Updated symbol_detail_banner');

    } catch (error) {
        console.error('Error updating ads:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
