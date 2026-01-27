import { NextResponse } from 'next/server';
import { IpoService } from '@/services/market/ipo-service';

export async function GET() {
    try {
        const ipos = await IpoService.getActiveIpos();
        return NextResponse.json(ipos);
    } catch (error) {
        console.error('IPO API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch IPOs' }, { status: 500 });
    }
}
