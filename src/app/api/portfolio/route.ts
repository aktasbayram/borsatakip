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

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            portfolios: {
                include: { trades: true }
            }
        }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Return portfolios with attached global balance info for convenience
    // or just return the user object structure. 
    // To minimize frontend changes, let's map it but add the global balance to each portfolio object temporarily or handled in frontend.
    // Better: Return the structure expected by frontend but with balance info.

    const portfoliosWithBalance = user.portfolios.map(p => ({
        ...p,
        balanceTRY: user.balanceTRY,
        balanceUSD: user.balanceUSD
    }));

    return NextResponse.json(portfoliosWithBalance);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const json = await request.json();
        const body = addTradeSchema.parse(json);

        let portfolioId = body.portfolioId;

        // 1. Get Portfolio & User
        let portfolio;
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (portfolioId) {
            portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId, userId: session.user.id } });
        } else {
            portfolio = await prisma.portfolio.findFirst({ where: { userId: session.user.id } });
        }

        if (!portfolio) {
            // Create default if not exists
            portfolio = await prisma.portfolio.create({ data: { name: 'Ana Portföy', userId: session.user.id } });
            portfolioId = portfolio.id;
        } else {
            portfolioId = portfolio.id;
        }

        const totalAmount = body.price * body.quantity;
        const isBuy = body.type === 'BUY';
        const isBist = body.market === 'BIST';

        // 2. Validate Balance (from USER) or Quantity (from PORTFOLIO TRADES)
        if (isBuy) {
            if (isBist) {
                if (user.balanceTRY < totalAmount) {
                    return NextResponse.json({ error: 'Yetersiz TL Bakiyesi (Ana Hesap)' }, { status: 400 });
                }
            } else {
                if (user.balanceUSD < totalAmount) {
                    return NextResponse.json({ error: 'Yetersiz USD Bakiyesi (Ana Hesap)' }, { status: 400 });
                }
            }
        } else {
            // Check existing quantity for SELL
            // Fetch all trades for this symbol
            const currentTrades = await prisma.trade.findMany({
                where: { portfolioId: portfolioId, symbol: body.symbol, market: body.market }
            });

            const currentQty = currentTrades.reduce((acc, t) => {
                return acc + (t.type === 'BUY' ? t.quantity : -t.quantity);
            }, 0);

            if (currentQty < body.quantity) {
                return NextResponse.json({ error: `Yetersiz Adet. Sahip olunan: ${currentQty}` }, { status: 400 });
            }
        }

        // 3. Execute Transaction (Create Trade + Update USER Balance)
        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            const trade = await tx.trade.create({
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

            // Update User Balance
            const balanceChange = isBuy ? -totalAmount : totalAmount;
            const updateData = isBist
                ? { balanceTRY: { increment: balanceChange } }
                : { balanceUSD: { increment: balanceChange } };

            await tx.user.update({
                where: { id: session.user.id },
                data: updateData
            });

            return trade;
        });

        return NextResponse.json(result);

    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        console.error("Trade Error:", error);
        return NextResponse.json({ error: 'İşlem gerçekleştirilemedi.' }, { status: 500 });
    }
}
