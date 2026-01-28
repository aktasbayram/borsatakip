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

        // Validate tier
        const validTiers = ['FREE', 'BASIC', 'PRO'];
        if (!validTiers.includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        // Determine credits based on tier
        const creditsMap: Record<string, number> = {
            'FREE': 5,
            'BASIC': 50,
            'PRO': 100,
        };

        const newCreditsTotal = creditsMap[tier];

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionTier: tier,
                aiCreditsTotal: newCreditsTotal,
                aiCredits: newCreditsTotal, // Reset current credits to new total
            },
            select: {
                id: true,
                email: true,
                name: true,
                subscriptionTier: true,
                aiCredits: true,
                aiCreditsTotal: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Package update error:', error);
        return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
    }
}
