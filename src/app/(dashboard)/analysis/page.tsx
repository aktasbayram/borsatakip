'use client';

import AiAnalysisFeed from '@/components/AiAnalysisFeed';
import { SentimentGauge } from '@/components/analysis/SentimentGauge';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AnalysisPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [averageSentiment, setAverageSentiment] = useState(0);
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') return <div className="p-6">Yükleniyor...</div>;
    if (status === 'unauthenticated') return null;

    // Fetch data
    const fetchData = async () => {
        try {
            const response = await fetch('/api/analysis');
            if (response.ok) {
                const data = await response.json();
                setAnalyses(data);

                // Calculate average sentiment
                if (data.length > 0) {
                    const total = data.reduce((acc: number, item: any) => acc + (item.sentiment || 5), 0);
                    setAverageSentiment(total / data.length);
                }
            }
        } catch (error) {
            console.error("Failed to load analysis", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            await fetch('/api/admin/trigger-analysis', { method: 'POST' });
            alert('Analiz işlemi başlatıldı! Arka planda haberler taranıyor, birkaç dakika içinde sonuçlar güncellenecek.');
            // Refresh data after a short delay
            setTimeout(fetchData, 5000);
        } catch (error) {
            console.error(error);
            alert('Analiz başlatılamadı.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">Piyasa Analiz Merkezi</h1>
                    <p className="text-muted-foreground">
                        Yapay zeka gücüyle piyasa haberlerinin anlık analizi ve duygu durumu.
                    </p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {analyzing ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analiz Başlatılıyor...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Günlük Analizi Başlat
                        </>
                    )}
                </button>
            </div>

            {/* Top Dashboard Section */}
            {!loading && analyses.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Market Breakdown Stats */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-center">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Piyasa Özeti</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">İncelenen Haber</span>
                                <span className="font-bold text-xl text-gray-900 dark:text-white">{analyses.length}</span>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-gray-600 dark:text-gray-300">Pozitif</span>
                                </div>
                                <span className="font-bold text-green-600">{analyses.filter((a: any) => a.sentiment >= 6).length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span className="text-gray-600 dark:text-gray-300">Negatif</span>
                                </div>
                                <span className="font-bold text-red-600">{analyses.filter((a: any) => a.sentiment <= 4).length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                    <span className="text-gray-600 dark:text-gray-300">Nötr</span>
                                </div>
                                <span className="font-bold text-gray-500">{analyses.filter((a: any) => a.sentiment === 5).length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Center: Sentiment Gauge (Existing) */}
                    <div className="flex justify-center">
                        <div className="w-full">
                            <SentimentGauge score={averageSentiment} label="Genel Piyasa Duygusu" />
                        </div>
                    </div>

                    {/* Right: Top Symbol / Highlight */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Günün Yıldızı</h3>

                        {(() => {
                            // Find most mentioned symbol or highest sentiment
                            const symbolCounts: Record<string, { count: number, totalSentiment: number }> = {};
                            analyses.forEach((a: any) => {
                                if (!symbolCounts[a.symbol]) symbolCounts[a.symbol] = { count: 0, totalSentiment: 0 };
                                symbolCounts[a.symbol].count++;
                                symbolCounts[a.symbol].totalSentiment += a.sentiment;
                            });

                            // Sort by count then sentiment
                            const topSymbol = Object.keys(symbolCounts).sort((a, b) => symbolCounts[b].count - symbolCounts[a].count)[0];
                            const stats = symbolCounts[topSymbol];
                            const avgSent = stats ? stats.totalSentiment / stats.count : 0;

                            if (!topSymbol) return <div className="text-gray-500">Veri yok</div>;

                            return (
                                <div className="text-center">
                                    <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3">
                                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{topSymbol}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-1">{stats.count} Haber Bulundu</div>
                                    <div className={`text-lg font-bold ${avgSent >= 6 ? 'text-green-600' : avgSent <= 4 ? 'text-red-600' : 'text-gray-500'}`}>
                                        Ort. Puan: {avgSent.toFixed(1)}/10
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                </div>
            )}

            <AiAnalysisFeed analyses={analyses} loading={loading} />
        </div>
    );
}
