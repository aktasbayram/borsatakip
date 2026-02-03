
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
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Tedbirli Hisseler
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                        Borsa İstanbul'da işlem gören ve çeşitli kısıtlamalar kapsamındaki güncel hisse listesi.
                    </p>
                </div>
                {lastUpdated && (
                    <div className="flex items-center gap-3 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 text-xs font-semibold shadow-sm backdrop-blur-md transition-all hover:bg-emerald-500/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span>Veri Güncelliği: {new Date(lastUpdated).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                    </div>
                )}
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

