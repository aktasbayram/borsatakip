import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// PUT - Update user's subscription package (Admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { tier } = await request.json();
        const { id: userId } = await params;

        // Fetch package from DB
        const pkg = await prisma.package.findUnique({
            where: { name: tier }
        });

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 400 });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionTier: tier,
                aiCreditsTotal: pkg.credits,
                aiCredits: pkg.credits, // Reset current credits to new total
                smsCredits: pkg.smsCredits // Assign SMS credits from package
            },
            select: {
                id: true,
                email: true,
                name: true,
                subscriptionTier: true,
                aiCredits: true,
                aiCreditsTotal: true,
                smsCredits: true
            }
        });

        // Send notification
        await prisma.notification.create({
            data: {
                userId,
                title: 'Paketiniz Güncellendi',
                message: `Tebrikler! Paketiniz ${tier} olarak güncellendi. Yeni özelliklerin keyfini çıkarın.`,
                type: 'SUCCESS',
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Package update error:', error);
        return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
    }
}
