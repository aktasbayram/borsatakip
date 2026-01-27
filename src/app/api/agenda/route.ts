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
