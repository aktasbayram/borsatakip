
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await auth();

        // Admin check
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { items } = body; // Expecting { items: [{ symbol, market }] }

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Validate items structure
        const cleanItems = items.map((i: any) => ({
            symbol: i.symbol,
            market: i.market || 'BIST'
        })).filter(i => i.symbol);

        await prisma.systemSetting.upsert({
            where: { key: 'DEFAULT_WATCHLIST' },
            update: {
                value: JSON.stringify(cleanItems)
            },
            create: {
                key: 'DEFAULT_WATCHLIST',
                value: JSON.stringify(cleanItems),
                description: 'Default watchlist symbols for guest users',
                category: 'SYSTEM'
            }
        });

        return NextResponse.json({ success: true, items: cleanItems });

    } catch (error) {
        console.error('Update default watchlist failed', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'DEFAULT_WATCHLIST' }
        });

        let defaultSymbolList = [];
        if (setting && setting.value) {
            try {
                defaultSymbolList = JSON.parse(setting.value);
            } catch (e) {
                console.error('Parse error', e);
            }
        }

        return NextResponse.json({ items: defaultSymbolList });
    } catch (error) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}
