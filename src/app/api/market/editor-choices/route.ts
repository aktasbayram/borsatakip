import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/market/editor-choices - Fetch analysis for premium users
export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse('Premium Subscription Required', { status: 403 });
        }

        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionTier: true }
        });

        if (!user?.subscriptionTier) {
            return new NextResponse('Premium Subscription Required', { status: 403 });
        }

        const userPackage = await db.package.findFirst({
            where: { name: user.subscriptionTier }
        });

        const isAllowed = userPackage?.canSeeEditorChoices || false;

        if (!isAllowed) {
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
