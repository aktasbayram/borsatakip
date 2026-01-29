import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

// GET /api/admin/ipos/[id] - Get a single manual IPO
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;

        // @ts-ignore
        const ipo = await db.ipo.findUnique({
            where: { id }
        });

        if (!ipo) {
            return new NextResponse('IPO not found', { status: 404 });
        }

        return NextResponse.json(ipo);
    } catch (error) {
        console.error('Failed to fetch manual IPO:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// PUT /api/admin/ipos/[id] - Update a manual IPO
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        if (!db.ipo) {
            return new NextResponse('Database schema not synced. Please restart the terminal.', { status: 503 });
        }

        const { id } = await params;
        const body = await req.json();
        const { code, company, status, isNew, statusText, ...rest } = body;

        // @ts-ignore
        const ipo = await db.ipo.update({
            where: { id },
            data: {
                code,
                company,
                status,
                isNew,
                statusText,
                ...rest
            }
        });

        // Invalidate cache
        // @ts-ignore
        revalidateTag('ipos');
        revalidatePath('/market/ipo');
        revalidatePath('/admin/ipos');

        return NextResponse.json(ipo);
    } catch (error) {
        console.error('Failed to update manual IPO:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// DELETE /api/admin/ipos/[id] - Delete a manual IPO
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        if (!db.ipo) {
            return new NextResponse('Database schema not synced. Please restart the terminal.', { status: 503 });
        }

        const { id } = await params;

        // @ts-ignore
        await db.ipo.delete({
            where: { id }
        });

        // Invalidate cache
        // @ts-ignore
        revalidateTag('ipos');
        revalidatePath('/market/ipo');
        revalidatePath('/admin/ipos');

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete manual IPO:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
