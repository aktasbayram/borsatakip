import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const SETTING_KEY = 'GUEST_NOTIFICATIONS';

// GET: Fetch guest notifications (Public)
export async function GET() {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: SETTING_KEY }
        });

        const notifications = setting ? JSON.parse(setting.value) : [];

        // Transform purely for frontend consumption if needed, 
        // but for now passing the raw saved array is fine.
        // We might want to filter active ones if we add an 'isActive' flag later.

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching public guest notifications:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
