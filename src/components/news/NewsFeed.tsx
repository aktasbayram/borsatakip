'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { NewsCard } from './NewsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface NewsFeedProps {
    initialMarket?: 'BIST' | 'US';
}

export function NewsFeed({ initialMarket = 'BIST' }: NewsFeedProps) {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [market, setMarket] = useState<'BIST' | 'US'>(initialMarket);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('market', market);
            if (debouncedQuery) {
                params.append('query', debouncedQuery);
            }

            const res = await axios.get(`/api/market/news?${params.toString()}`);
            setNews(res.data);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [market, debouncedQuery]);

    // Simple debounce for search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 800);
        return () => clearTimeout(handler);
    }, [query]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 w-full md:w-auto p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <Button
                        variant={market === 'BIST' ? 'white' : 'ghost'}
                        onClick={() => setMarket('BIST')}
                        size="sm"
                        className={market === 'BIST' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}
                    >
                        Borsa İstanbul
                    </Button>
                    <Button
                        variant={market === 'US' ? 'white' : 'ghost'}
                        onClick={() => setMarket('US')}
                        size="sm"
                        className={market === 'US' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-900'}
                    >
                        Global Piyasalar
                    </Button>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Haber ara (örn: THYAO, Altın, Fed)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 h-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                    />
                </div>

                <Button variant="outline" size="icon" onClick={fetchNews} title="Yenile" className="h-10 w-10">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-600 relative z-10" />
                    </div>
                    <p className="font-medium animate-pulse">Haberler yükleniyor...</p>
                </div>
            ) : news.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <p className="text-lg">Kriterlere uygun haber bulunamadı.</p>
                        <Button variant="link" onClick={() => setQuery('')}>Aramayı Temizle</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {news.map((item, index) => (
                        <NewsCard key={`${item.link}-${index}`} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
