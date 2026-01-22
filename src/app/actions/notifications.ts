'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

export async function generateTelegramCode() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const code = randomBytes(3).toString('hex'); // 6 chars

    await prisma.notificationSettings.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            verificationCode: code
        },
        update: {
            verificationCode: code
        }
    });

    return code;
}

export async function toggleNotification(type: 'telegram' | 'email', enabled: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.notificationSettings.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            [type === 'telegram' ? 'telegramEnabled' : 'emailEnabled']: enabled
        },
        update: {
            [type === 'telegram' ? 'telegramEnabled' : 'emailEnabled']: enabled
        }
    });

    revalidatePath('/settings/notifications');
}

export async function getNotificationSettings() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return await prisma.notificationSettings.findUnique({
        where: { userId: session.user.id }
    });
}
