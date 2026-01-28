import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const body = await req.json();
        const { targetType, targetUserEmail, title, message, link, type, sendInApp, sendBrowser } = body;

        if (!title || !message) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        if (targetType === "ALL") {
            // Fetch all user IDs
            const users = await prisma.user.findMany({ select: { id: true } });

            await prisma.notification.createMany({
                data: users.map(user => ({
                    userId: user.id,
                    title,
                    message,
                    link,
                    type: type || "INFO",
                    sendInApp: sendInApp !== undefined ? sendInApp : true,
                    sendBrowser: sendBrowser !== undefined ? sendBrowser : false,
                }))
            });

            return NextResponse.json({ success: true, count: users.length });

        } else if (targetType === "USER" && targetUserEmail) {
            const user = await prisma.user.findUnique({
                where: { email: targetUserEmail }
            });

            if (!user) {
                return new NextResponse("User not found", { status: 404 });
            }

            await prisma.notification.create({
                data: {
                    userId: user.id,
                    title,
                    message,
                    link,
                    type: type || "INFO",
                    sendInApp: sendInApp !== undefined ? sendInApp : true,
                    sendBrowser: sendBrowser !== undefined ? sendBrowser : false,
                }
            });

            return NextResponse.json({ success: true, count: 1 });
        } else {
            return new NextResponse("Invalid target", { status: 400 });
        }

    } catch (error) {
        console.error("[ADMIN_NOTIFICATIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
