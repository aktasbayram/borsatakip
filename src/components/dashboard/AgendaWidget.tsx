"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgendaItem {
    id: string;
    time: string;
    countryCode: 'TR' | 'US' | 'EU' | 'CA' | 'CN';
    title: string;
    expectation?: string;
    actual?: string;
    impact: 'low' | 'medium' | 'high';
}

const FlagIcon = ({ code }: { code: AgendaItem['countryCode'] }) => {
    const flags: Record<string, string> = {
        'TR': '🇹🇷',
        'US': '🇺🇸',
        'EU': '🇪🇺',
        'CA': '🇨🇦',
        'CN': '🇨🇳',
        'DE': '🇩🇪',
        'GB': '🇬🇧',
        'JP': '🇯🇵'
    };
    return <span className="text-lg leading-none select-none" title={code}>{flags[code] || '🌐'}</span>;
};

export function AgendaWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgenda = async () => {
            setLoading(true);
            try {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                const response = await axios.get(`/api/agenda?date=${dateStr}`);
                setItems(response.data);
            } catch (error) {
                console.error('Agenda fetch failed', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAgenda();
    }, [currentDate]);

    const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
    const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));
    const isToday = isSameDay(currentDate, new Date());

    return (
        <Card className="h-[280px] flex flex-col shadow-sm border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Date Display */}
                <div className="w-20 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-2 shrink-0">
                    <span className="text-3xl font-bold text-primary tracking-tighter">
                        {format(currentDate, 'dd')}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                        {format(currentDate, 'MMM', { locale: tr })}
                    </span>
                    <span className="text-[10px] font-semibold text-primary/80 mt-2 px-1.5 py-0.5 bg-primary/10 rounded-full">
                        {isToday ? 'BUGÜN' : format(currentDate, 'ccc', { locale: tr })}
                    </span>
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm text-foreground">Ekonomik Takvim</h3>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handlePrevDay}
                                title="Önceki Gün"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleNextDay}
                                title="Sonraki Gün"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mb-2"></div>
                                <span className="text-[10px]">Yükleniyor...</span>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-4 gap-1">
                                <Calendar className="w-6 h-6 opacity-20" />
                                <span className="text-xs">Veri bulunamadı.</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map((item) => (
                                    <div key={item.id} className="group flex items-start gap-3 p-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">

                                        {/* Time & Flag */}
                                        <div className="flex flex-col items-center gap-0.5 min-w-[2.5rem] pt-0.5">
                                            <span className="text-xs font-mono font-medium text-foreground/80">
                                                {item.time}
                                            </span>
                                            <div className="scale-90 origin-top">
                                                <FlagIcon code={item.countryCode} />
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.title}
                                                </p>
                                                {/* Impact Indicator */}
                                                {item.impact === 'high' && (
                                                    <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3.5 shrink-0">
                                                        !!!
                                                    </Badge>
                                                )}
                                                {item.impact === 'medium' && (
                                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 shrink-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100">
                                                        !!
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                                {item.expectation && (
                                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1 py-0 rounded">
                                                        Beklenti: <span className="font-semibold text-foreground">{item.expectation}</span>
                                                    </span>
                                                )}
                                                {item.actual && (
                                                    <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-1 py-0 rounded border border-green-200 dark:border-green-900/50">
                                                        Açıklanan: <span className="font-semibold">{item.actual}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </Card>
    );
}
