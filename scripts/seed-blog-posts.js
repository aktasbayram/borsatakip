const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding 10 sample blog posts with reliable images...');

    // 1. Ensure we have a category
    const category = await prisma.category.upsert({
        where: { slug: 'genel' },
        update: {},
        create: {
            name: 'Genel',
            slug: 'genel',
            description: 'Genel haberler ve analizler'
        }
    });

    const posts = [
        {
            title: "Borsa İstanbul'da Yeni Rekorlar Kapıda mı?",
            slug: "borsa-istanbul-yeni-rekorlar-2026",
            content: "Borsa İstanbul, 2026 yılına güçlü bir başlangıç yaptı. Analistler, endeksin önümüzdeki aylarda yeni zirveleri test edebileceğini öngörüyor. Özellikle teknoloji ve sanayi hisselerindeki yukarı yönlü ivme dikkat çekiyor. Yatırımcıların global piyasalardaki gelişmeleri yakından takip etmesi öneriliyor.",
            excerpt: "Borsa İstanbul'da 2026 yılı beklentileri ve teknik analiz verileri.",
            imageUrl: "https://picsum.photos/seed/stock1/800/600",
        },
        {
            title: "Halka Arz Takvimi: Bu Hafta Hangi Şirketler Geliyor?",
            slug: "halka-arz-takvimi-subat-2026",
            content: "Yatırımcıların heyecanla beklediği halka arz takvimi açıklandı. Bu hafta üç büyük şirketin halka arz başvurusu onaylandı. Şirketlerin finansal yapıları ve gelecek projeksiyonları, yatırımcılar için büyük fırsatlar sunuyor. Talep toplama tarihleri ve katılım endeksine uygunluk durumlarını inceledik.",
            excerpt: "Şubat ayının en çok beklenen halka arzları ve katılım detayları.",
            imageUrl: "https://picsum.photos/seed/ipo1/800/600",
        },
        {
            title: "Altın Fiyatlarında Fed Etkisi Devam Ediyor",
            slug: "altin-fiyatlari-fed-analizi-2026",
            content: "Fed'in faiz kararları sonrası altın piyasasında hareketlilik arttı. Gram altın ve ons altın fiyatları kritik destek seviyelerinde tutunmaya çalışıyor. Uzmanlar, güvenli liman arayışının devam ettiğini belirtirken, orta vadede yükseliş potansiyelinin korunduğunu vurguluyor.",
            excerpt: "Global merkez bankası kararlarının altın fiyatlarına yansıması.",
            imageUrl: "https://picsum.photos/seed/gold1/800/600",
        },
        {
            title: "Kripto Paralarda Boğa Sezonu mu Başlıyor?",
            slug: "kripto-para-boga-sezonu-beklentisi",
            content: "Bitcoin ve Ethereum liderliğinde kripto para piyasası yeşillenmeye başladı. ETF onayları ve kurumsal yatırımların artması, piyasada ciddi bir iyimserlik yarattı. Analistler, altcoin projelerinde de büyük patlamalar yaşanabileceğine dikkat çekiyor.",
            excerpt: "Kripto piyasasında son durum ve kurumsal yatırımcıların ilgisi.",
            imageUrl: "https://picsum.photos/seed/crypto1/800/600",
        },
        {
            title: "Yatırım Yaparken Dikkat Edilmesi Gereken 5 Kural",
            slug: "yatirim-yaparken-dikkat-edilmesi-gerekenler",
            content: "Başarılı bir portföy yönetimi için disiplin şarttır. Risk dağılımı, uzun vadeli bakış açısı ve doğru araştırma, finansal özgürlüğe giden yolun temel taşlarıdır. Bu rehberimizde, her yatırımcının bilmesi gereken temel kuralları özetledik.",
            excerpt: "Finansal okuryazarlık için temel yatırım stratejileri.",
            imageUrl: "https://picsum.photos/seed/invest1/800/600",
        },
        {
            title: "Yapay Zeka Hisseleri Neden Yükseliyor?",
            slug: "yapay-zeka-hisseleri-analiz-2026",
            content: "AI devrimi sadece yazılım sektörünü değil, tüm ekonomiyi dönüştürüyor. Veri merkezleri ve yarı iletken üreticileri, bu dönüşümün en büyük kazananları arasında yer alıyor. Sektördeki dev şirketlerin bilançoları, büyümenin henüz başında olduğumuzu gösteriyor.",
            excerpt: "Teknoloji dünyasındaki AI çılgınlığının borsaya etkileri.",
            imageUrl: "https://picsum.photos/seed/ai1/800/600",
        },
        {
            title: "Döviz Kurlarındaki Oynaklık Nasıl Yönetilir?",
            slug: "doviz-kuru-oynaklik-yonetimi",
            content: "Döviz kurlarındaki hızlı değişimler, ithalat ve ihracat yapan şirketler kadar bireysel yatırımcıları da etkiliyor. Forward işlemleri ve hedging yöntemleri ile kur riskini minimize etmek mümkün. Piyasa uzmanları, sepet portföy oluşturmanın önemini hatırlatıyor.",
            excerpt: "Kur riskine karşı korunma yöntemleri ve stratejiler.",
            imageUrl: "https://picsum.photos/seed/money1/800/600",
        },
        {
            title: "Gayrimenkul Yatırımı mı, Temettü Hissesi mi?",
            slug: "gayrimenkul-vs-temettu-hissesi",
            content: "Pasif gelir elde etmek isteyenler için iki popüler seçenek: Gayrimenkul ve temettü emekliliği. Kira getirisinin zorlukları ile düzenli temettü ödemelerinin avantajlarını karşılaştırdık. Hangi yatırım modeli sizin karakterinize daha uygun?",
            excerpt: "Pasif gelir kanalları arasında karşılaştırmalı analiz.",
            imageUrl: "https://picsum.photos/seed/re1/800/600",
        },
        {
            title: "Mevduat Faizlerindeki Artış Borsayı Nasıl Etkiler?",
            slug: "mevduat-faizi-borsa-iliskisi-2026",
            content: "Faiz oranlarının yükselmesi, risksiz getiri arayan yatırımcıları mevduata yöneltiyor. Bu durum borsada likidite kaybına neden olabilir ancak seçici hisselerde fırsatlar devam ediyor. Sektörel bazda faiz hassasiyeti yüksek olan kağıtları inceledik.",
            excerpt: "Geleneksel yatırım araçları ile borsa arasındaki korelasyon.",
            imageUrl: "https://picsum.photos/seed/bank1/800/600",
        },
        {
            title: "Geleceğin Enerjisi: Yenilenebilir Enerji Şirketleri",
            slug: "yenilenebilir-enerji-sektoru-incelemesi",
            content: "Yeşil dönüşüm süreci tüm dünyada hız kazanıyor. Güneş, rüzgar ve hidroelektrik santralleri kuran şirketler, devlet teşvikleri ile büyümeye devam ediyor. Sürdürülebilirlik odaklı fonların gözdesi haline gelen enerji sektörünü mercek altına aldık.",
            excerpt: "Temiz enerji yatırımlarının finansal geleceği ve potansiyeli.",
            imageUrl: "https://picsum.photos/seed/energy1/800/600",
        }
    ];

    for (const post of posts) {
        await prisma.post.upsert({
            where: { slug: post.slug },
            update: {
                ...post,
                categoryId: category.id,
                isPublished: true,
                publishedAt: new Date(),
            },
            create: {
                ...post,
                categoryId: category.id,
                isPublished: true,
                isFeatured: false,
                publishedAt: new Date(),
            }
        });
    }

    console.log('10 sample posts seeded successfully with Lorem Picsum images!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
