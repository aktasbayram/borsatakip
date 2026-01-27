'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

interface IndexData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export function MarketIndices() {
    const [indices, setIndices] = useState<IndexData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                const res = await fetch('/api/market/indices');
                if (res.ok) {
                    const data = await res.json();
                    setIndices(data);
                }
            } catch (error) {
                console.error('Failed to fetch indices', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIndices();
        // Refresh every 30 seconds
        const interval = setInterval(fetchIndices, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-2.5 h-16"></CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (indices.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
            {indices.map((idx) => {
                const isPositive = idx.change > 0;
                const isNegative = idx.change < 0;

                return (
                    <Card key={idx.symbol} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-2.5">
                            <div className="text-[10px] text-muted-foreground font-medium mb-0.5 truncate" title={idx.name}>
                                {idx.name}
                            </div>
                            <div className="text-base font-bold tracking-tight text-foreground">
                                {idx.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`flex items-center text-[10px] font-semibold mt-0.5 ${isPositive ? 'text-green-600 dark:text-green-400' :
                                isNegative ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                                }`}>
                                {isPositive ? <ArrowUpIcon className="w-2.5 h-2.5 mr-0.5" /> :
                                    isNegative ? <ArrowDownIcon className="w-2.5 h-2.5 mr-0.5" /> :
                                        <MinusIcon className="w-2.5 h-2.5 mr-0.5" />}

                                <span>%{Math.abs(idx.changePercent).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
