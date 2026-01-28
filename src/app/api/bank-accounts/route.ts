import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const banks = await prisma.bankAccount.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(banks);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
