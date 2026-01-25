
'use client';

import { useEffect, useState } from 'react';

interface Analysis {
    id: string;
    symbol: string;
    url: string;
    title: string;
    sentiment: number;
    summary: string;
    publishedAt: string;
    market?: string;
}

interface AiAnalysisFeedProps {
    analyses: any[]; // Using any[] for now to match the local interface if we export it later, or we can use the local Analysis interface
    loading?: boolean;
}

export default function AiAnalysisFeed({ analyses, loading = false }: AiAnalysisFeedProps) {
    const [activeTab, setActiveTab] = useState<'ALL' | 'BIST' | 'US'>('ALL');

    // Remove internal useEffect fetching logic


    const filteredAnalyses = analyses.filter(item => {
        if (activeTab === 'ALL') return true;
        // Default to US if market logic was missing before migration
        const itemMarket = item.market || 'US';
        return itemMarket === activeTab;
    });

    if (loading) return <div className="p-4 text-center">Analizler yükleniyor...</div>;

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-border pb-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'ALL'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                >
                    Tümü
                </button>
                <button
                    onClick={() => setActiveTab('BIST')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'BIST'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                >
                    🇹🇷 Borsa İstanbul
                </button>
                <button
                    onClick={() => setActiveTab('US')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'US'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                >
                    🇺🇸 ABD Borsaları
                </button>
            </div>

            {filteredAnalyses.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground bg-card rounded-lg border border-dashed border-border">
                    {analyses.length === 0 ? "Henüz analiz edilmiş haber yok." : "Bu kategoride gösterilecek analiz bulunamadı."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAnalyses.map((item) => {
                        const isPositive = item.sentiment >= 7;
                        const isNegative = item.sentiment <= 4;
                        const sentimentColor = isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : isNegative ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-secondary text-secondary-foreground';
                        const sentimentLabel = isPositive ? 'POZİTİF' : isNegative ? 'NEGATİF' : 'NÖTR';

                        return (
                            <div key={item.id} className="bg-card rounded-lg shadow-sm border border-border p-4 hover:shadow-md transition-shadow flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {item.symbol}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sentimentColor}`}>
                                        {item.sentiment}/10 - {sentimentLabel}
                                    </span>
                                </div>

                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block mt-2 mb-2 flex-grow">
                                    <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                </a>

                                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {item.summary}
                                </p>

                                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <time dateTime={item.publishedAt}>
                                        {new Date(item.publishedAt).toLocaleString('tr-TR', {
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </time>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                        Gemini AI
                                    </span>

                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors">
                                        Habere Git
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
