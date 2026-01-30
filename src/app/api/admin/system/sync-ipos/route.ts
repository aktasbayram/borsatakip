import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { IpoService } from "@/services/market/ipo-service";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const result = await IpoService.syncIpos();

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error("IPO Sync API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
