import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Fetch user credits
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                aiCredits: true,
                aiCreditsTotal: true,
                aiCreditsResetAt: true,
                subscriptionTier: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if monthly reset is needed
        const now = new Date();
        const resetDate = user.aiCreditsResetAt ? new Date(user.aiCreditsResetAt) : new Date(0);
        const needsReset = !user.aiCreditsResetAt || now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();

        if (needsReset) {
            // Reset credits to tier total
            const updatedUser = await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    aiCredits: user.aiCreditsTotal,
                    aiCreditsResetAt: now,
                }
            });

            return NextResponse.json({
                credits: updatedUser.aiCredits,
                total: updatedUser.aiCreditsTotal,
                tier: updatedUser.subscriptionTier,
                resetAt: updatedUser.aiCreditsResetAt,
            });
        }

        return NextResponse.json({
            credits: user.aiCredits,
            total: user.aiCreditsTotal,
            tier: user.subscriptionTier,
            resetAt: user.aiCreditsResetAt,
        });
    } catch (error) {
        console.error('Credits GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
}

// POST - Deduct 1 credit
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                aiCredits: true,
                aiCreditsTotal: true,
                aiCreditsResetAt: true,
                subscriptionTier: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if monthly reset is needed first
        const now = new Date();
        const resetDate = user.aiCreditsResetAt ? new Date(user.aiCreditsResetAt) : new Date(0);
        const needsReset = !user.aiCreditsResetAt || now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();

        let currentCredits = user.aiCredits;

        if (needsReset) {
            // Reset credits
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    aiCredits: user.aiCreditsTotal,
                    aiCreditsResetAt: now,
                }
            });
            currentCredits = user.aiCreditsTotal;
        }

        // Check if user has credits
        if (currentCredits <= 0) {
            return NextResponse.json({
                error: 'NO_CREDITS',
                message: 'AI krediniz bitti',
                upgradeUrl: '/upgrade'
            }, { status: 403 });
        }

        // Deduct 1 credit
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                aiCredits: { decrement: 1 }
            }
        });

        return NextResponse.json({
            success: true,
            credits: updatedUser.aiCredits,
            total: user.aiCreditsTotal,
        });
    } catch (error) {
        console.error('Credits POST error:', error);
        return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 });
    }
}
