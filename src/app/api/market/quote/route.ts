import { NextResponse } from 'next/server';
import { MarketService } from '@/services/market';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const market = searchParams.get('market') as 'BIST' | 'US';

    if (!symbol || !market) {
        return NextResponse.json({ error: 'Symbol and market required' }, { status: 400 });
    }

    try {
        const quote = await MarketService.getQuote(symbol, market);
        return NextResponse.json(quote);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
    }
}
