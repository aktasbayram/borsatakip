import { NextResponse } from 'next/server';
import { MarketService } from '@/services/market';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const market = searchParams.get('market') as 'BIST' | 'US';

    if (!q || !market) {
        return NextResponse.json({ error: 'Query and market required' }, { status: 400 });
    }

    try {
        const results = await MarketService.search(q, market);
        return NextResponse.json(results);
    } catch (error: any) { // Explicitly typed as any to access message
        console.error('API Search Error:', error);
        return NextResponse.json({
            error: 'Failed to search',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
