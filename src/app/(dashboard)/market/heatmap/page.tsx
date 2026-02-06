import { MarketHeatmap } from "@/components/dashboard/MarketHeatmap";
import { Activity, Flame } from "lucide-react";

export const metadata = {
    title: 'Piyasa Isı Haritası | BorsaTakip',
    description: 'BIST 30 ve BIST 100 Endeksi anlık piyasa ısı haritası, sektör bazlı yükselen ve düşen hisseler.',
};

export default function HeatmapPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* Elegant Header - Match Reference Style Exactly */}
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card dark:bg-slate-950 p-5 lg:p-7 border border-border dark:border-slate-800 shadow-2xl group transition-colors duration-300">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[250px] h-[250px] bg-violet-500/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-violet-500/10 transition-colors duration-1000"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] border border-primary/20 shadow-sm">
                            <Activity className="w-3 h-3" />
                            Piyasa Analiz Aracı
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tighter leading-none text-foreground dark:text-white italic flex items-center gap-3">
                            Piyasa <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500 pr-2">Isı Haritası</span>
                            <div className="relative flex items-center justify-center translate-y-1">
                                {/* Layered "Burning" Effect */}
                                <Flame className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600 fill-orange-600/40 blur-[1px] animate-pulse absolute" />
                                <Flame className="w-6 h-6 lg:w-7 lg:h-7 text-orange-400 fill-orange-400/20 animate-bounce transition-all duration-1000" />
                                <Flame className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 fill-yellow-200/50 absolute bottom-0 animate-ping opacity-30" />
                                <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse"></div>
                            </div>
                        </h1>
                        <p className="text-muted-foreground dark:text-slate-400 text-[11px] md:text-xs font-medium leading-relaxed max-w-2xl">
                            Borsa İstanbul'un nabzını görselleştirin. Hisselerin performansını,
                            <span className="text-foreground dark:text-white font-bold mx-1">anlık</span>
                            renk yoğunluklarıyla bir bakışta analiz edin.
                        </p>
                    </div>

                    <div className="hidden lg:flex flex-col gap-4">
                        <div className="bg-muted/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-3 border border-border/50 dark:border-slate-800/50 flex flex-col items-end gap-0.5 shadow-inner">
                            <span className="text-[10px] uppercase font-black text-muted-foreground dark:text-slate-500 tracking-[0.15em] leading-none">Canlı Takip</span>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse"></div>
                                <span className="text-xl font-black text-foreground dark:text-white italic tracking-tighter transition-all duration-300">BIST 100 / 30</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Heatmap Tool Section */}
            <div className="w-full">
                <MarketHeatmap />
            </div>

            {/* Info Section - Modernized */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-border/40">
                {[
                    {
                        title: 'Neyi Gösterir?',
                        text: 'Hisse senetlerinin günlük yüzde değişimlerini alan bazlı görselleştirir. Kutuların boyutu denge içindir, renkleri ise performansın gücünü gösterir.',
                        icon: Activity
                    },
                    {
                        title: 'Güncelleme Sıklığı',
                        text: 'Veriler sistemimiz tarafından 60 saniyede bir otomatik olarak tazelenir. Piyasa hareketlerini gecikmesiz takip etmenizi sağlar.',
                        icon: Activity // Simplified for now
                    },
                    {
                        title: 'Renklerin Dili',
                        text: 'Koyu yeşil güçlü alımları, koyu kırmızı ise sert satışları temsil eder. Ara tonlar oynaklık seviyesini belirler.',
                        icon: Activity // Simplified for now
                    }
                ].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:bg-card/60 transition-colors">
                        <h3 className="text-base font-black tracking-tight text-primary mb-2 flex items-center gap-2 italic uppercase">
                            <item.icon className="w-4 h-4 opacity-50" />
                            {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            {item.text}
                        </p>
                    </div>
                ))}
            </div>

            {/* Sub-Footer Background Text */}
            <div className="text-center pt-10 select-none opacity-20 pointer-events-none">
                <span className="text-[100px] font-black tracking-tighter text-slate-500/10 inline-block rotate-1 mt-10">BORSATAKIP</span>
            </div>
        </div>
    );
}
