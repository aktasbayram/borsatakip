
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    const news = [
        {
            symbol: 'XU100',
            url: 'https://www.bloomberght.com/bist-100-gune-yukselisle-basladi-2368365',
            title: 'BIST 100 Endeksi Güne %0,34 Yükselişle Başladı',
            sentiment: 8,
            summary: 'BIST 100 endeksi güne yükselişle başlayarak 12.771 puana ulaştı. Bankacılık ve Holding endekslerindeki artış piyasayı desteklerken, küresel risk iştahındaki artış da olumlu etkiliyor.',
            market: 'BIST',
            publishedAt: new Date()
        },
        {
            symbol: 'AKBNK',
            url: 'https://www.hurriyet.com.tr/ekonomi/merkez-bankasi-faiz-karari-aciklandi-42636541',
            title: 'Piyasaların Gözü TCMB Faiz Kararında: Beklenti İndirim Yönünde',
            sentiment: 6,
            summary: 'Piyasalar bugün TCMB\'nin faiz kararına odaklandı. Ekonomistlerin çoğunluğu 150 baz puanlık bir indirim bekliyor. Karar bankacılık sektörü hisselerinde hareketlilik yaratabilir.',
            market: 'BIST',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60)
        },
        {
            symbol: 'SASA',
            url: 'https://www.milliyet.com.tr/uzmanpara/piyasalar-artida-borsa-istanbul-zirveye-yakin-7071234',
            title: 'Tekstil Sektörü Hisseleri Bugünün Kazananı Oldu',
            sentiment: 7,
            summary: 'Sektörel bazda en fazla kazandıran %1,88 ile tekstil deri sektörü oldu. Sasa Polyester ve diğer tekstil devlerindeki hareketlilik endeksi yukarı taşıyor.',
            market: 'BIST',
            publishedAt: new Date(Date.now() - 1000 * 60 * 120)
        }
    ];

    for (const item of news) {
        // Upsert to avoid duplicates if run multiple times
        await prisma.newsAnalysis.upsert({
            where: { url: item.url },
            update: item,
            create: item
        });
    }
    console.log(`Seeded ${news.length} real BIST news items.`);
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
