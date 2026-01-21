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
        console.log(`API Request: Symbol=${symbol}, Market=${market}`);
        const quote = await MarketService.getQuote(symbol, market);
        console.log(`API Response for ${symbol}:`, quote);
        return NextResponse.json(quote);
    } catch (error: any) { // Type as any to access message safely
        console.error(`API Error for ${symbol}:`, error);
        return NextResponse.json({ error: 'Failed to fetch quote', details: error.message }, { status: 500 });
    }
}
