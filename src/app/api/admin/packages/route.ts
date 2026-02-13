import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: List all
export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const packages = await prisma.package.findMany({ orderBy: { price: 'asc' } });
    return NextResponse.json(packages);
}

// POST: Create
export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    // Default name to uppercase of display name if not provided, or handle in UI
    const data = {
        ...json,
        name: json.name.toUpperCase(),
        price: parseFloat(json.price),
        credits: parseInt(json.credits),
        smsCredits: parseInt(json.smsCredits || '0'),
        maxAlerts: parseInt(json.maxAlerts || '2'),
        canSeeEditorChoices: json.canSeeEditorChoices || false
    };

    try {
        const pkg = await prisma.package.create({ data });
        return NextResponse.json(pkg);
    } catch (error) {
        console.error(error);
        return new NextResponse("Error creating package", { status: 500 });
    }
}

// PUT: Update
export async function PUT(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const { id, ...updateData } = json;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.credits) updateData.credits = parseInt(updateData.credits);
    if (updateData.smsCredits) updateData.smsCredits = parseInt(updateData.smsCredits);
    if (updateData.maxAlerts) updateData.maxAlerts = parseInt(updateData.maxAlerts);

    try {
        const pkg = await prisma.package.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json(pkg);
    } catch (error) {
        console.error("Error updating package:", error);
        return new NextResponse("Error updating package", { status: 500 });
    }
}

// DELETE: Delete
export async function DELETE(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return new NextResponse("ID required", { status: 400 });

    try {
        await prisma.package.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse("Error deleting package", { status: 500 });
    }
}
