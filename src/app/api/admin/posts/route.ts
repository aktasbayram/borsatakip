import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
    title: z.string().min(1, "Başlık gerekli"),
    slug: z.string().min(1, "URL (Slug) gerekli"),
    content: z.string().min(1, "İçerik gerekli"),
    excerpt: z.string().optional(),
    imageUrl: z.string().optional(),
    category: z.string().optional(),
    isPublished: z.boolean().default(true),
});

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const posts = await db.post.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ data: posts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = postSchema.parse(body);

        const post = await db.post.create({
            data: {
                ...validatedData,
            },
        });

        return NextResponse.json({ data: post });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
