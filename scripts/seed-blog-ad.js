const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.adPlacement.upsert({
    where: { location: 'blog_feed_middle' },
    update: {
      label: 'Blog Akış İçi (Örnek)',
      adCode: `
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 16px; color: white; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);">
          <div style="flex: 1;">
            <span style="background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Sponsorlu Değerlendirme</span>
            <h3 style="font-size: 20px; font-weight: 900; margin-top: 10px; letter-spacing: -0.02em;">BorsaTakip PRO ile Bir Adım Önde Olun!</h3>
            <p style="font-size: 13px; opacity: 0.9; margin-top: 5px; font-weight: 500;">Derinlemesine analizler ve anlık sinyaller için hemen yükseltin.</p>
          </div>
          <a href="/upgrade" style="background: white; color: #1e40af; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 13px; text-decoration: none; text-transform: uppercase;">HEMEN İncele</a>
        </div>
      `,
      isActive: true,
      platform: 'ALL',
      maxWidth: '100%',
      maxHeight: '180px'
    },
    create: {
      label: 'Blog Akış İçi (Örnek)',
      location: 'blog_feed_middle',
      adCode: `
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 16px; color: white; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);">
          <div style="flex: 1;">
            <span style="background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Sponsorlu Değerlendirme</span>
            <h3 style="font-size: 20px; font-weight: 900; margin-top: 10px; letter-spacing: -0.02em;">BorsaTakip PRO ile Bir Adım Önde Olun!</h3>
            <p style="font-size: 13px; opacity: 0.9; margin-top: 5px; font-weight: 500;">Derinlemesine analizler ve anlık sinyaller için hemen yükseltin.</p>
          </div>
          <a href="/upgrade" style="background: white; color: #1e40af; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 13px; text-decoration: none; text-transform: uppercase;">HEMEN İncele</a>
        </div>
      `,
      isActive: true,
      platform: 'ALL',
      maxWidth: '100%',
      maxHeight: '180px'
    }
  });
  console.log('Sample blog feed ad inserted successfully');

  // 2. Sticky Sidebar Ad
  await prisma.adPlacement.upsert({
    where: { location: 'blog_sidebar_sticky' },
    update: {
      isActive: true,
      label: 'Blog Yan Panel (Yapışkan) - Örnek',
      adCode: `
          <div style="width: 100%; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-family: 'Inter', sans-serif; text-align: center; box-shadow: 0 10px 25px -5px rgba(118, 75, 162, 0.4);">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">
              💎 ÖZEL TEKLİF
            </div>
            <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 900; line-height: 1.2;">BorsaTakip Mobil Yayında!</h3>
            <p style="margin: 0 0 20px 0; font-size: 12px; font-weight: 500; opacity: 0.9; line-height: 1.5;">Anlık bildirimlerle fırsatları kaçırmayın. Hemen ücretsiz indirin.</p>
            <div style="background: white; color: #764ba2; padding: 10px 20px; border-radius: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: transform 0.2s;">
              UYGULAMAYI İNDİR
            </div>
          </div>
        `
    },
    create: {
      location: 'blog_sidebar_sticky',
      isActive: true,
      label: 'Blog Yan Panel (Yapışkan) - Örnek',
      platform: 'ALL',
      adCode: `
          <div style="width: 100%; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-family: 'Inter', sans-serif; text-align: center; box-shadow: 0 10px 25px -5px rgba(118, 75, 162, 0.4);">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">
              💎 ÖZEL TEKLİF
            </div>
            <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 900; line-height: 1.2;">BorsaTakip Mobil Yayında!</h3>
            <p style="margin: 0 0 20px 0; font-size: 12px; font-weight: 500; opacity: 0.9; line-height: 1.5;">Anlık bildirimlerle fırsatları kaçırmayın. Hemen ücretsiz indirin.</p>
            <div style="background: white; color: #764ba2; padding: 10px 20px; border-radius: 12px; font-size: 12px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: transform 0.2s;">
              UYGULAMAYI İNDİR
            </div>
          </div>
        `
    }
  });
  console.log('Sticky sidebar ad inserted successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
