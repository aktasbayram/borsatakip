"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import axios from "axios";
import { cn } from "@/lib/utils";
import { X, Target, Zap, Clock, Search, ChevronDown, BellPlus } from "lucide-react";

interface CreateAlertDialogProps {
    open: boolean;
    onClose: () => void;
    defaultSymbol?: string;
    defaultMarket?: "BIST" | "US";
}

export function CreateAlertDialog({ open, onClose, defaultSymbol = "", defaultMarket }: CreateAlertDialogProps) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    // Form States
    const [symbol, setSymbol] = useState(defaultSymbol);
    const [market, setMarket] = useState<"BIST" | "US">(defaultMarket || "BIST");
    const [type, setType] = useState<"PRICE_ABOVE" | "PRICE_BELOW">("PRICE_ABOVE");
    const [target, setTarget] = useState("");

    // Search States
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setSymbol(defaultSymbol);
    }, [defaultSymbol]);

    useEffect(() => {
        setMarket((defaultMarket || "BIST") as "BIST" | "US");
    }, [defaultMarket]);

    useEffect(() => {
        if (!open) {
            setSymbol(defaultSymbol || "");
            setTarget("");
            setSearchResults([]);
        }
    }, [open, defaultSymbol]);

    // Search Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (symbol.length >= 2 && !defaultSymbol) {
                try {
                    const response = await axios.get(`/api/market/search?q=${symbol}&market=${market}`);
                    setSearchResults(response.data);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search error", error);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [symbol, market, defaultSymbol]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = e.target as HTMLFormElement;
            const triggerLimit = parseInt((form.elements.namedItem('triggerLimit') as HTMLInputElement).value) || 1;
            const cooldown = parseInt((form.elements.namedItem('cooldown') as HTMLSelectElement).value) || 60;

            await axios.post("/api/alerts", {
                symbol: symbol.toUpperCase(),
                market,
                type,
                target: parseFloat(target),
                triggerLimit,
                cooldown
            });

            enqueueSnackbar("Alarm başarıyla oluşturuldu", { variant: "success" });
            router.refresh();
            onClose();
            setTarget("");
            if (!defaultSymbol) setSymbol("");
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Alarm oluşturulurken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSymbol = (result: any) => {
        setSymbol(result.symbol);
        setMarket(result.market);
        setShowResults(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 lg:p-10 animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                            <BellPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white italic tracking-tight">Yeni Fiyat <span className="text-indigo-400 pr-1">Alarmı</span></h2>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-0.5">Akıllı İzleme Ayarları</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sembol Input */}
                    <div className="md:col-span-2 relative">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                            Takip Edilecek Sembol
                        </label>
                        <div className="group relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                value={symbol}
                                onChange={(e) => {
                                    setSymbol(e.target.value.toUpperCase());
                                    setShowResults(true);
                                }}
                                onFocus={() => { if (symbol.length >= 2) setShowResults(true); }}
                                onBlur={() => { setTimeout(() => setShowResults(false), 200); }}
                                placeholder="Örn: THYAO, AAPL..."
                                className="pl-12 h-14 bg-slate-950/50 border-slate-800 text-lg font-black tracking-tight text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase placeholder:text-slate-700 placeholder:italic"
                                disabled={!!defaultSymbol}
                                required
                                autoComplete="off"
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && !defaultSymbol && (
                            <div className="absolute z-[110] w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="w-full text-left px-4 py-3 hover:bg-indigo-500/10 rounded-xl transition-colors flex justify-between items-center group/item"
                                        onClick={() => handleSelectSymbol(result)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-black text-white italic group-hover/item:text-indigo-400 transition-colors tracking-tight text-lg">{result.symbol}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[200px]">
                                                {result.description}
                                            </span>
                                        </div>
                                        <div className="text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                                            {result.market}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Koşul Selection */}
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                            Alarm Koşulu
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setType("PRICE_ABOVE")}
                                className={cn(
                                    "h-14 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-xs tracking-widest transition-all",
                                    type === "PRICE_ABOVE"
                                        ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-400"
                                        : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700"
                                )}
                            >
                                <Target className="w-4 h-4" />
                                YUKARI ÇIKINCA
                            </button>
                            <button
                                type="button"
                                onClick={() => setType("PRICE_BELOW")}
                                className={cn(
                                    "h-14 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-xs tracking-widest transition-all",
                                    type === "PRICE_BELOW"
                                        ? "bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] text-red-500"
                                        : "bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700"
                                )}
                            >
                                <Target className="w-4 h-4" />
                                AŞAĞI DÜŞÜNCE
                            </button>
                        </div>
                    </div>

                    {/* Hedef Fiyat */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                            Hedef Fiyat ({market === 'US' ? 'USD' : 'TRY'})
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-indigo-400 italic">₺</span>
                            <Input
                                type="number"
                                step="0.01"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="0.00"
                                className="pl-12 h-16 bg-slate-950/50 border-slate-800 text-3xl font-black tracking-tighter text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono placeholder:text-slate-800"
                                required
                            />
                        </div>
                    </div>

                    {/* Tekrar ve Bekleme */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2 flex items-center gap-1.5">
                            <Zap className="w-3 h-3" /> Tekrar Sayısı
                        </label>
                        <Input
                            type="number"
                            min="1"
                            max="100"
                            defaultValue="1"
                            name="triggerLimit"
                            className="h-12 bg-slate-950/50 border-slate-800 text-white font-black rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Bekleme (Dk)
                        </label>
                        <div className="relative">
                            <select
                                name="cooldown"
                                className="w-full h-12 rounded-xl border border-slate-800 bg-slate-950/50 px-4 text-sm font-black text-white hover:border-slate-700 transition-all appearance-none outline-none"
                                defaultValue="60"
                            >
                                <option value="60">1 Dakika</option>
                                <option value="300">5 Dakika</option>
                                <option value="900">15 Dakika</option>
                                <option value="3600">1 Saat</option>
                                <option value="14400">4 Saat</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="md:col-span-2 pt-6 flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-14 rounded-2xl text-slate-400 font-black tracking-widest uppercase hover:bg-slate-800 hover:text-white"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest uppercase shadow-xl shadow-indigo-500/20 active:translate-y-0.5 transition-all"
                        >
                            {loading ? "Sistem Kaydediyor..." : "Alarmı Aktifleştir"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
