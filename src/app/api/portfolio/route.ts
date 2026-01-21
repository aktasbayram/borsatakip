import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const addTradeSchema = z.object({
    portfolioId: z.string().optional(),
    symbol: z.string(),
    market: z.enum(['BIST', 'US']),
    type: z.enum(['BUY', 'SELL']),
    quantity: z.number().positive(),
    price: z.number().positive(),
    date: z.string().or(z.date()).optional(), // ISO string
});

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const portfolios = await prisma.portfolio.findMany({
        where: { userId: session.user.id },
        include: { trades: true },
    });

    return NextResponse.json(portfolios);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const json = await request.json();
        const body = addTradeSchema.parse(json);

        let portfolioId = body.portfolioId;

        if (!portfolioId) {
            // Find or create
            const first = await prisma.portfolio.findFirst({ where: { userId: session.user.id } });
            if (first) portfolioId = first.id;
            else {
                const newP = await prisma.portfolio.create({ data: { name: 'Ana Portföy', userId: session.user.id } });
                portfolioId = newP.id;
            }
        }

        const trade = await prisma.trade.create({
            data: {
                portfolioId: portfolioId!,
                symbol: body.symbol,
                market: body.market,
                type: body.type,
                quantity: body.quantity,
                price: body.price,
                date: body.date ? new Date(body.date) : new Date(),
            }
        });

        return NextResponse.json(trade);

    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        return NextResponse.json({ error: 'Failed to add trade' }, { status: 500 });
    }
}
