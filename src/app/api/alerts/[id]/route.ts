
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const alert = await prisma.alert.findUnique({
            where: {
                id,
            },
        });

        if (!alert) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (alert.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.alert.delete({
            where: {
                id,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[ALERT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const json = await req.json();
        const { status } = json;

        if (!status) {
            return new NextResponse("Missing status", { status: 400 });
        }

        const alert = await prisma.alert.findUnique({
            where: { id },
        });

        if (!alert || alert.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const updated = await prisma.alert.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[ALERT_UPDATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
