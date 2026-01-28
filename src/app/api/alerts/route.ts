
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createAlertSchema = z.object({
    symbol: z.string().min(1),
    market: z.enum(["BIST", "US"]),
    type: z.enum(["PRICE_ABOVE", "PRICE_BELOW"]),
    target: z.number().positive(),
    triggerLimit: z.number().int().min(1).default(1),
    cooldown: z.number().int().min(0).default(60),
});

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const alerts = await prisma.alert.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                _count: {
                    select: { logs: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(alerts);
    } catch (error) {
        console.error("[ALERTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const body = createAlertSchema.parse(json);

        // Check Alert Limits based on Subscription Tier
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionTier: true }
        });

        const currentTier = user?.subscriptionTier || 'FREE';
        let limit = 2; // Default limit

        // Fetch limit from Package definition
        const pkg = await prisma.package.findUnique({
            where: { name: currentTier }
        });

        if (pkg) {
            limit = pkg.maxAlerts;
        } else {
            // Fallback for hardcoded tiers if not in DB
            const legacyLimits: Record<string, number> = {
                'FREE': 2,
                'BASIC': 5,
                'PRO': 10
            };
            limit = legacyLimits[currentTier] || 2;
        }

        // Count existing alerts
        const alertCount = await prisma.alert.count({
            where: { userId: session.user.id }
        });

        if (alertCount >= limit) {
            return new NextResponse(
                JSON.stringify({
                    message: `Paketinizde maksimum ${limit} alarm oluşturabilirsiniz. Lütfen paketinizi yükseltin.`
                }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const alert = await prisma.alert.create({
            data: {
                userId: session.user.id,
                symbol: body.symbol,
                market: body.market,
                type: body.type,
                target: body.target,
                status: "ACTIVE",
                triggerLimit: body.triggerLimit,
                cooldown: body.cooldown,
            },
        });

        return NextResponse.json(alert);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[ALERTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
