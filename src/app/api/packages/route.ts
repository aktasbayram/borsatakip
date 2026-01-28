import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Find 'FREE' package locally or create a mock one if not in DB? 
        // Best approach: Return all active packages including FREE if we store it.
        // For now, let's assume we store FREE in DB too, or we merge it in frontend.
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        return NextResponse.json(packages);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
