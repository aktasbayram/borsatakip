import { NextRequest, NextResponse } from "next/server";
import { ConfigService } from "@/services/config";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        console.log("Settings API: Starting request");
        const session = await auth();
        console.log("Settings API: Session checked", session?.user?.email);

        if (!session || session.user.role !== "ADMIN") {
            console.log("Settings API: Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Settings API: Fetching settings from DB");
        const settings = await ConfigService.getAll();
        console.log(`Settings API: Fetched ${settings.length} settings`);

        return NextResponse.json(settings);
    } catch (error: any) {
        console.error("Settings API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { key, value, category, isSecret } = body;

    if (!key || !value) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await ConfigService.set(key, value, category, isSecret);
    return NextResponse.json({ success: true });
}
