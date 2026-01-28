import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: List all
export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const banks = await prisma.bankAccount.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(banks);
}

// POST: Create
export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const { bankName, accountHolder, iban } = json;

    await prisma.bankAccount.create({
        data: { bankName, accountHolder, iban, isActive: true }
    });
    return NextResponse.json({ success: true });
}

// PUT: Update
export async function PUT(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const { id, isActive } = json;

    await prisma.bankAccount.update({
        where: { id },
        data: { isActive }
    });
    return NextResponse.json({ success: true });
}

// DELETE: Delete
export async function DELETE(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return new NextResponse("ID required", { status: 400 });

    await prisma.bankAccount.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
