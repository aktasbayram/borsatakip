
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    const news = [
        {
            symbol: 'ASELS',
            url: 'https://example.com/asels-news-1',
            title: 'ASELSAN Yeni İhracat Sözleşmesi İmzaladı',
            sentiment: 8,
            summary: 'Aselsan, Körfez ülkesiyle 30 milyon dolarlık yeni bir savunma sistemi ihracat sözleşmesi imzaladığını duyurdu. Bu gelişme ciroya olumlu katkı sağlayacak.',
            market: 'BIST',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
            symbol: 'GARAN',
            url: 'https://example.com/garan-news-1',
            title: 'Garanti BBVA 4. Çeyrek Bilançosu Açıklandı',
            sentiment: 5,
            summary: 'Garanti BBVA, 4. çeyrekte beklentilere paralel net kar açıkladı. Kredi büyümesindeki yavaşlama dikkat çekerken, aktif kalitesi güçlü kalmaya devam ediyor.',
            market: 'BIST',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
        },
        {
            symbol: 'AKBNK',
            url: 'https://example.com/akbnk-news-1',
            title: 'Akbank Genel Müdürü: 2026 Zorlu Geçecek',
            sentiment: 3,
            summary: 'Akbank Genel Müdürü, 2026 yılının bankacılık sektörü için kar marjlarının daralacağı zorlu bir yıl olabileceğini belirterek temkinli olunması gerektiğini vurguladı.',
            market: 'BIST',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
            symbol: 'FROTO',
            url: 'https://example.com/froto-news-1',
            title: 'Ford Otosan Elektrikli Araç Üretim Kapasitesini Artırıyor',
            sentiment: 9,
            summary: 'Ford Otosan, Romanya fabrikasındaki elektrikli araç üretim hattını genişletme kararı aldı. Bu yatırım, Avrupa pazarındaki payını artırmayı hedefliyor.',
            market: 'BIST',
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 1) // 1 hour ago
        }
    ];

    for (const item of news) {
        await prisma.newsAnalysis.create({ data: item });
    }
    console.log(`Seeded ${news.length} BIST news items.`);
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
