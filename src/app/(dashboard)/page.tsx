'use client';

import { useState, useEffect } from 'react';
import { SymbolSearch } from '@/components/features/SymbolSearch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketIndices } from '@/components/dashboard/MarketIndices';
import TradingViewWidget from '@/components/TradingViewWidget';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import Link from 'next/link';

interface WatchlistItem {
    id: string;
    symbol: string;
    market: 'BIST' | 'US';
    quote?: {
        price: number;
        change: number;
        changePercent: number;
    } | null;
}

export default function DashboardPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchWatchlist = async () => {
        try {
            // 1. Get List
            const res = await axios.get('/api/watchlist');
            const lists = res.data;

            if (lists.length > 0) {
                const items: WatchlistItem[] = lists[0].items.map((i: any) => ({ ...i, quote: null }));
                setWatchlist(items);

                // 2. Fetch Prices in parallel
                items.forEach((item: WatchlistItem) => {
                    axios.get(`/api/market/quote?symbol=${item.symbol}&market=${item.market}`)
                        .then(qRes => {
                            setWatchlist(prev => prev.map(p =>
                                p.id === item.id ? { ...p, quote: qRes.data } : p
                            ));
                        })
                        .catch(err => console.error(item.symbol, err));
                });
            } else {
                setWatchlist([]);
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Takip listesi yüklenemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
        const interval = setInterval(fetchWatchlist, 15000); // Live update every 15s
        return () => clearInterval(interval);
    }, []);

    const handleAddSymbol = async (result: { symbol: string; market: 'BIST' | 'US' }) => {
        try {
            await axios.post('/api/watchlist', {
                symbol: result.symbol,
                market: result.market
            });
            enqueueSnackbar(`${result.symbol} eklendi`, { variant: 'success' });
            fetchWatchlist();
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Ekleme başarısız';
            enqueueSnackbar(msg, { variant: 'error' });
        }
    };

    const handleRemove = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.delete(`/api/watchlist?id=${id}`);
            setWatchlist(prev => prev.filter(i => i.id !== id));
            enqueueSnackbar('Silindi', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar('Silme başarısız', { variant: 'error' });
        }
    };

    return (
        <div className="space-y-6">
            <MarketIndices />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Takip Listem</h1>
                <SymbolSearch onSelect={handleAddSymbol} />
            </div>

            {loading && watchlist.length === 0 ? (
                <div>Yükleniyor...</div>
            ) : (
                <div className="space-y-8">
                    {/* BIST Stocks Section */}
                    {watchlist.filter(item => item.market === 'BIST').length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="text-2xl">🇹🇷</span>
                                BIST Hisseleri
                                <span className="text-sm font-normal text-gray-500">
                                    ({watchlist.filter(item => item.market === 'BIST').length})
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {watchlist.filter(item => item.market === 'BIST').map(item => (
                                    <Link href={`/symbol/${item.market}/${item.symbol}`} key={item.id}>
                                        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative group">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle>{item.symbol}</CardTitle>
                                                        <span className="text-xs text-gray-500">{item.market}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        {item.quote ? (
                                                            <>
                                                                <div className="text-lg font-bold">
                                                                    ₺{item.quote.price.toFixed(2)}
                                                                </div>
                                                                <div className={`text-sm font-medium ${item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {item.quote.change >= 0 ? '+' : ''}{item.quote.changePercent.toFixed(2)}%
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <button
                                                onClick={(e) => handleRemove(item.id, e)}
                                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 text-xs"
                                            >
                                                Sil
                                            </button>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* US Stocks Section */}
                    {watchlist.filter(item => item.market === 'US').length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="text-2xl">🇺🇸</span>
                                ABD Hisseleri
                                <span className="text-sm font-normal text-gray-500">
                                    ({watchlist.filter(item => item.market === 'US').length})
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {watchlist.filter(item => item.market === 'US').map(item => (
                                    <Link href={`/symbol/${item.market}/${item.symbol}`} key={item.id}>
                                        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative group">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle>{item.symbol}</CardTitle>
                                                        <span className="text-xs text-gray-500">{item.market}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        {item.quote ? (
                                                            <>
                                                                <div className="text-lg font-bold">
                                                                    ${item.quote.price.toFixed(2)}
                                                                </div>
                                                                <div className={`text-sm font-medium ${item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {item.quote.change >= 0 ? '+' : ''}{item.quote.changePercent.toFixed(2)}%
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <button
                                                onClick={(e) => handleRemove(item.id, e)}
                                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 text-xs"
                                            >
                                                Sil
                                            </button>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {watchlist.length === 0 && !loading && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            Listeniz boş. Yukarıdan sembol ekleyin.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
