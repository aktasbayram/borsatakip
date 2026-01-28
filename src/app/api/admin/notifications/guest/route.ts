import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const SETTING_KEY = 'GUEST_NOTIFICATIONS';

// GET: Fetch current guest notifications
export async function GET() {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: SETTING_KEY }
        });

        const notifications = setting ? JSON.parse(setting.value) : [];
        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching guest notifications:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// POST: Update guest notifications
export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await req.json();

        // Basic validation
        if (!Array.isArray(body)) {
            return new NextResponse('Invalid data format. Expected array.', { status: 400 });
        }

        // Save to DB
        await prisma.systemSetting.upsert({
            where: { key: SETTING_KEY },
            update: {
                value: JSON.stringify(body),
                updatedAt: new Date()
            },
            create: {
                key: SETTING_KEY,
                value: JSON.stringify(body),
                description: 'Notifications shown to unauthenticated users',
                category: 'NOTIFICATION'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating guest notifications:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
