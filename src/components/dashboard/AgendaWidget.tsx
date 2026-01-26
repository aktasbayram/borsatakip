"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface AgendaItem {
    id: string;
    time: string;
    countryCode: 'TR' | 'US' | 'EU' | 'CA' | 'CN';
    title: string;
    expectation?: string;
    actual?: string;
    impact: 'low' | 'medium' | 'high';
}

const mockAgendaItems: AgendaItem[] = [
    {
        id: '1',
        time: '10:00',
        countryCode: 'TR',
        title: 'TÜİK Tüketici Güven Endeksi',
        expectation: '78.5',
        impact: 'medium'
    },
    {
        id: '2',
        time: '14:00',
        countryCode: 'TR',
        title: 'TCMB Faiz Kararı',
        expectation: '%45.00',
        impact: 'high'
    },
    {
        id: '3',
        time: '15:30',
        countryCode: 'US',
        title: 'ABD Tarım Dışı İstihdam',
        expectation: '180K',
        impact: 'high'
    },
    {
        id: '4',
        time: '16:00',
        countryCode: 'US',
        title: 'İşsizlik Oranı',
        expectation: '3.8%',
        impact: 'high'
    },
    {
        id: '5',
        time: '17:00',
        countryCode: 'US',
        title: 'ISM İmalat Endeksi',
        expectation: '49.5',
        impact: 'medium'
    },
    {
        id: '6',
        time: '17:30',
        countryCode: 'US',
        title: 'Ham Petrol Stokları',
        expectation: '-2.5M',
        impact: 'medium'
    },
    {
        id: '7',
        time: '21:00',
        countryCode: 'US',
        title: 'FOMC Toplantı Tutanakları',
        impact: 'high'
    }
];

const FlagIcon = ({ code }: { code: AgendaItem['countryCode'] }) => {
    const flags: Record<string, string> = {
        'TR': '🇹🇷',
        'US': '🇺🇸',
        'EU': '🇪🇺',
        'CA': '🇨🇦',
        'CN': '🇨🇳'
    };
    return <span className="text-xl leading-none">{flags[code] || '🌐'}</span>;
};

export function AgendaWidget() {
    const today = new Date();
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgenda = async () => {
            try {
                const response = await axios.get('/api/agenda');
                setItems(response.data);
            } catch (error) {
                console.error('Agenda fetch failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgenda();
    }, []);

    return (
        <div className="bg-[#1e1e1e] text-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-800 h-[320px] flex">
            {/* Left Box: Date */}
            <div className="w-24 bg-[#252525] flex flex-col items-center justify-center border-r border-gray-800 p-2 shrink-0">
                <div className="text-4xl font-bold text-white mb-1">
                    {format(today, 'dd')}
                </div>
                <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                    {format(today, 'MMM', { locale: tr })}
                </div>
                <div className="mt-4 text-xs text-center text-gray-500 font-semibold px-2">
                    AJANDA
                </div>
            </div>

            {/* Right Box: Events List */}
            <div className="flex-1 min-w-0">
                <div className="h-full flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#252525]/50">
                        <h3 className="font-semibold text-white text-sm">Günün Önemli Olayları</h3>
                        <div className="flex gap-2 text-xs">
                            <span className="text-gray-500">&lt;</span>
                            <span className="text-gray-500">&gt;</span>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mr-2"></div>
                                Yükleniyor...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                Bugün için veri bulunamadı.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors">
                                        <div className="text-sm font-mono text-gray-400 pt-0.5 w-12 shrink-0">
                                            {item.time}
                                        </div>
                                        <div className="pt-0.5 shrink-0">
                                            <FlagIcon code={item.countryCode} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-200 truncate">
                                                {item.title}
                                            </div>
                                            <div className="flex gap-3 mt-1">
                                                {item.expectation && (
                                                    <div className="text-xs text-gray-500 font-medium">
                                                        Beklenti: <span className="text-gray-400">{item.expectation}</span>
                                                    </div>
                                                )}
                                                {item.actual && (
                                                    <div className="text-xs text-green-400 font-medium bg-green-900/20 px-1.5 rounded">
                                                        Açıklanan: {item.actual}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${item.impact === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                            item.impact === 'medium' ? 'bg-orange-500' : 'bg-gray-500'
                                            }`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
