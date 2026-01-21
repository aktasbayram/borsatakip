
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MarketService } from "@/services/market/index";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let activeAlerts = [];
        try {
            activeAlerts = await prisma.alert.findMany({
                where: {
                    userId: session.user.id,
                    status: "ACTIVE",
                },
                include: {
                    _count: {
                        select: { logs: true }
                    },
                    logs: {
                        orderBy: { triggeredAt: 'desc' },
                        take: 1
                    }
                }
            });
        } catch (dbError) {
            console.error("DB Error in Alert Check:", dbError);
            // Return empty list instead of crashing
            return NextResponse.json([]);
        }

        if (activeAlerts.length === 0) {
            return NextResponse.json([]);
        }

        // Group by symbol to batch fetch prices (optimized)
        const uniqueSymbols = new Map<string, { symbol: string; market: "BIST" | "US" }>();
        activeAlerts.forEach((alert) => {
            const key = `${alert.market}:${alert.symbol}`;
            uniqueSymbols.set(key, { symbol: alert.symbol, market: alert.market as "BIST" | "US" });
        });

        // Fetch current prices
        const prices = new Map<string, number>();
        await Promise.all(
            Array.from(uniqueSymbols.values()).map(async ({ symbol, market }) => {
                try {
                    const quote = await MarketService.getQuote(symbol, market);
                    if (quote && quote.price) {
                        prices.set(`${market}:${symbol}`, quote.price);
                    }
                } catch (error) {
                    console.error(`Failed to fetch price for ${symbol}`, error);
                }
            })
        );

        const triggeredAlerts = [];


        // Check conditions
        for (const alert of activeAlerts) {
            const currentPrice = prices.get(`${alert.market}:${alert.symbol}`);

            if (currentPrice === undefined) continue;

            // Cooldown removed as per user request - continuous triggering

            let isTriggered = false;

            if (alert.type === "PRICE_ABOVE" && currentPrice >= alert.target) {
                isTriggered = true;
            } else if (alert.type === "PRICE_BELOW" && currentPrice <= alert.target) {
                isTriggered = true;
            }

            if (isTriggered) {
                // Update alert status - KEEP ACTIVE, just add log
                await prisma.alert.update({
                    where: { id: alert.id },
                    data: {
                        // status: "TRIGGERED", // REMOVED: Keep active
                        logs: {
                            create: {
                                message: `Fiyat hedefi yakalandı: ${currentPrice} (Hedef: ${alert.target})`,
                            },
                        },
                    },
                });

                triggeredAlerts.push({
                    ...alert,
                    currentPrice,
                    triggerCount: alert._count.logs + 1
                });
            }
        }

        return NextResponse.json(triggeredAlerts);
    } catch (error: any) {
        console.error("[ALERTS_CHECK]", error);
        return NextResponse.json({
            error: "Internal Error",
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
