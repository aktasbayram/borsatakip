import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createPortfolioSchema = z.object({
    name: z.string().min(1, "Portföy adı gereklidir"),
});

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const json = await request.json();
        const body = createPortfolioSchema.parse(json);

        const portfolio = await prisma.portfolio.create({
            data: {
                name: body.name,
                userId: session.user.id
            }
        });

        return NextResponse.json(portfolio);

    } catch (error) {
        if (error instanceof z.ZodError) return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        return NextResponse.json({ error: 'Portföy oluşturulamadı' }, { status: 500 });
    }
}
