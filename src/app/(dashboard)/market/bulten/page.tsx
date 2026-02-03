
import { MarketSummaryService } from "@/services/market/market-summary-service";
import { TrendingUp, TrendingDown, Clock, Calendar, Zap, AlertCircle, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getBultenData() {
    const today = new Date().toISOString().split('T')[0];
    return await MarketSummaryService.getSummary(today);
}

export default async function BultenPage() {
    const summary = await getBultenData();
    const data = summary?.data || { indices: [], movers: { gainers: [], losers: [], active: [] }, events: [], ipos: [] };
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });

    // Dynamic Market Status Logic
    const getMarketStatus = () => {
        const now = new Date();
        const trTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
        const hours = trTime.getHours();
        const minutes = trTime.getMinutes();
        const day = trTime.getDay(); // 0: Sun, 6: Sat

        if (day === 0 || day === 6) return "Hafta Sonu - Piyasalar Kapalı";

        const timeVal = hours * 100 + minutes;

        if (timeVal < 900) return "Piyasalar Kapalı";
        if (timeVal >= 900 && timeVal < 1000) return "Açılış Yaklaşırken";
        if (timeVal >= 1000 && timeVal < 1800) return "Piyasalar Açık";
        if (timeVal >= 1800 && timeVal < 1810) return "Kapanış Seansı";
        return "Piyasa Kapandı";
    };

    const marketStatus = getMarketStatus();

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Editorial Header */}
            <div className="relative pt-6 pb-2 text-center space-y-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.04)_0%,transparent_70%)] -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Zap className="w-3 h-3 fill-primary" />
                    Piyasa Gündemi
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    GÜNÜN <span className="text-primary italic">BÜLTENİ</span>
                </h1>

                <div className="flex items-center justify-center gap-4 text-muted-foreground font-medium text-sm md:text-base">
                    <span>{dateStr}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {marketStatus}
                    </span>
                </div>
            </div>

            {/* Editor's Featured Note - The Highlight */}
            {summary?.editorNote && (
                <div className="relative group max-w-3xl mx-auto px-4">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-[2rem] blur-lg opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-card/60 backdrop-blur-2xl border border-primary/20 rounded-[2rem] p-6 md:p-10 shadow-xl">
                        <div className="absolute top-0 left-8 -translate-y-1/2 bg-primary px-4 py-1.5 rounded-xl text-primary-foreground text-[10px] font-black tracking-widest uppercase shadow-lg">
                            Editörün Notu
                        </div>
                        <p className="text-lg md:text-xl font-serif italic text-foreground/90 leading-relaxed text-center">
                            "{summary.editorNote}"
                        </p>
                    </div>
                </div>
            )}

            {/* Market Snapshot - Quick Indices */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {data.indices.map((idx: any, i: number) => (
                    <div key={i} className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-5 hover:border-primary/30 transition-all hover:bg-card">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{idx.name}</p>
                        <div className="flex items-end justify-between">
                            <span className="text-lg font-black tracking-tight">{idx.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                            <span className={`text-xs font-black ${idx.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent?.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Top Movers */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Gainers */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                                En Çok Yükselenler
                            </h3>
                            <div className="space-y-3">
                                {data.movers?.gainers?.map((stock: any, i: number) => (
                                    <MoverRow key={i} stock={stock} color="emerald" />
                                ))}
                            </div>
                        </div>

                        {/* Losers */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                <TrendingDown className="w-6 h-6 text-red-500" />
                                En Çok Düşenler
                            </h3>
                            <div className="space-y-3">
                                {data.movers?.losers?.map((stock: any, i: number) => (
                                    <MoverRow key={i} stock={stock} color="red" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Most Active - Full Width in this Col */}
                    <div className="bg-muted/30 rounded-[3rem] p-8 md:p-12 border border-border/50">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <h3 className="text-3xl font-black tracking-tight">Hacim Liderleri</h3>
                            <p className="text-muted-foreground font-medium">Borsa İstanbul'da bugün en çok işlem gören hisseler.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {data.movers?.active && data.movers.active.length > 0 ? data.movers.active.map((stock: any, i: number) => (
                                <div key={i} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-center">
                                    <p className="text-lg font-black text-primary mb-1">{stock.code}</p>
                                    <p className="text-xs font-bold text-muted-foreground/60 mb-2">{stock.price} TL</p>
                                    <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase">
                                        {(() => {
                                            const val = parseFloat(stock.volume.replace(/\./g, '').replace(',', '.'));
                                            if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Milyar`;
                                            if (val >= 1000000) return `${(val / 1000000).toFixed(2)} Milyon`;
                                            return stock.volume;
                                        })()}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-10 text-center text-muted-foreground/50 text-xs italic">
                                    Aktif hacim verisi bulunamadı.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Ajanda & IPO */}
                <div className="space-y-10">
                    {/* Events */}
                    <div className="bg-card/50 border border-border/50 rounded-[2.5rem] p-8 shadow-xl">
                        <h3 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-500" />
                            Günün Ajandası
                        </h3>
                        <div className="space-y-6">
                            {data.events?.length > 0 ? data.events.map((event: any, i: number) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                                        <div className="w-0.5 h-full bg-blue-500/10 mt-1"></div>
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{event.time}</p>
                                        <p className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{event.title}</p>
                                        <div className="flex gap-2 mt-2">
                                            {event.importance === 'high' && <Badge variant="destructive" className="text-[8px] h-4">KRİTİK</Badge>}
                                            <Badge variant="outline" className="text-[8px] h-4 uppercase">{event.currency || 'TRY'}</Badge>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-muted-foreground italic bg-muted/20 p-4 rounded-2xl text-center">Bugün kritik bir ekonomik veri akışı bulunmuyor.</div>
                            )}
                        </div>
                    </div>

                    {/* IPOs */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl text-white overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <h3 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-3 relative z-10">
                            <Rocket className="w-6 h-6" />
                            Halka Arzlar
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {data.ipos?.length > 0 ? data.ipos.map((ipo: any, i: number) => (
                                <div key={i} className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all cursor-default">
                                    <p className="text-md font-black">{ipo.code}</p>
                                    <p className="text-xs font-medium text-white/60 mb-2 truncate">{ipo.company}</p>
                                    <p className="text-[10px] font-black text-indigo-200 uppercase">{ipo.statusText || 'Gündemde'}</p>
                                </div>
                            )) : (
                                <div className="text-xs text-white/60 italic border border-white/10 rounded-2xl p-4">Aktif halka arz başvurusu bulunmuyor.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function MoverRow({ stock, color }: { stock: any, color: 'emerald' | 'red' }) {
    const isEmerald = color === 'emerald';
    return (
        <div className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isEmerald ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                    {stock.code?.substring(0, 1)}
                </div>
                <div>
                    <p className="font-black text-sm tracking-tight">{stock.code}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{stock.price} TL</p>
                </div>
            </div>
            <div className={`text-sm font-black ${isEmerald ? 'text-emerald-500' : 'text-red-500'}`}>
                {stock.change}
            </div>
        </div>
    );
}
