import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'Yetkisiz erişim.' },
                { status: 403 }
            );
        }

        // Prevent deleting self
        if (session.user.id === id) {
            return NextResponse.json(
                { message: 'Kendinizi silemezsiniz.' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Kullanıcı silindi.' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'Yetkisiz erişim.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { role } = body;

        if (!['USER', 'ADMIN'].includes(role)) {
            return NextResponse.json(
                { message: 'Geçersiz rol.' },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id },
            data: { role }
        });

        return NextResponse.json({ message: 'Kullanıcı rolü güncellendi.' });
    } catch (error) {
        console.error('Update user role error:', error);
        return NextResponse.json(
            { message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}
