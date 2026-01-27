"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Layers, Coins, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IpoItem {
    code: string;
    company: string;
    date: string;
    price: string;
    lotCount: string;
    market: string;
    url: string;
    imageUrl: string;
    distributionMethod: string;
    isNew?: boolean;
}

export function IpoWidget() {
    const [ipos, setIpos] = useState<IpoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIpos = async () => {
            try {
                const response = await axios.get('/api/market/ipos');
                setIpos(response.data);
            } catch (error) {
                console.error('Failed to fetch IPOs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchIpos();
    }, []);

    return (
        <Card className="h-[320px] flex flex-col shadow-sm border-gray-100 dark:border-gray-800">
            <CardHeader className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-semibold">Halka Arzlar (Yeni)</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                <ScrollArea className="h-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 p-8 text-muted-foreground">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <span className="text-xs">Veriler Yükleniyor...</span>
                        </div>
                    ) : ipos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground gap-2">
                            <Building2 className="w-8 h-8 opacity-20" />
                            <span className="text-xs">Aktif halka arz bulunamadı.</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {ipos.map((ipo, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* Logo or Placeholder */}
                                        <div className="w-12 h-12 rounded-lg bg-white p-1 border border-gray-100 dark:border-gray-800 shrink-0 overflow-hidden flex items-center justify-center">
                                            {ipo.imageUrl ? (
                                                <img src={ipo.imageUrl} alt={ipo.code} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-xs font-bold">{ipo.code}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2 min-w-0">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/market/ipo/${ipo.url.split('/').filter(Boolean).pop()}`}
                                                            className="hover:underline decoration-primary underline-offset-4"
                                                        >
                                                            <h4 className="font-bold text-sm tracking-tight">{ipo.company}</h4>
                                                        </Link>
                                                        {ipo.isNew && (
                                                            <Badge className="h-4 px-1 text-[9px] bg-green-500 hover:bg-green-600">YENİ</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-normal border-gray-200 dark:border-gray-700 text-muted-foreground">
                                                            {ipo.code}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">{ipo.market}</span>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/market/ipo/${ipo.url.split('/').filter(Boolean).pop()}`}
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>

                                            {/* Grid Details */}
                                            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-900/40 p-2 rounded-md border border-gray-100 dark:border-gray-800/50">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Fiyat</span>
                                                    <span className="font-semibold text-foreground">{ipo.price}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tarih</span>
                                                    <span className="font-semibold text-foreground">{ipo.date}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5 col-span-2">
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Notlar</span>
                                                    <span className="text-muted-foreground line-clamp-1">{ipo.lotCount} • {ipo.distributionMethod}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
