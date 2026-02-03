
import { NextResponse } from 'next/server';
import { RestrictedStockService } from '@/services/market/restricted-stock-service';
import { auth } from '@/lib/auth';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function GET(request: Request) {
    try {
        const stocks = await RestrictedStockService.getRestrictedStocks();
        return NextResponse.json(stocks);
    } catch (error) {
        console.error('Failed to fetch restricted stocks:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();

        if (body.action === 'sync') {
            const stats = await RestrictedStockService.syncRestrictedStocks();
            revalidateTag('restricted-stocks');
            revalidatePath('/admin/restricted');
            revalidatePath('/market/restricted');
            return NextResponse.json(stats);
        }

        if (body.action === 'reorder') {
            await RestrictedStockService.reorder(body.items);
            revalidateTag('restricted-stocks');
            revalidatePath('/admin/restricted');
            revalidatePath('/market/restricted');
            return NextResponse.json({ success: true });
        }

        return new NextResponse('Invalid Action', { status: 400 });

    } catch (error) {
        console.error('Failed to process request:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return new NextResponse('ID required', { status: 400 });

        await RestrictedStockService.delete(id);
        revalidateTag('restricted-stocks');
        revalidatePath('/admin/restricted');
        revalidatePath('/market/restricted');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
