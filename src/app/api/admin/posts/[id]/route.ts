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
    categoryId: z.string().optional(),
    isPublished: z.boolean().default(true),
    isFeatured: z.boolean().optional(),
    featuredOrder: z.number().optional(),
    // SEO Fields
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    keywords: z.string().optional(),
    focusKeyword: z.string().optional(),
    canonicalUrl: z.string().optional(),
    // OG Fields
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().optional(),
});

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = postSchema.parse(body);

        const post = await db.post.update({
            where: { id },
            data: {
                title: validatedData.title,
                slug: validatedData.slug,
                content: validatedData.content,
                excerpt: validatedData.excerpt,
                imageUrl: validatedData.imageUrl,
                category: validatedData.category,
                categoryId: validatedData.categoryId || null,
                isPublished: validatedData.isPublished,
                isFeatured: validatedData.isFeatured,
                featuredOrder: validatedData.featuredOrder,
                // SEO Fields
                seoTitle: validatedData.seoTitle,
                seoDescription: validatedData.seoDescription,
                keywords: validatedData.keywords,
                focusKeyword: validatedData.focusKeyword,
                canonicalUrl: validatedData.canonicalUrl,
                // OG Fields
                ogTitle: validatedData.ogTitle,
                ogDescription: validatedData.ogDescription,
                ogImage: validatedData.ogImage,
            },
        });

        return NextResponse.json({ data: post });
    } catch (error: any) {
        console.error("PUT /api/admin/posts/[id] error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({
            error: error.message || "Yazı güncellenirken bir hata oluştu"
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await db.post.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
