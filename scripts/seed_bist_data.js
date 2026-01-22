
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    await prisma.newsAnalysis.create({
        data: {
            symbol: 'THYAO',
            url: 'https://example.com/thyao-news',
            title: 'THY 2025 Hedeflerini Açıkladı: Büyük Büyüme Bekleniyor',
            sentiment: 9,
            summary: 'Türk Hava Yolları, 2025 yılı için filosunu %20 büyütme hedefini açıkladı. Analistler bu durumun hisse fiyatına olumlu yansıyacağını öngörüyor.',
            market: 'BIST',
            publishedAt: new Date()
        }
    });
    console.log("Seeded fake BIST data for THYAO");
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
