"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Search,
    FileText,
    Calendar,
    Building2,
    ExternalLink,
    RefreshCcw,
    AlertCircle,
    Bell,
    ArrowRight,
    Clock,
    Sparkles,
    Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Disclosure {
    id: string;
    title: string;
    date: string;
    summary: string;
    url: string;
    companyCode?: string;
    disclosureType?: string;
}

export default function KapPage() {
    const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);

    const fetchDisclosures = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await fetch('/api/market/kap');
            const result = await response.json();

            if (result.success) {
                setDisclosures(result.data);
                setError(null);
            } else {
                setError(result.error || "Bildirimler alınamadı.");
            }
        } catch (err) {
            setError("Sunucuya bağlanılamadı.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDisclosures();
        const interval = setInterval(() => fetchDisclosures(true), 120000); // Auto refresh every 2 mins
        return () => clearInterval(interval);
    }, [fetchDisclosures]);

    const filteredDisclosures = disclosures.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.companyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* Elegant Header - Compact & Theme Aware */}
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card dark:bg-slate-950 p-5 lg:p-7 border border-border dark:border-slate-800 shadow-2xl group transition-colors duration-300">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[250px] h-[250px] bg-fuchsia-500/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-fuchsia-500/10 transition-colors duration-1000"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] border border-primary/20">
                            <Sparkles className="w-2.5 h-2.5" />
                            Canlı Veri Akışı
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tighter leading-none text-foreground dark:text-white italic">
                            KAP <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500 pr-2">Bildirimleri</span>
                        </h1>
                        <p className="text-muted-foreground dark:text-slate-400 text-[11px] md:text-xs font-medium leading-relaxed max-w-xl">
                            Kamuoyu Aydınlatma Platformu'na düşen en güncel haberleri ve
                            <span className="text-foreground dark:text-white font-bold ml-1">şirket duyurularını</span> anlık olarak takip edin.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group/search">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                            <Input
                                placeholder="Şirket veya içerik ara..."
                                className="pl-9 bg-muted/50 dark:bg-slate-900/50 border-border/50 dark:border-slate-800/50 w-full md:w-[260px] h-10 rounded-xl focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-xl bg-muted/50 dark:bg-slate-900/50 border-border/50 dark:border-slate-800/50"
                            onClick={() => fetchDisclosures(true)}
                            disabled={refreshing}
                        >
                            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <Bell className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-tight">MKK sunucularına bağlanılıyor...</p>
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-foreground">Veri Alınamadı</h3>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchDisclosures(true)}>
                        Tekrar Dene
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredDisclosures.length > 0 ? (
                        filteredDisclosures.map((item) => (
                            <Card key={item.id} className="group border-border/50 dark:border-slate-800/50 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 bg-card/50 dark:bg-slate-900/40 hover:shadow-xl backdrop-blur-sm overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                                        {/* Company Icon Area */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-border/50 dark:border-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <Building2 className="w-6 h-6 text-primary/70" />
                                            </div>
                                        </div>

                                        <div className="flex-grow space-y-1.5 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className="font-black text-[10px] bg-primary/5 text-primary border-primary/20 rounded-md">
                                                    {item.companyCode || "KAP"}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(item.date), "HH:mm", { locale: tr })}
                                                    <span className="mx-1 opacity-20">•</span>
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(item.date), "d MMMM yyyy", { locale: tr })}
                                                </div>
                                            </div>
                                            <h3 className="text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 italic tracking-tight">
                                                {item.title}
                                            </h3>
                                            <p className="text-[11px] md:text-xs text-muted-foreground dark:text-slate-400 line-clamp-2 md:line-clamp-1 font-medium leading-relaxed">
                                                {item.summary}
                                            </p>
                                        </div>

                                        <div className="flex md:flex-col items-center md:items-end justify-between gap-3 mt-2 md:mt-0">
                                            {item.disclosureType && (
                                                <Badge variant="secondary" className="text-[9px] font-bold bg-muted/50 text-muted-foreground border-transparent">
                                                    {item.disclosureType}
                                                </Badge>
                                            )}
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-4 rounded-lg bg-primary/5 hover:bg-primary text-primary hover:text-white transition-all duration-300 gap-2 border border-primary/10"
                                            >
                                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                    <span className="text-[11px] font-black uppercase tracking-tighter">İncele</span>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-indigo-500 via-primary to-fuchsia-500 transition-all duration-700 opacity-50" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/20 dark:bg-slate-900/20 rounded-2xl border border-dashed border-border dark:border-slate-800">
                            <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">Aradığınız kriterlere uygun bildirim bulunamadı.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Alert */}
            {!loading && !error && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    Veriler MKK API Portal üzerinden resmi olarak sağlanmaktadır. Gecikme yaşanabilir.
                </div>
            )}
        </div>
    );
}
