import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { indices } = await req.json();

        // Update order for each index
        await Promise.all(
            indices.map((idx: { id: string; order: number }) =>
                prisma.userIndex.update({
                    where: { id: idx.id },
                    data: { order: idx.order }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[INDICES_REORDER]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
