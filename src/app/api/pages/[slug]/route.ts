import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const page = await prisma.page.findUnique({
            where: { slug },
        });

        if (!page || !page.isActive) {
            return NextResponse.json(
                { success: false, error: "Sayfa bulunamadı." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: page });
    } catch (error: any) {
        console.error("Get Page Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
