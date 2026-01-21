import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        // Verify ownership
        const portfolio = await prisma.portfolio.findUnique({
            where: { id },
        });

        if (!portfolio) {
            return NextResponse.json({ error: 'Portföy bulunamadı' }, { status: 404 });
        }

        if (portfolio.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete (Cascade should handle trades if configured, otherwise delete trades first)
        // Prisma schema usually handles cascade if @relation(onDelete: Cascade) is set.
        // Checking schema.prisma from previous views: user->portfolio is Cascade, portfolio->trades is Cascade.
        // So deleting portfolio deletes trades.

        await prisma.portfolio.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Portföy silinemedi' }, { status: 500 });
    }
}
