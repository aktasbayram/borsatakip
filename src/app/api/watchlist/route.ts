import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth'; // Ensure this matches export from lib/auth
import { z } from 'zod';

const addItemSchema = z.object({
    watchlistId: z.string().optional(), // If not provided, add to default/first
    symbol: z.string(),
    market: z.enum(['BIST', 'US']),
});

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const watchlists = await prisma.watchlist.findMany({
        where: { userId: session.user.id },
        include: {
            items: {
                orderBy: { order: 'asc' }
            }
        },

    });

    return NextResponse.json(watchlists);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const json = await request.json();
        console.log("Watchlist POST Body:", json); // Debug log

        const body = addItemSchema.parse(json);

        let watchlistId = body.watchlistId;

        if (!watchlistId) {
            // Find or create default watchlist
            const first = await prisma.watchlist.findFirst({ where: { userId: session.user.id } });
            if (first) watchlistId = first.id;
            else {
                const newW = await prisma.watchlist.create({
                    data: { name: 'Favoriler', userId: session.user.id }
                });
                watchlistId = newW.id;
            }
        }

        const item = await prisma.watchlistItem.create({
            data: {
                watchlistId: watchlistId!,
                symbol: body.symbol,
                market: body.market,
            }
        });

        return NextResponse.json(item);
    } catch (error: any) {
        console.error('Watchlist add error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Veri doğrulama hatası',
                details: (error as any).errors
            }, { status: 400 });
        }

        // Prisma Unique Constraint Violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bu sembol zaten listenizde ekli.' }, { status: 409 });
        }

        return NextResponse.json({
            error: 'Ekleme işlemi başarısız oldu.',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        // Verify ownership
        const item = await prisma.watchlistItem.findUnique({
            where: { id },
            include: { watchlist: true }
        });

        if (!item || item.watchlist.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
        }

        await prisma.watchlistItem.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
