
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
