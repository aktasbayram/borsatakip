
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateRSI, calculateSMA, calculateEMA } from "@/lib/indicators";
import { useMemo } from "react";

interface TechnicalAnalysisProps {
    candles: any[]; // Expecting array with 'close' property
}

export function TechnicalAnalysis({ candles }: TechnicalAnalysisProps) {
    const analysis = useMemo(() => {
        console.log("TechnicalAnalysis receive candles:", candles?.length);
        if (!candles || candles.length < 14) return null; // Relaxed from 50 to 14 for RSI

        const closes = candles.map(c => c.close); // Ensure chronological order (oldest first) if that's how candles come from API. 
        // Typically charts consume oldest-to-newest. Let's assume standard format.

        // For Chart we use (prices, times), here we just use prices for scalar
        // We need to handle the different signatures or just use what we have.
        // calculateRSI expects (prices, times). We can pass dummy times or empty array?
        // Actually calculateRSI signature is (prices, times). 
        // Let's make a dummy times array.
        const dummyTimes = closes.map((_, i) => i);

        const rsiArray = calculateRSI(closes, dummyTimes, 14);
        const rsi = rsiArray.length > 0 ? rsiArray[rsiArray.length - 1].value : null;

        const sma50 = calculateSMA(closes, 50);
        const sma200 = calculateSMA(closes, 200);

        const ema20Array = calculateEMA(closes, 20);
        const ema20 = ema20Array.length > 0 ? ema20Array[ema20Array.length - 1] : null;

        return { rsi, sma50, sma200, ema20 };
    }, [candles]);

    if (!analysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Teknik Analiz</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">
                        {candles?.length > 0 ? "Veri hesaplanıyor..." : "Veri bekleniyor..."}
                        <br />
                        <span className="text-xs">(Mum sayısı: {candles?.length || 0})</span>
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getRsiStatus = (rsi: number) => {
        if (rsi > 70) return { text: "Aşırı Alım (Overbought)", color: "text-red-500" };
        if (rsi < 30) return { text: "Aşırı Satım (Oversold)", color: "text-green-500" };
        return { text: "Nötr", color: "text-gray-500" };
    };

    const rsiStatus = analysis.rsi ? getRsiStatus(analysis.rsi) : { text: "-", color: "" };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Teknik Göstergeler</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* RSI */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">RSI (14)</p>
                            <p className={`text-xs font-semibold ${rsiStatus.color}`}>{rsiStatus.text}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {analysis.rsi?.toFixed(2) ?? "-"}
                            </span>
                        </div>
                    </div>

                    {/* Moving Averages */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="text-xs text-gray-500">EMA (20)</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {analysis.ema20?.toFixed(2) ?? "-"}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="text-xs text-gray-500">SMA (50)</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {analysis.sma50?.toFixed(2) ?? "-"}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <p className="text-xs text-gray-500">SMA (200)</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {analysis.sma200?.toFixed(2) ?? "-"}
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                        *Hesaplamalar günlük kapanış verilerine dayanır.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
