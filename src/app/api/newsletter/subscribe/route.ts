import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
    email: z.string().email("Geçersiz e-posta adresi"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = subscribeSchema.parse(body);

        // Check if already exists
        const existing = await db.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existing) {
            if (existing.isActive) {
                return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 400 });
            } else {
                // Reactivate if it was inactive
                await db.newsletterSubscriber.update({
                    where: { email },
                    data: { isActive: true }
                });
                return NextResponse.json({ message: "Aboneliğiniz başarıyla yeniden aktif edildi! 🎉" });
            }
        }

        // Create new subscriber
        await db.newsletterSubscriber.create({
            data: { email }
        });

        return NextResponse.json({ message: "Bültenimize başarıyla abone oldunuz! 🎉" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).issues[0].message }, { status: 400 });
        }
        console.error("Newsletter Subscribe Error:", error);
        return NextResponse.json({ error: "Bir hata oluştu, lütfen daha sonra tekrar deneyin." }, { status: 500 });
    }
}
