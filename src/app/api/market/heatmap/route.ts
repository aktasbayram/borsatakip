import { NextResponse } from 'next/server';
import { MarketService } from '@/services/market';

// BIST 30 Symbols (Example list)
const BIST30_SYMBOLS = [
    'AKBNK', 'ALARK', 'ARCLK', 'ASELS', 'ASTOR',
    'BIMAS', 'BRSAN', 'EKGYO', 'ENKAI', 'EREGL',
    'FROTO', 'GARAN', 'GUBRF', 'HEKTS', 'ISCTR',
    'KCHOL', 'KONTR', 'KOZAL', 'KRDMD', 'ODAS',
    'OYAKC', 'PETKM', 'PGSUS', 'SAHOL', 'SASA',
    'SISE', 'TCELL', 'THYAO', 'TOASO', 'TUPRS',
    'YKBNK'
];

export async function GET() {
    try {
        // Use the new bulk fetch method
        const quotes = await MarketService.getQuotes(BIST30_SYMBOLS);

        // Format for Heatmap (Treemap)
        // Groups: Banks, Industry, Holding, etc. (Simplified: Just one group for now or simple heuristic)

        // Simple heuristic for sectors based on known symbols (optional enhancement)
        const banks = ['AKBNK', 'GARAN', 'ISCTR', 'YKBNK'];
        const holdings = ['KCHOL', 'SAHOL', 'ENKAI', 'ALARK'];
        const industry = ['EREGL', 'TUPRS', 'ASELS', 'FROTO', 'TOASO', 'SASA', 'SISE', 'KRDMD'];

        const data = quotes.map((q: any) => {
            let category = 'Diğer';
            if (banks.includes(q.symbol)) category = 'Bankacılık';
            else if (holdings.includes(q.symbol)) category = 'Holding';
            else if (industry.includes(q.symbol)) category = 'Sanayi';
            else if (q.symbol === 'THYAO' || q.symbol === 'PGSUS') category = 'Ulaştırma';
            else if (q.symbol === 'TCELL') category = 'İletişim';
            else if (q.symbol === 'EKGYO') category = 'GYO';
            else if (q.symbol === 'BIMAS') category = 'Perakende';
            else if (q.symbol === 'ASTOR' || q.symbol === 'KONTR' || q.symbol === 'ODAS') category = 'Enerji/Teknoloji';

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
