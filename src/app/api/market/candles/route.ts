import { NextResponse } from 'next/server';
import { MarketService } from '@/services/market';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const market = searchParams.get('market') as 'BIST' | 'US';
    const range = searchParams.get('range') || '1M';
    const interval = searchParams.get('interval') || undefined;

    if (!symbol || !market) {
        return NextResponse.json({ error: 'Symbol and market required' }, { status: 400 });
    }

    try {
        const candles = await MarketService.getCandles(symbol, market, range, interval);
        return NextResponse.json(candles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 500 });
    }
}
