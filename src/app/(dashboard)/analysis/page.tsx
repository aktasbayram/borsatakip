'use client';

import AiAnalysisFeed from '@/components/AiAnalysisFeed';
import { useState } from 'react';

export default function AnalysisPage() {
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            await fetch('/api/admin/trigger-analysis', { method: 'POST' });
            alert('Analiz işlemi başlatıldı! Arka planda haberler taranıyor, birkaç dakika içinde sonuçlar güncellenecek.');
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

            <AiAnalysisFeed />
        </div>
    );
}
