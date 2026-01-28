import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await auth();

    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(messages);

    } catch (error) {
        console.error("Admin Contact List Error:", error);
        return NextResponse.json(
            { error: "Mesajlar yüklenirken hata oluştu" },
            { status: 500 }
        );
    }
}
