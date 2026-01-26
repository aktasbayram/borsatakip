import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const reorderSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        order: z.number()
    }))
});

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const json = await request.json();
        const { items } = reorderSchema.parse(json);

        // Update all items in transaction
        await prisma.$transaction(
            items.map((item) =>
                prisma.watchlistItem.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reorder error:', error);
        return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
    }
}
