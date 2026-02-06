import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            console.log('[ADS_PUT] Unauthorized access attempt');
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = await context.params;
        const body = await req.json();

        console.log('[ADS_PUT] Received body:', JSON.stringify(body, null, 2));
        console.log('[ADS_PUT] Updating ad:', params.id);

        // Build update data object with only defined fields
        const updateData: any = {};
        if (body.label !== undefined) updateData.label = body.label;
        if (body.adCode !== undefined) updateData.adCode = body.adCode;
        if (body.platform !== undefined) updateData.platform = body.platform;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.maxWidth !== undefined) updateData.maxWidth = body.maxWidth;
        if (body.maxHeight !== undefined) updateData.maxHeight = body.maxHeight;

        console.log('[ADS_PUT] Update data:', JSON.stringify(updateData, null, 2));

        // @ts-ignore
        const ad = await db.adPlacement.update({
            where: { id: params.id },
            data: updateData
        });

        console.log('[ADS_PUT] Updated successfully. New isActive:', ad.isActive);

        return NextResponse.json(ad);
    } catch (error: any) {
        console.error("[ADS_PUT] Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params = await context.params;

        // @ts-ignore
        const ad = await db.adPlacement.delete({
            where: { id: params.id }
        });

        return NextResponse.json(ad);
    } catch (error: any) {
        console.error("[ADS_DELETE] Error details:", {
            message: error.message,
            stack: error.stack
        });
        return new NextResponse("Internal Error", { status: 500 });
    }
}
