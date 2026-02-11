import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const subscribers = await db.newsletterSubscriber.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json({ data: subscribers });
    } catch (error) {
        console.error("GET /api/admin/newsletter error:", error);
        return NextResponse.json({ error: "Aboneler çekilemedi." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
        }

        await db.newsletterSubscriber.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Abone başarıyla silindi." });
    } catch (error) {
        console.error("DELETE /api/admin/newsletter error:", error);
        return NextResponse.json({ error: "Abone silinemedi." }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
        }

        await db.newsletterSubscriber.update({
            where: { id },
            data: { isActive }
        });

        return NextResponse.json({ message: "Abone durumu güncellendi." });
    } catch (error) {
        console.error("PUT /api/admin/newsletter error:", error);
        return NextResponse.json({ error: "Abone güncellenemedi." }, { status: 500 });
    }
}
