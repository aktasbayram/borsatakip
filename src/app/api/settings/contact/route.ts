import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ConfigService } from "@/services/config";

// GET - Public (Get Contact Info)
export async function GET() {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: { category: 'CONTACT' }
        });

        // Convert array to object
        const config: Record<string, string> = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT - Admin (Update Contact Info)
export async function PUT(request: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        // body e.g. { CONTACT_PHONE: "...", CONTACT_ADDRESS: "..." }

        const updates = Object.entries(body).map(([key, value]) => {
            return ConfigService.set(key, value as string, "CONTACT");
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
