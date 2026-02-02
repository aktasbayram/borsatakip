import { NextResponse } from 'next/server';
import { AgendaService } from '@/services/agenda/agenda-service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        // Default to today if no date provided
        const targetDate = date || new Date().toISOString().split('T')[0];

        const agendaItems = await AgendaService.getDailyAgenda(targetDate);
        return NextResponse.json(agendaItems);
    } catch (error) {
        console.error('Failed to fetch agenda:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agenda items' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.action === 'create') {
            const newItem = await AgendaService.addManualEvent(body.data);
            return NextResponse.json({ success: true, item: newItem });
        }

        if (body.action === 'reorder') {
            await AgendaService.reorder(body.items);
            return NextResponse.json({ success: true });
        }

        // Default: Trigger manual sync
        const { date } = body;
        const count = await AgendaService.syncDailyAgenda(date);
        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error('Failed to process agenda request:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, data } = body;

        if (!id || !data) {
            return NextResponse.json(
                { error: 'ID and data required' },
                { status: 400 }
            );
        }

        const updated = await AgendaService.updateEvent(id, data);
        return NextResponse.json({ success: true, item: updated });
    } catch (error) {
        console.error('Failed to update agenda item:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            );
        }

        await AgendaService.deleteEvent(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete agenda item:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}
