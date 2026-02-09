import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const pages = await prisma.page.findMany({
            where: { isActive: true },
            select: { title: true, slug: true },
            orderBy: { title: 'asc' }
        });
        return NextResponse.json({ success: true, data: pages });
    } catch (error: any) {
        console.error("List Active Pages Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
