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
        const { role, subscriptionTier } = body;

        if (role) {
            // Prevent changing own role
            if (session.user.id === id) {
                return NextResponse.json(
                    { message: 'Kendi rolünüzü değiştiremezsiniz.' },
                    { status: 400 }
                );
            }

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
        }

        if (subscriptionTier) {
            // Validate package existence
            // Dynamic check against db packages
            const pkg = await prisma.package.findUnique({
                where: { name: subscriptionTier }
            });

            // Fallback for hardcoded tiers if db is empty or migration transitional
            // But prefer strict check if we are fully dynamic now.
            // Let's allow FREE/BASIC/PRO hardcoded if not found in DB for safety? 
            // Or just trust DB. Let's trust DB but handle the case.

            let credits = 5;
            let smsCredits = 0;

            if (pkg) {
                credits = pkg.credits;
                smsCredits = pkg.smsCredits;
            } else {
                // Fallback logic
                if (subscriptionTier === 'FREE') credits = 5;
                else if (subscriptionTier === 'BASIC') { credits = 50; smsCredits = 10; }
                else if (subscriptionTier === 'PRO') { credits = 100; smsCredits = 50; }
            }

            await prisma.user.update({
                where: { id },
                data: {
                    subscriptionTier,
                    aiCredits: credits,
                    aiCreditsTotal: credits,
                    smsCredits: smsCredits
                }
            });
            // Send notification for package update
            await prisma.notification.create({
                data: {
                    userId: id,
                    title: 'Paketiniz Güncellendi',
                    message: `Tebrikler! Paketiniz ${subscriptionTier} olarak güncellendi.`,
                    type: 'SUCCESS',
                }
            });

            return NextResponse.json({ message: 'Paket atandı ve krediler güncellendi.' });
        }

        if (body.smsCredits !== undefined) {
            await prisma.user.update({
                where: { id },
                data: {
                    smsCredits: parseInt(body.smsCredits)
                }
            });
            return NextResponse.json({ message: 'SMS kredisi güncellendi.' });
        }

        return NextResponse.json({ message: 'İşlem belirtilmedi.' }, { status: 400 });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { message: 'Bir hata oluştu.' },
            { status: 500 }
        );
    }
}
