import { NextResponse } from 'next/server';
import { AgendaService } from '@/services/agenda/agenda-service';

export async function GET() {
    try {
        const agendaItems = await AgendaService.getDailyAgenda();
        return NextResponse.json(agendaItems);
    } catch (error) {
        console.error('Failed to fetch agenda:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agenda items' },
            { status: 500 }
        );
    }
}
