
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { preferences: true }
        });

        return NextResponse.json(user?.preferences || {});
    } catch (error) {
        console.error("[PREFERENCES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        // Merge with existing preferences
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { preferences: true }
        });

        const currentPrefs = (currentUser?.preferences as Record<string, any>) || {};
        const newPrefs = { ...currentPrefs, ...body };

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { preferences: newPrefs }
        });

        return NextResponse.json(updatedUser.preferences);
    } catch (error) {
        console.error("[PREFERENCES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
