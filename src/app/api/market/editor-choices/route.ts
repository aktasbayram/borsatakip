import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/market/editor-choices - Fetch analysis for premium users
export async function GET(req: Request) {
    try {
        const session = await auth();

        const isPremium = session?.user && (
            session.user.subscriptionTier !== 'FREE' && !!session.user.subscriptionTier
        );

        if (!isPremium) {
            // Return only a teaser or unauthorized
            // For now, let's return limited info if needed, or just 403
            return new NextResponse('Premium Subscription Required', { status: 403 });
        }

        // @ts-ignore
        const choices = await db.editorChoice.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: 'desc' },
            take: 20
        });

        return NextResponse.json(choices);
    } catch (error) {
        console.error('Failed to fetch editor choices:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
