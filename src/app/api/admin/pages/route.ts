import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for creating a page
const pageSchema = z.object({
    title: z.string().min(1, "Başlık zorunludur"),
    slug: z.string().min(1, "Slug zorunludur"),
    content: z.string().min(1, "İçerik zorunludur"),
    isActive: z.boolean().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, slug, content, isActive } = pageSchema.parse(body);

        // Check if slug exists
        const existingPage = await prisma.page.findUnique({
            where: { slug }
        });

        if (existingPage) {
            return NextResponse.json(
                { success: false, error: "Bu URL (slug) zaten kullanımda." },
                { status: 400 }
            );
        }

        const page = await prisma.page.create({
            data: {
                title,
                slug,
                content,
                isActive: isActive ?? true,
            }
        });

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        console.error("Create Page Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const pages = await prisma.page.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: pages });
    } catch (error: any) {
        console.error("List Pages Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
