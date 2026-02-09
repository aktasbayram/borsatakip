import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
});

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const data = updateSchema.parse(body);

        // Check active slug collision if slug is being updated
        if (data.slug) {
            const existing = await prisma.page.findUnique({
                where: { slug: data.slug }
            });
            if (existing && existing.id !== id) {
                return NextResponse.json(
                    { success: false, error: "Bu URL (slug) zaten başka bir sayfada kullanımda." },
                    { status: 400 }
                );
            }
        }

        const page = await prisma.page.update({
            where: { id },
            data
        });

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        console.error("Update Page Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        await prisma.page.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Page Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
