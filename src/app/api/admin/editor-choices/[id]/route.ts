import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        const choice = await db.editorChoice.findUnique({
            where: { id }
        });

        if (!choice) {
            return new NextResponse('Not Found', { status: 404 });
        }

        return NextResponse.json(choice);
    } catch (error) {
        console.error('Failed to fetch editor choice:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { symbol, title, content, technicalReview, fundamentalReview, targetPrice, stopLoss, chartUrl, isPublished } = body;

        // @ts-ignore
        const choice = await db.editorChoice.update({
            where: { id },
            data: {
                symbol: symbol?.toUpperCase(),
                title,
                content,
                technicalReview,
                fundamentalReview,
                targetPrice: targetPrice !== undefined ? (targetPrice ? parseFloat(targetPrice) : null) : undefined,
                stopLoss: stopLoss !== undefined ? (stopLoss ? parseFloat(stopLoss) : null) : undefined,
                chartUrl,
                isPublished
            }
        });

        revalidatePath('/market/editor-choices');
        revalidatePath('/admin/editor-choices');

        return NextResponse.json(choice);
    } catch (error) {
        console.error('Failed to update editor choice:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        await db.editorChoice.delete({
            where: { id }
        });

        revalidatePath('/market/editor-choices');
        revalidatePath('/admin/editor-choices');

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete editor choice:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
