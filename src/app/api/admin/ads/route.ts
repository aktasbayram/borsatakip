import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // @ts-ignore - Prisma client might not be fully regenerated locally yet
        const ads = await db.adPlacement.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(ads);
    } catch (error) {
        console.error("[ADS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { label, location, adCode, platform } = body;

        if (!label || !location || !adCode) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // @ts-ignore
        const ad = await db.adPlacement.create({
            data: {
                label,
                location,
                adCode,
                platform: platform || "ALL",
                isActive: true,
                maxWidth: body.maxWidth || null,
                maxHeight: body.maxHeight || null
            }
        });

        return NextResponse.json(ad);
    } catch (error) {
        console.error("[ADS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
