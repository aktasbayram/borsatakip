import { NextResponse } from 'next/server';
import { MarketService } from '@/services/market';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Default indices if user hasn't configured any
const DEFAULT_INDICES = [
    { symbol: 'XU100.IS', name: 'BIST 100' },
    { symbol: 'XU030.IS', name: 'BIST 30' },
    { symbol: 'XBANK.IS', name: 'BIST Banka' },
    { symbol: 'XUSIN.IS', name: 'BIST Sınai' },
    { symbol: 'USDTRY=X', name: 'Dolar/TL' },
    { symbol: 'EURTRY=X', name: 'Euro/TL' },
    { symbol: 'GC=F', name: 'Altın' },
];

export async function GET() {
    try {
        const session = await auth();

        let indicesToFetch = DEFAULT_INDICES;

        // If user is logged in, get their custom indices
        if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: {
                    indices: {
                        orderBy: { order: 'asc' }
                    }
                }
            });

            if (user && user.indices.length > 0) {
                indicesToFetch = user.indices.map(i => ({
                    symbol: i.symbol,
                    name: i.name
                }));
            }
        }

        const promises = indicesToFetch.map(async (index) => {
            try {
                const quote = await MarketService.getQuote(index.symbol, 'BIST');
                return {
                    ...quote,
                    name: index.name,
                    displayName: index.name
                };
            } catch (error) {
                console.error(`Failed to fetch index ${index.symbol}:`, error);
                // Return fallback data so the user can at least see the index exists
                return {
                    symbol: index.symbol,
                    name: index.name,
                    displayName: index.name,
                    price: 0,
                    change: 0,
                    changePercent: 0,
                    currency: 'TRY',
                    market: 'BIST',
                    timestamp: Date.now()
                };
            }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(r => r !== null);

        return NextResponse.json(validResults);
    } catch (error) {
        console.error('Indices API Error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
