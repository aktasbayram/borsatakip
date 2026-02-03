'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Calculator, RotateCcw, Wallet, Info, ArrowUpRight, Target, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CeilingDay {
    day: number;
    price: number;
    value: number;
    profit: number;
    profitPercent: number;
}

export default function TavanSerisiPage() {
    const [price, setPrice] = useState<string>('');
    const [lots, setLots] = useState<string>('');
    const [results, setResults] = useState<CeilingDay[]>([]);
    const [summary, setSummary] = useState({ totalProfit: 0, finalValue: 0, totalPercent: 0, initialValue: 0 });

    const calculate = () => {
        const startPrice = parseFloat(price.replace(',', '.'));
        const lotCount = parseFloat(lots);

        if (isNaN(startPrice) || isNaN(lotCount) || startPrice <= 0 || lotCount <= 0) {
            setResults([]);
            return;
        }

        const data: CeilingDay[] = [];
        const initialValue = startPrice * lotCount;
        let precisePrice = startPrice;

        for (let i = 1; i <= 20; i++) {
            // Halkarz.com style: Accumulate precision
            precisePrice = precisePrice * 1.10;

            // Display Price: Rounded to 2 decimals
            const displayPrice = Math.round(precisePrice * 100) / 100;

            // Value & Profit: Calculated from precise price, then rounded to INTEGER (Halkarz style)
            const currentValuePrecise = precisePrice * lotCount;
            const currentValue = Math.round(currentValuePrecise);

            // Profit: Calculate from precise discrepancy then round
            const profit = Math.round(currentValuePrecise - initialValue);
            const profitPercent = Math.round(((currentValuePrecise - initialValue) / initialValue) * 100);

            data.push({
                day: i,
                price: displayPrice,
                value: currentValue,
                profit: profit,
                profitPercent: profitPercent
            });
        }

        setResults(data);
        if (data.length > 0) {
            const last = data[9]; // 10th day
            setSummary({
                totalProfit: last.profit,
                finalValue: last.value,
                totalPercent: last.profitPercent,
                initialValue: initialValue
            });
        }
    };

    const clear = () => {
        setPrice('');
        setLots('');
        setResults([]);
    };

    useEffect(() => {
        calculate();
    }, [price, lots]);

    const formatCurrency = (val: number, decimals: number = 2) => {
        return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);
    };

    return (
        <div className="min-h-screen space-y-10 max-w-7xl mx-auto pb-20 px-2 lg:px-4">
            {/* Elegant Header - More Compact Version */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 lg:p-8 text-white shadow-xl border border-white/5 mt-4">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-48 w-48 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-200">
                            <Calculator className="w-3 h-3" />
                            Halka Arz Aracı
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tighter leading-tight italic">
                            Tavan Serisi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 pr-2">Analizi</span>
                        </h1>
                        <p className="text-slate-400 text-sm lg:text-base font-medium leading-relaxed max-w-xl">
                            Borsa İstanbul'da halka arz olan veya tavan serisine başlayan hisselerinizin
                            <span className="text-white font-bold ml-1">potansiyel değerini</span> simüle edin.
                        </p>
                    </div>

                    {results.length > 0 && (
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col items-end gap-0.5 min-w-[170px]">
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">Başlangıç Sermayesi</span>
                            <span className="text-2xl font-black text-white">₺{formatCurrency(summary.initialValue, 0)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
                {/* Left Column: Calculation Panel */}
                <Card className="lg:col-span-4 border-none shadow-2xl bg-card/60 backdrop-blur-xl sticky top-24 overflow-hidden group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" />
                            Simülatör Girdileri
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">Hissenizin verilerini girerek analizi başlatın.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        <div className="grid gap-5">
                            <div className="space-y-2 group/input relative">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Hisse Fiyatı</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="h-14 bg-accent/30 border-none rounded-xl text-xl font-black pl-5 focus-visible:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 tracking-widest">TRY</div>
                                </div>
                            </div>

                            <div className="space-y-2 group/input relative">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Lot Sayısı (Adet)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={lots}
                                        onChange={(e) => setLots(e.target.value)}
                                        className="h-14 bg-accent/30 border-none rounded-xl text-xl font-black pl-5 focus-visible:ring-indigo-500 transition-all placeholder:text-slate-400"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 tracking-widest">LOT</div>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={clear}
                            className="w-full text-slate-500 hover:text-red-500 hover:bg-red-50/10 transition-all font-bold tracking-tight text-xs h-10 border border-slate-200/5 dark:border-white/5 rounded-lg"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-2" />
                            Girdileri Sıfırla
                        </Button>

                        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-xl shadow-indigo-500/20">
                            <h4 className="text-sm font-black uppercase tracking-tighter mb-4 opacity-90">Hızlı İpuçları</h4>
                            <ul className="space-y-3">
                                {[
                                    '10 tavan hisseyi ~2.5 katına çıkarır.',
                                    'Kazançlar kümülatif hesaplanır.',
                                    'BIST\'teki %10 marjı baz alınır.'
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs font-bold leading-tight">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white mt-1 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Dynamic Results Dashboard */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Visual Growth Cards */}
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                {
                                    label: '10. Gün Hedefi',
                                    value: `₺${formatCurrency(summary.finalValue, 0)}`,
                                    color: 'indigo',
                                    icon: Wallet,
                                    desc: 'Tahmini Portföy Değeri'
                                },
                                {
                                    label: 'Net Kâr',
                                    value: `+₺${formatCurrency(summary.totalProfit, 0)}`,
                                    color: 'emerald',
                                    icon: TrendingUp,
                                    desc: 'Sermaye Üzeri Kazanç'
                                },
                                {
                                    label: 'Yüzdesel Artış',
                                    value: `%${formatCurrency(summary.totalPercent, 0)}`,
                                    color: 'fuchsia',
                                    icon: Percent,
                                    desc: 'Toplam Getiri Oranı'
                                }
                            ].map((item, i) => (
                                <Card key={i} className="border-none shadow-xl bg-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                                    <div className={cn("h-1", {
                                        "bg-indigo-500": item.color === 'indigo',
                                        "bg-emerald-500": item.color === 'emerald',
                                        "bg-fuchsia-500": item.color === 'fuchsia',
                                    })} />
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                                            <div className={cn("p-2 rounded-lg bg-opacity-10", {
                                                "bg-indigo-500 text-indigo-500": item.color === 'indigo',
                                                "bg-emerald-500 text-emerald-500": item.color === 'emerald',
                                                "bg-fuchsia-500 text-fuchsia-500": item.color === 'fuchsia',
                                            })}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black tracking-tighter mb-1 font-mono">
                                            {item.value}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-accent/10">
                            <p className="text-slate-400 font-bold flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Verileri girerek simülasyonu başlatın
                            </p>
                        </div>
                    )}

                    {/* Precise Analytics Table */}
                    <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden">
                        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between bg-accent/20">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-black tracking-tight">Projeksiyon Tablosu</CardTitle>
                                <CardDescription className="text-xs font-bold leading-none">Günlük Kademe Analizi</CardDescription>
                            </div>
                            {results.length > 0 && (
                                <Badge variant="secondary" className="font-black bg-indigo-500/10 text-indigo-500 border-none py-1">
                                    20 Günlük Veri
                                </Badge>
                            )}
                        </div>
                        <div className="overflow-x-auto no-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-900/5 dark:bg-accent/5">
                                    <TableRow className="hover:bg-transparent border-b border-white/5">
                                        <TableHead className="w-[120px] text-center font-black text-xs uppercase tracking-widest text-slate-500">KADEME</TableHead>
                                        <TableHead className="text-right font-black text-xs uppercase tracking-widest text-slate-500">HİSSE FİYATI</TableHead>
                                        <TableHead className="text-right font-black text-xs uppercase tracking-widest text-slate-500">DEĞER</TableHead>
                                        <TableHead className="text-right font-black text-xs uppercase tracking-widest text-indigo-500">KAZANÇ</TableHead>
                                        <TableHead className="text-right font-black text-xs uppercase tracking-widest text-emerald-500">GÜNLÜK %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.length > 0 ? (
                                        results.map((row, idx) => (
                                            <TableRow
                                                key={row.day}
                                                className={cn("transition-colors group", idx < 10 ? "hover:bg-indigo-500/5" : "hover:bg-fuchsia-500/5")}
                                            >
                                                <TableCell className="text-center">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm",
                                                        idx < 10 ? "bg-indigo-500 text-white" : "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400"
                                                    )}>
                                                        {row.day}. TAVAN
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right py-4">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-base font-black font-mono">₺{formatCurrency(row.price)}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold leading-none">Hisse Başına</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-base font-black font-mono tracking-tight text-foreground">₺{formatCurrency(row.value, 0)}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold leading-none">Toplam Varlık</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1.5 font-black font-mono text-indigo-600 dark:text-indigo-400">
                                                        <span>+₺{formatCurrency(row.profit, 0)}</span>
                                                        <div className="p-1 rounded-full bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs min-w-[50px]">
                                                        %{formatCurrency(row.profitPercent, 0)}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center animate-pulse">
                                                <p className="text-slate-500 text-sm font-bold italic tracking-wide">
                                                    Simülasyon hesaplanıyor...
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Note Box */}
                    <div className="flex items-start gap-4 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                            <Info className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h5 className="font-black text-sm text-amber-700 dark:text-amber-500 leading-none">Risk ve Hesaplama Bildirimi</h5>
                            <p className="text-xs text-amber-700/70 dark:text-amber-500/60 font-medium leading-relaxed">
                                Bu hesaplamalar matematiksel projeksiyonlardır. Borsa İstanbul emir eşleşme kuralları, fiyat adımları ve ağırlıklı ortalama baz alınarak
                                değişkenlik gösterebilir. Yatırım tavsiyesi değildir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Footer Background Text */}
            <div className="text-center pt-10 select-none opacity-20 pointer-events-none">
                <span className="text-[100px] font-black tracking-tighter text-slate-500/10 inline-block rotate-1 mt-10">BORSATAKIP</span>
            </div>
        </div>
    );
}
