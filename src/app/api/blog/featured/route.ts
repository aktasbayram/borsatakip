import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const posts = await db.post.findMany({
            where: {
                isPublished: true,
                isFeatured: true,
            },
            orderBy: [
                { featuredOrder: 'desc' },
                { publishedAt: 'desc' }
            ],
            take: 5,
            include: {
                catRel: true,
            },
        });

        return NextResponse.json({ data: posts });
    } catch (error) {
        console.error("GET /api/blog/featured ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}
