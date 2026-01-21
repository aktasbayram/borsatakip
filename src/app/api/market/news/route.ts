import { NextRequest, NextResponse } from 'next/server';
import { KAPService } from '@/services/market/kap';

interface KAPNews {
    id: string;
    title: string;
    date: string;
    summary: string;
    url: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const market = searchParams.get('market');

    // Only support BIST stocks for KAP news
    if (market !== 'BIST' || !symbol) {
        return NextResponse.json([]);
    }

    try {
        // Try to fetch real news from KAP API
        let news = await KAPService.getNews(symbol);

        // Fallback to mock data if no news found (or API error/auth missing)
        if (news.length === 0) {
            console.log(`No news found for ${symbol}, using mock data fallback.`);

            const mockNews: KAPNews[] = [
                {
                    id: '1',
                    title: `${symbol} - Finansal Tablolar ve Faaliyet Raporu Açıklaması`,
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    summary: 'Şirketimizin 2024 yılı 4. çeyrek finansal tabloları ve faaliyet raporu kamuya açıklanmıştır. (MOCK)',
                    url: 'https://www.kap.org.tr'
                },
                {
                    id: '2',
                    title: `${symbol} - Yönetim Kurulu Kararları`,
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    summary: 'Yönetim kurulu toplantısında alınan kararlar hakkında bilgilendirme. (MOCK)',
                    url: 'https://www.kap.org.tr'
                },
                {
                    id: '3',
                    title: `${symbol} - Ortaklık Yapısında Değişiklik`,
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    summary: 'Şirket ortaklık yapısında meydana gelen değişiklikler hakkında açıklama. (MOCK)',
                    url: 'https://www.kap.org.tr'
                },
                {
                    id: '4',
                    title: `${symbol} - Temettü Dağıtım Kararı`,
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    summary: 'Genel kurul kararı ile temettü dağıtımına ilişkin açıklama. (MOCK)',
                    url: 'https://www.kap.org.tr'
                },
                {
                    id: '5',
                    title: `${symbol} - Özel Durum Açıklaması`,
                    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    summary: 'Şirket faaliyetlerini etkileyebilecek özel durum açıklaması. (MOCK)',
                    url: 'https://www.kap.org.tr'
                }
            ];
            news = mockNews;
        }

        return NextResponse.json(news);
    } catch (error) {
        console.error('KAP news fetch error:', error);
        return NextResponse.json([]);
    }
}
