import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const location = searchParams.get('location');

        const whereClause: any = {
            isActive: true
        };

        if (location) {
            whereClause.location = location;
        }

        const ads = await db.adPlacement.findMany({
            where: whereClause,
            select: {
                id: true,
                label: true,
                location: true,
                adCode: true,
                platform: true,
                isActive: true
            }
        });

        return NextResponse.json(ads);
    } catch (error) {
        console.error("[PUBLIC_ADS_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
