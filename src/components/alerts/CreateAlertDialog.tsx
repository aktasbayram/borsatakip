"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import axios from "axios";

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
            // Get values from form elements directly since we didn't bind them to state to keep it simple
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
        setMarket(result.market); // Sync market just in case
        setShowResults(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in zoom-in-95">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Yeni Fiyat Alarmı</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Sembol
                        </label>
                        <Input
                            value={symbol}
                            onChange={(e) => {
                                setSymbol(e.target.value.toUpperCase());
                                setShowResults(true);
                            }}
                            onFocus={() => {
                                if (symbol.length >= 2) setShowResults(true);
                            }}
                            onBlur={() => {
                                // Delay hide to allow click
                                setTimeout(() => setShowResults(false), 200);
                            }}
                            placeholder="Örn: THYAO, AAPL"
                            className="uppercase"
                            disabled={!!defaultSymbol}
                            required
                            autoComplete="off"
                        />

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && !defaultSymbol && (
                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-between items-center group"
                                        onClick={() => handleSelectSymbol(result)}
                                    >
                                        <div>
                                            <span className="font-bold text-gray-900 dark:text-white">{result.symbol}</span>
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] inline-block align-bottom">
                                                {result.description}
                                            </span>
                                        </div>
                                        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                            {result.market}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Piyasa
                            </label>
                            <select
                                value={market}
                                onChange={(e) => setMarket(e.target.value as "BIST" | "US")}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                                disabled={!!defaultMarket}
                            >
                                <option value="BIST">Borsa İstanbul</option>
                                <option value="US">ABD Borsaları</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Koşul
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                            >
                                <option value="PRICE_ABOVE">Fiyat Yukarı Çıkınca</option>
                                <option value="PRICE_BELOW">Fiyat Aşağı Düşünce</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Hedef Fiyat ({market === 'US' ? 'USD' : 'TL'})
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tekrar Sayısı
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                defaultValue="1"
                                name="triggerLimit"
                                placeholder="Örn: 5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bekleme (Dk)
                            </label>
                            <select
                                name="cooldown"
                                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                                defaultValue="60"
                            >
                                <option value="60">1 Dakika</option>
                                <option value="300">5 Dakika</option>
                                <option value="900">15 Dakika</option>
                                <option value="3600">1 Saat</option>
                                <option value="14400">4 Saat</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Oluşturuluyor..." : "Alarm Kur"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
