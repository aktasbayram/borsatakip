
import { db } from '@/lib/db';
import { RestrictedStockService } from '@/services/market/restricted-stock-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

async function getStocks() {
    return await RestrictedStockService.getRestrictedStocks();
}

export default async function RestrictedStocksPage() {
    const { stocks, lastUpdated } = await getStocks();

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* Elegant Header - Unified Style */}
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card dark:bg-slate-950 p-5 lg:p-7 border border-border dark:border-slate-800 shadow-2xl group transition-colors duration-300">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[250px] h-[250px] bg-red-500/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-red-500/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[250px] h-[250px] bg-amber-500/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 text-[8px] font-black uppercase tracking-[0.2em] border border-red-500/20">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            VBTS Kapsamı
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tighter leading-none text-foreground dark:text-white italic">
                            Tedbirli <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 pr-2">Hisseler</span>
                        </h1>
                        <p className="text-muted-foreground dark:text-slate-400 text-[11px] md:text-xs font-medium leading-relaxed max-w-xl">
                            Borsa İstanbul'da işlem gören ve çeşitli kısıtlamalar kapsamındaki güncel hisse listesi.
                        </p>
                    </div>

                    {lastUpdated && (
                        <div className="bg-muted/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl p-3 border border-border/50 dark:border-slate-800/50 flex flex-col items-end gap-0.5 min-w-[150px]">
                            <span className="text-[10px] uppercase font-black text-muted-foreground dark:text-slate-500 tracking-tighter">Son Güncelleme</span>
                            <span className="text-xl font-black text-foreground dark:text-white italic">{new Date(lastUpdated).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Information Alert */}
            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 backdrop-blur-sm">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />
                <div className="relative flex items-start gap-4">
                    <div className="p-2.5 bg-yellow-500/20 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-yellow-900 dark:text-yellow-500 text-lg">Yatırımcı Bilgilendirmesi</h3>
                        <p className="text-yellow-800/80 dark:text-yellow-500/70 mt-1 max-w-3xl leading-relaxed">
                            Bu listedeki hisseler Borsa İstanbul tarafından uygulanan Volatilite Bazlı Tedbir Sistemi (VBTS) kapsamındadır.
                            <strong> Kredili İşlem Yasağı</strong>, <strong>Brüt Takas</strong> ve <strong>Tek Fiyat</strong> gibi kısıtlamalar likidite riski oluşturabilir.
                        </p>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-card/80 backdrop-blur-xl rounded-[2rem] border border-border shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30 border-b border-border/50">
                                <TableRow className="hover:bg-transparent border-none uppercase tracking-wider text-[11px] font-bold text-muted-foreground/80">
                                    <TableHead className="h-14 px-8">Hisse & Şirket</TableHead>
                                    <TableHead className="h-14 text-center">Tarih Aralığı</TableHead>
                                    <TableHead className="h-14 text-center">Kredili</TableHead>
                                    <TableHead className="h-14 text-center">Brüt</TableHead>
                                    <TableHead className="h-14 text-center">Tek Fiyat</TableHead>
                                    <TableHead className="h-14 text-center">Emir Paketi</TableHead>
                                    <TableHead className="h-14 text-center">İnternet</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-muted rounded-full">
                                                    <Clock className="w-8 h-8 opacity-20" />
                                                </div>
                                                <span className="text-lg">Şu anda aktif tedbirli hisse bulunamadı.</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stocks.map((stock) => (
                                        <TableRow key={stock.id} className="group/row transition-all hover:bg-primary/5 border-b border-border/50 last:border-0 h-24">
                                            <TableCell className="px-8">
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-black font-mono tracking-tighter text-primary group-hover/row:scale-105 transition-transform origin-left">
                                                        {stock.code}
                                                    </span>
                                                    <span className="text-xs font-medium text-muted-foreground/60 truncate max-w-[200px]" title={stock.company}>
                                                        {stock.company || 'BIST Şirketi'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <div className="inline-flex flex-col items-center justify-center bg-muted/40 px-4 py-2 rounded-2xl border border-border group-hover/row:bg-card transition-colors">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 leading-none mb-1">Dönem</span>
                                                    <span className="text-sm font-bold tracking-tight whitespace-nowrap">
                                                        {stock.startDate} <span className="text-muted-foreground/40 px-1">—</span> {stock.endDate}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Measure Indicators */}
                                            {[stock.measureCredit, stock.measureGross, stock.measureSingle, stock.measureOrder, stock.measureNet].map((active, idx) => (
                                                <TableCell key={idx} className="text-center">
                                                    {active ? (
                                                        <div className="relative inline-flex items-center justify-center">
                                                            <div className="absolute inset-0 bg-red-500 blur-md opacity-20 group-hover/row:opacity-40 transition-opacity rounded-full"></div>
                                                            <div className="relative w-9 h-9 rounded-xl glass-card flex items-center justify-center border border-red-500/30 bg-red-500/20 shadow-inner group-hover/row:scale-110 transition-transform">
                                                                <svg className="w-5 h-5 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-9 h-9 mx-auto flex items-center justify-center text-muted-foreground/20">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground/50 italic px-4 leading-relaxed">
                * Bu bilgiler Fintables üzerinden otomatik senkronize edilmektedir. Gerçek zamanlı veriler için lütfen KAP duyurularını takip edin.
            </p>
        </div>
    );
}

