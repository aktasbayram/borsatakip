
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const settingsSchema = z.object({
    telegramChatId: z.string().optional().or(z.literal('')),
    telegramEnabled: z.boolean(),
    emailEnabled: z.boolean(),
});

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        let settings = await prisma.notificationSettings.findUnique({
            where: { userId: session.user.id }
        });

        if (!settings) {
            settings = await prisma.notificationSettings.create({
                data: { userId: session.user.id }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[NOTIFICATIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const json = await req.json();
        const body = settingsSchema.parse(json);

        const settings = await prisma.notificationSettings.upsert({
            where: { userId: session.user.id },
            update: {
                telegramChatId: body.telegramChatId,
                telegramEnabled: body.telegramEnabled,
                emailEnabled: body.emailEnabled,
            },
            create: {
                userId: session.user.id,
                telegramChatId: body.telegramChatId,
                telegramEnabled: body.telegramEnabled,
                emailEnabled: body.emailEnabled,
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[NOTIFICATIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
