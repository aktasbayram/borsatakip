
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { date, note } = await request.json();

        if (!date) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        // @ts-ignore
        await db.marketSummary.upsert({
            where: { date },
            update: { editorNote: note },
            create: {
                date,
                editorNote: note,
                data: {} // Empty data if first time
            }
        });

        // @ts-ignore
        revalidateTag('market-summary');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update editor note:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
