import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

// GET /api/admin/ipos - List all manual IPOs
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        const ipos = await db.ipo.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(ipos);
    } catch (error) {
        console.error('Failed to fetch manual IPOs:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// POST /api/admin/ipos - Create a new manual IPO
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        if (!db.ipo) {
            return new NextResponse('Database schema not synced. Please restart the terminal.', { status: 503 });
        }

        const body = await req.json();
        const { code, company, status, isNew, statusText, ...rest } = body;

        if (!code || !company) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // @ts-ignore
        const existingIpo = await db.ipo.findUnique({
            where: { code }
        });

        if (existingIpo) {
            return new NextResponse('IPO with this code already exists', { status: 409 });
        }

        // @ts-ignore
        const ipo = await db.ipo.create({
            data: {
                code,
                company,
                status: status || 'DRAFT',
                isNew: isNew || false,
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
        console.error('Failed to create manual IPO:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
