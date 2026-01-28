'use client';



import { useState, useEffect } from 'react';
import { SymbolSearch } from '@/components/features/SymbolSearch';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketIndices } from '@/components/dashboard/MarketIndices';
import { NewsFeed } from "@/components/news/NewsFeed";
import { AgendaWidget } from "@/components/dashboard/AgendaWidget";
import { IpoWidget } from "@/components/dashboard/IpoWidget";
import { useSnackbar } from 'notistack';
import axios from 'axios';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { SortableWatchlistItem } from '@/components/dashboard/SortableWatchlistItem';

interface WatchlistItem {
    id: string;
    symbol: string;
    market: 'BIST' | 'US';
    order: number;
    quote?: {
        price: number;
        change: number;
        changePercent: number;
        name?: string;
    } | null;
}

export default function DashboardPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require 5px movement to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
            // enqueueSnackbar('Takip listesi yüklenemedi', { variant: 'error' });
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setWatchlist((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                if (oldIndex === -1 || newIndex === -1) return items;

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Trigger API update
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order: index
                }));

                axios.put('/api/watchlist/reorder', { items: updates })
                    .catch(err => console.error('Reorder failed', err));

                return newItems;
            });
        }
    };

    const [preferences, setPreferences] = useState({ showAgenda: true, showIpo: true, showIndices: true });

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await axios.get('/api/user/preferences');
                if (res.data) {
                    // Start true by default if keys are missing, but respect false if set
                    setPreferences(prev => ({
                        showAgenda: res.data.showAgenda !== false,
                        showIpo: res.data.showIpo !== false,
                        showIndices: res.data.showIndices !== false
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch preferences', error);
            }
        };

        fetchPreferences();

        // Listen for updates from settings page (if in same session/tab)
        const handlePrefUpdate = () => fetchPreferences();
        window.addEventListener('preferences-updated', handlePrefUpdate);

        return () => window.removeEventListener('preferences-updated', handlePrefUpdate);
    }, []);

    const bistItems = watchlist.filter(item => item.market === 'BIST');
    const usItems = watchlist.filter(item => item.market === 'US');

    return (
        <div className="space-y-6">

            {preferences.showIndices && <MarketIndices />}

            {(preferences.showAgenda || preferences.showIpo) && (
                <div className={`grid grid-cols-1 ${preferences.showAgenda && preferences.showIpo ? 'lg:grid-cols-2' : ''} gap-6`}>
                    {preferences.showAgenda && <AgendaWidget />}
                    {preferences.showIpo && <IpoWidget />}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Takip Listem</h1>
                <SymbolSearch onSelect={handleAddSymbol} />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                {loading && watchlist.length === 0 ? (
                    <div>Yükleniyor...</div>
                ) : (
                    <div className="space-y-8">
                        {/* BIST Stocks Section */}
                        {bistItems.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🇹🇷</span>
                                    BIST Hisseleri
                                    <span className="text-sm font-normal text-gray-500">
                                        ({bistItems.length})
                                    </span>
                                </h2>
                                <SortableContext
                                    items={bistItems.map(i => i.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {bistItems.map((item) => (
                                            <SortableWatchlistItem
                                                key={item.id}
                                                item={item}
                                                onRemove={handleRemove}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        )}

                        {/* US Stocks Section */}
                        {usItems.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🇺🇸</span>
                                    ABD Hisseleri
                                    <span className="text-sm font-normal text-gray-500">
                                        ({usItems.length})
                                    </span>
                                </h2>
                                <SortableContext
                                    items={usItems.map(i => i.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {usItems.map((item) => (
                                            <SortableWatchlistItem
                                                key={item.id}
                                                item={item}
                                                onRemove={handleRemove}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        )}

                        {watchlist.length === 0 && !loading && (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                Listeniz boş. Yukarıdan sembol ekleyin.
                            </div>
                        )}
                    </div>
                )}
            </DndContext>
        </div>
    );
}
