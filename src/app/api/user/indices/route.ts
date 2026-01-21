import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// Default indices if user hasn't configured any
const DEFAULT_INDICES = [
    { symbol: 'XU100.IS', name: 'BIST 100', order: 0 },
    { symbol: 'XU030.IS', name: 'BIST 30', order: 1 },
    { symbol: 'USDTRY=X', name: 'Dolar/TL', order: 2 },
    { symbol: 'EURTRY=X', name: 'Euro/TL', order: 3 },
];

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Oturum açmanız gerekiyor.' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                indices: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Kullanıcı bulunamadı.' },
                { status: 404 }
            );
        }

        // Always return user's custom indices if they have any
        // Default indices are only shown in the UI when there are no custom indices
        return NextResponse.json(user.indices);
    } catch (error) {
        console.error('Get user indices error:', error);
        return NextResponse.json(
            { message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Oturum açmanız gerekiyor.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { symbol, name } = body;

        if (!symbol || !name) {
            return NextResponse.json(
                { message: 'Symbol ve name zorunludur.' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { indices: true }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Kullanıcı bulunamadı.' },
                { status: 404 }
            );
        }

        // Get max order + 1
        const maxOrder = user.indices.length > 0
            ? Math.max(...user.indices.map(i => i.order))
            : -1;

        const newIndex = await prisma.userIndex.create({
            data: {
                userId: user.id,
                symbol,
                name,
                order: maxOrder + 1
            }
        });

        return NextResponse.json(newIndex, { status: 201 });
    } catch (error: any) {
        console.error('Add user index error:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                { message: 'Bu endeks zaten eklenmiş.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}
