import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET /api/admin/editor-choices - List all editor choices
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        const choices = await db.editorChoice.findMany({
            orderBy: { publishedAt: 'desc' }
        });

        return NextResponse.json(choices);
    } catch (error) {
        console.error('Failed to fetch editor choices:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// POST /api/admin/editor-choices - Create a new editor choice
export async function POST(req: Request) {
    try {
        const session = await auth();
        console.log('--- Editor Choice POST Auth Check ---');
        console.log('Session User:', session?.user?.email, 'Role:', session?.user?.role);

        let isAdmin = session?.user?.role === 'ADMIN';

        // Fallback: If session has user but role is missing/wrong, check DB
        if (!isAdmin && session?.user?.id) {
            const user = await db.user.findUnique({
                where: { id: session.user.id },
                select: { role: true }
            });
            if (user?.role === 'ADMIN') {
                isAdmin = true;
                console.log('Auth Fallback: User confirmed as ADMIN from DB');
            }
        }

        if (!isAdmin) {
            console.log('Auth Failed: Permission Denied');
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // @ts-ignore
        if (!db.editorChoice) {
            console.error('Database Error: EditorChoice model is not defined in Prisma Client');
            return new NextResponse('Veritabanı şeması henüz güncellenmemiş. Lütfen terminalde "npx prisma generate" komutunu çalıştırın ve sunucuyu yeniden başlatın.', { status: 503 });
        }

        const body = await req.json();
        console.log('--- Editor Choice Create Start ---');
        console.log('Body:', body);

        const { symbol, title, content, technicalReview, fundamentalReview, targetPrice, stopLoss, chartUrl, isPublished } = body;

        if (!symbol || !title || !content) {
            console.log('Validation Failed: Missing required fields');
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Safety parseFloat helper
        const parsePrice = (val: any) => {
            if (val === undefined || val === null || val === "") return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        };

        // @ts-ignore
        const choice = await db.editorChoice.create({
            data: {
                symbol: symbol.toUpperCase(),
                title,
                content,
                technicalReview,
                fundamentalReview,
                targetPrice: parsePrice(targetPrice),
                stopLoss: parsePrice(stopLoss),
                chartUrl,
                isPublished: isPublished !== undefined ? isPublished : true,
                publishedAt: new Date()
            }
        });

        console.log('Editor Choice Created Successfully:', choice.id);
        console.log('--- Editor Choice Create End ---');

        revalidatePath('/market/editor-choices');
        revalidatePath('/admin/editor-choices');

        return NextResponse.json(choice);
    } catch (error: any) {
        console.error('Failed to create editor choice:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
