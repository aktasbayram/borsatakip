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
    countryCode: 'TR' | 'US' | 'EU' | 'CA' | 'CN' | 'JP' | 'GB' | 'DE';
    title: string;
    expectation?: string;
    actual?: string;
    impact: 'low' | 'medium' | 'high';
    symbol?: string;
    imageUrl?: string;
}

const FlagIcon = ({ code }: { code: AgendaItem['countryCode'] }) => {
    // Map country codes to circle-flags URL format
    const codeMap: Record<string, string> = {
        'TR': 'tr',
        'US': 'us',
        'EU': 'eu',
        'CA': 'ca',
        'CN': 'cn',
        'DE': 'de',
        'GB': 'gb',
        'JP': 'jp'
    };
    const countryKey = codeMap[code] || 'un'; // Default to UN flag if unknown

    return (
        <img
            src={`https://hatscripts.github.io/circle-flags/flags/${countryKey}.svg`}
            alt={code}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
        />
    );
};

export function AgendaWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'agenda' | 'earnings'>('agenda');
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

    const handlePrevDay = () => {
        setCurrentDate(prev => {
            const day = prev.getDay();
            // If Monday (1), go back to Friday (subtract 3 days)
            // If Sunday (0), go back to Friday (subtract 2 days) - edge case handling
            if (day === 1) return subDays(prev, 3);
            if (day === 0) return subDays(prev, 2);
            return subDays(prev, 1);
        });
    };

    const handleNextDay = () => {
        setCurrentDate(prev => {
            const day = prev.getDay();
            // If Friday (5), jump to Monday (add 3 days)
            // If Saturday (6), jump to Monday (add 2 days)
            if (day === 5) return addDays(prev, 3);
            if (day === 6) return addDays(prev, 2);
            return addDays(prev, 1);
        });
    };
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
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10">
                        <div className="flex items-center gap-6">
                            <span className="text-sm font-bold text-foreground">
                                Ajanda
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={handlePrevDay}
                                title="Önceki Gün"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                {items
                                    .map((item) => (
                                        <div key={item.id} className="group flex items-start gap-3 p-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">

                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                {/* Time Column - Fixed Width */}
                                                <span className="text-xs font-mono font-medium text-foreground/80 min-w-[2rem] shrink-0">
                                                    {item.time}
                                                </span>

                                                {/* Logo/Icon Column - Between Time and Text */}
                                                <div className="relative shrink-0">
                                                    {(() => {
                                                        // Ensure hasImage is true ONLY if it's a real logo, not a fallback url from DB
                                                        const hasImage = !!item.imageUrl && !item.imageUrl.includes('ui-avatars') && !item.imageUrl.includes('null') && !item.imageUrl.includes('undefined');

                                                        const sym = item.symbol ? item.symbol.trim() : '';

                                                        // BLOCKLIST: Explicitly block macro terms/country codes
                                                        const isMacro = ['ABD', 'PMI', 'ISM', 'ECB', 'FED', 'GSY', 'TÜFE', 'ÜFE', 'JOLTS', 'ADP', 'US', 'USD', 'TR', 'TRY', 'EU', 'EUR'].some(b => sym === b || sym.includes(b));

                                                        // Valid ticker rules:
                                                        // 1. > 2 chars
                                                        // 2. Not in macro blocklist
                                                        // 3. Not matching country code (e.g. "US" == "US")
                                                        // 4. Not 'null'/'undefined' string
                                                        const isValidTicker = sym.length > 2
                                                            && !isMacro
                                                            && sym !== item.countryCode
                                                            && sym.toLowerCase() !== 'null'
                                                            && sym.toLowerCase() !== 'undefined';

                                                        const shouldShowImage = hasImage || isValidTicker;

                                                        if (shouldShowImage) {
                                                            return (
                                                                <div className="w-6 h-6 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-white shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center p-0.5">
                                                                    <img
                                                                        src={item.imageUrl || `https://static.fintables.com/logos/${sym}.png`}
                                                                        alt={sym || 'logo'}
                                                                        className="w-full h-full object-contain"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            if (!target.src.includes('ui-avatars')) {
                                                                                target.src = `https://ui-avatars.com/api/?name=${sym || '?'}&background=random&color=fff&bold=true`;
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="w-6 h-6 flex items-center justify-center scale-110 origin-center bg-gray-50 dark:bg-gray-900 rounded-lg p-0.5 group-hover:bg-primary/5 transition-colors">
                                                                    <FlagIcon code={item.countryCode} />
                                                                </div>
                                                            );
                                                        }
                                                    })()}
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
