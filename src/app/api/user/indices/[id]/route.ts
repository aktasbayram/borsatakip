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

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Oturum açmanız gerekiyor.' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Kullanıcı bulunamadı.' },
                { status: 404 }
            );
        }

        // Verify the index belongs to this user
        const index = await prisma.userIndex.findUnique({
            where: { id }
        });

        if (!index || index.userId !== user.id) {
            return NextResponse.json(
                { message: 'Endeks bulunamadı.' },
                { status: 404 }
            );
        }

        await prisma.userIndex.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Endeks silindi.' });
    } catch (error) {
        console.error('Delete user index error:', error);
        return NextResponse.json(
            { message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}
