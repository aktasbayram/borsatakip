import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: List all transactions
export async function GET(req: Request) {
    try {
        const session = await auth();
        // Check Admin Role
        if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

        const transactions = await prisma.paymentTransaction.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true, name: true } } }
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("[ADMIN_PAYMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH: Approve or Reject
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

        const json = await req.json();
        const { id, action } = json; // action: 'APPROVE' | 'REJECT'

        if (!id || !action) return new NextResponse("Missing fields", { status: 400 });

        const transaction = await prisma.paymentTransaction.findUnique({ where: { id } });
        if (!transaction) return new NextResponse("Transaction not found", { status: 404 });

        if (transaction.status !== 'PENDING') return new NextResponse("Transaction already processed", { status: 400 });

        if (action === 'APPROVE') {
            // Update Transaction
            await prisma.paymentTransaction.update({
                where: { id },
                data: { status: 'APPROVED', processedAt: new Date() }
            });

            // Update User
            const credits = transaction.package === 'BASIC' ? 50 : 100;
            await prisma.user.update({
                where: { id: transaction.userId },
                data: {
                    subscriptionTier: transaction.package,
                    aiCreditsTotal: credits,
                    aiCredits: credits // Reset/Top-up credits immediately
                }
            });

            // Send Notification
            await prisma.notification.create({
                data: {
                    userId: transaction.userId,
                    title: 'Ödeme Onaylandı 🚀',
                    message: `${transaction.package} paketiniz tanımlandı. Keyifli kullanımlar!`,
                    type: 'SUCCESS',
                    sendInApp: true,
                    sendBrowser: true
                }
            });

        } else if (action === 'REJECT') {
            await prisma.paymentTransaction.update({
                where: { id },
                data: { status: 'REJECTED', processedAt: new Date() }
            });

            // Send Notification
            await prisma.notification.create({
                data: {
                    userId: transaction.userId,
                    title: 'Ödeme Reddedildi ❌',
                    message: `Ödeme bildiriminiz onaylanamadı. Lütfen destek ile iletişime geçin.`,
                    type: 'ERROR',
                    sendInApp: true,
                    sendBrowser: false
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ADMIN_PAYMENTS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
