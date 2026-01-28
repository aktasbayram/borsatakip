
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'DEFAULT_WATCHLIST' }
        });

        let defaultSymbolList: { symbol: string, market: 'BIST' | 'US' }[] = [];

        if (setting && setting.value) {
            try {
                defaultSymbolList = JSON.parse(setting.value);
            } catch (e) {
                console.error('Failed to parse default watchlist setting', e);
            }
        } else {
            // Fallback default if not set
            defaultSymbolList = [
                { symbol: 'THYAO', market: 'BIST' },
                { symbol: 'GARAN', market: 'BIST' },
                { symbol: 'AAPL', market: 'US' },
            ];
        }

        // Return in same structure as user watchlist to reuse frontend logic
        // We wrap it in an array to match the User Watchlist API response structure which returns a list of watchlists
        // Or we can adapt the frontend. Let's adapt the frontend to handle this specific structure or mock the watchlist structure.
        // The frontend expects: WatchlistItem[] directly inside items array of watchlist object.
        // Let's mimic the structure: [{ items: [...] }]

        const items = defaultSymbolList.map((item, index) => ({
            id: `default-${item.symbol}`, // Fake ID
            symbol: item.symbol,
            market: item.market,
            order: index
        }));

        // Helper to format as expected by frontend fetchWatchlist (which expects array of watchlists)
        return NextResponse.json([{
            id: 'default',
            name: 'Genel Liste',
            items: items
        }]);

    } catch (error) {
        console.error('Default watchlist fetch failed', error);
        return NextResponse.json({ error: 'Failed to fetch default watchlist' }, { status: 500 });
    }
}
