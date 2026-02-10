import { Metadata } from 'next';
import SymbolDetailClient from './SymbolDetailClient';

interface Props {
    params: Promise<{
        market: string;
        symbol: string;
    }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // Await params in Next.js 15+ (or recent 14+ specific async params behavior)
    const resolvedParams = await params;
    const symbol = resolvedParams.symbol.toUpperCase();
    const market = resolvedParams.market.toUpperCase();

    return {
        title: `${symbol} Hisse Fiyatı, Grafik ve Analiz (${market}) | Borsa Takip`,
        description: `${market} borsasında işlem gören ${symbol} hissesi için canlı fiyat, teknik analiz, RSI, MACD verileri.`,
        openGraph: {
            title: `${symbol} Hisse Analizi - ${market}`,
            description: `${symbol} hissesi için detaylı teknik analiz ve güncel veriler.`,
            url: `https://borsatakip.app/symbol/${market}/${symbol}`,
        }
    };
}

export default function SymbolPage() {
    return <SymbolDetailClient />;
}
