import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const { package: pkg, amount, senderName } = json;

        if (!pkg || !amount || !senderName) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Create transaction
        await prisma.paymentTransaction.create({
            data: {
                userId: session.user.id,
                package: pkg,
                amount: parseFloat(amount),
                senderName,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PAYMENT_NOTIFICATION]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
