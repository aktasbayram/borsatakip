
import { NextResponse } from 'next/server';
import { MarketSummaryService } from '@/services/market/market-summary-service';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        const force = searchParams.get('force') === 'true';

        const date = dateParam || new Date().toISOString().split('T')[0];

        let summary;
        if (force) {
            summary = await MarketSummaryService.generateSummary(date);
        } else {
            summary = await MarketSummaryService.getSummary(date);
        }

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Failed to fetch market summary:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
