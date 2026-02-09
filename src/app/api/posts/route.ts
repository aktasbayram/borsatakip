import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const posts = await db.post.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: "desc" },
        });
        return NextResponse.json({ data: posts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
