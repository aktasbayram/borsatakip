import { NextRequest, NextResponse } from 'next/server';
import { KAPService } from '@/services/market/kap';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const symbol = searchParams.get('symbol');

        let data;
        if (symbol) {
            data = await KAPService.getNews(symbol);
        } else {
            data = await KAPService.getAllDisclosures(limit);
        }

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('KAP API Route Error:', error);
        return NextResponse.json(
            { success: false, error: 'KAP verileri alınamadı.' },
            { status: 500 }
        );
    }
}
