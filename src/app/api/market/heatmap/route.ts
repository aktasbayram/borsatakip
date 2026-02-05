import { NextResponse } from 'next/server';
import { MarketService } from '@/services/market';

// BIST 30 Symbols
const XU030_SYMBOLS = [
    'AKBNK', 'ALARK', 'ARCLK', 'ASELS', 'ASTOR',
    'BIMAS', 'BRSAN', 'EKGYO', 'ENKAI', 'EREGL',
    'FROTO', 'GARAN', 'GUBRF', 'HEKTS', 'ISCTR',
    'KCHOL', 'KONTR', 'KOZAL', 'KRDMD', 'ODAS',
    'OYAKC', 'PETKM', 'PGSUS', 'SAHOL', 'SASA',
    'SISE', 'TCELL', 'THYAO', 'TOASO', 'TUPRS',
    'YKBNK'
];

// BIST 100 Symbols (Comprehensive List)
const XU100_SYMBOLS = Array.from(new Set([
    ...XU030_SYMBOLS,
    // Banks & Finance
    'SKBNK', 'TSKB', 'HALKB', 'VAKBN', 'ALBRK', 'ISFIN',
    // Industry & Manufacturing
    'AEFES', 'AGHOL', 'AKCNS', 'AKFYE', 'AKSA', 'AKSEN', 'ALGYO', 'ALKIM',
    'ANHYT', 'ANSGR', 'ASGYO', 'AYDEM', 'BAGFS', 'BERA', 'BIOEN', 'BOBET',
    'BRISA', 'CANTE', 'CCOLA', 'CEMTS', 'CIMSA', 'CWENE', 'DOAS', 'DOHOL',
    'ECILC', 'ECZYT', 'EGEEN', 'ENJSA', 'EUREN', 'Fenerbahce', 'GENIL', 'GESAN',
    'GLYHO', 'GSDHO', 'GWIND', 'IHLAS', 'IPEKE', 'ISDMR', 'ISGYO', 'ISMEN',
    'IZMDC', 'KARSN', 'KCAER', 'KMPUR', 'KORDS', 'KOZAA', 'KZBGY', 'MAVI',
    'MGROS', 'MIATK', 'ODAS', 'OTKAR', 'OYAKC', 'PENTA', 'QUAGR',
    'RTALB', 'SMRTG', 'SOKM', 'TAVHL', 'TKFEN', 'TMSN', 'TRGYO', 'TSKB',
    'TTKOM', 'TURSG', 'ULKER', 'VESTL', 'VESBE', 'YEOTK', 'YYLGD', 'ZOREN'
]));

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const index = searchParams.get('index') || 'XU030';

    // Choose list based on parameter
    const symbols = index === 'XU100' ? XU100_SYMBOLS : XU030_SYMBOLS;

    try {
        // Use the new bulk fetch method
        const quotes = await MarketService.getQuotes(symbols);

        // Format for Heatmap (Treemap)
        // Groups: Banks, Industry, Holding, etc. (Simplified: Just one group for now or simple heuristic)

        const sectors = {
            'Bankacılık': ['AKBNK', 'GARAN', 'ISCTR', 'YKBNK', 'SKBNK', 'TSKB', 'HALKB', 'VAKBN', 'ALBRK'],
            'Holding': ['KCHOL', 'SAHOL', 'ENKAI', 'ALARK', 'AGHOL', 'DOHOL', 'GSDHO', 'IHLAS', 'BERA'],
            'Sanayi/Üretim': ['EREGL', 'TUPRS', 'ASELS', 'FROTO', 'TOASO', 'SASA', 'SISE', 'KRDMD', 'AKSA', 'AKCNS', 'BRISA', 'CIMSA', 'EGEEN', 'KARSN', 'KORDS', 'OTKAR', 'VESTL', 'VESBE'],
            'Enerji': ['ASTOR', 'KONTR', 'ODAS', 'AKSEN', 'AYDEM', 'CANTE', 'ENJSA', 'GWIND', 'SMRTG', 'ZOREN', 'YEOTK', 'CWENE'],
            'Ulaştırma': ['THYAO', 'PGSUS', 'TAVHL'],
            'İletişim': ['TCELL', 'TTKOM'],
            'GYO': ['EKGYO', 'ISGYO', 'TRGYO', 'ASGYO', 'KZBGY'],
            'Perakende/Gıda': ['BIMAS', 'MGROS', 'SOKM', 'AEFES', 'CCOLA', 'ULKER', 'YYLGD'],
            'Teknoloji/Yazılım': ['MIATK', 'PENTA', 'GENIL', 'KONTR', 'REEDER', 'SDTTR'],
            'Maden/Metal': ['KOZAL', 'KOZAA', 'IPEKE', 'ISDMR', 'IZMDC', 'KCAER']
        };

        const data = quotes.map((q: any) => {
            let category = 'Diğer';

            for (const [sectorName, symbols] of Object.entries(sectors)) {
                if (symbols.includes(q.symbol)) {
                    category = sectorName;
                    break;
                }
            }

            return {
                name: q.symbol,
                size: Math.abs(q.price), // Usually MarketCap, but price is a proxy for visual variety if MarketCap missing
                // Ideally we need MarketCap, but Yahoo basic quote might not have it in our interface yet.
                // Using price is misleading for size. Better to use equal size or volume if available.
                // Yahoo quote usually has marketCap. Let's check provider.
                // provider.ts interface doesn't have marketCap.
                // Let's use equal size (100) but weighted by volume if we had it, or just 100.
                value: 100,
                change: q.changePercent,
                category
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Heatmap API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch heatmap data' }, { status: 500 });
    }
}
