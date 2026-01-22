
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const analyses = await prisma.newsAnalysis.findMany({
            orderBy: {
                publishedAt: 'desc',
            },
            take: 50,
        });

        return NextResponse.json(analyses);
    } catch (error) {
        console.error('Error fetching analysis:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis data' },
            { status: 500 }
        );
    }
}
