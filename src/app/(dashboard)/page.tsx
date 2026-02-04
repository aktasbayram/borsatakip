'use client';



import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { SymbolSearch } from '@/components/features/SymbolSearch';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MarketIndices } from '@/components/dashboard/MarketIndices';
import { AgendaWidget } from "@/components/dashboard/AgendaWidget";
import { IpoWidget } from "@/components/dashboard/IpoWidget";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AuthModal } from '@/components/auth/AuthModal';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
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
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';

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
    const { data: session, status } = useSession();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGuestDialog, setShowGuestDialog] = useState(false);
    const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
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
            // 1. Get List (Auth or Default)
            const endpoint = status === 'authenticated' ? '/api/watchlist' : '/api/watchlist/default';
            const res = await axios.get(endpoint);
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
        } catch (error: any) {
            console.error(error);
            // If 401 Unauthorized, it means session is invalid/stale. Sign out to reset state.
            if (error.response && error.response.status === 401) {
                console.log('Session expired or invalid, signing out...');
                signOut();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Authenticated users live update
        if (status === 'authenticated') {
            fetchWatchlist();
            const interval = setInterval(fetchWatchlist, 15000); // Live update every 15s
            return () => clearInterval(interval);
        } else if (status === 'unauthenticated') {
            // Guest users fetch once
            fetchWatchlist();
        }
    }, [status]);

    const router = useRouter();

    const handleAddSymbol = async (result: { symbol: string; market: 'BIST' | 'US' }) => {
        if (status !== 'authenticated') {
            setAuthView('REGISTER');
            setShowGuestDialog(true);
            return;
        }

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

    const { preferences, loading: prefsLoading } = useDashboardPreferences();

    const bistItems = watchlist.filter(item => item.market === 'BIST');
    const usItems = watchlist.filter(item => item.market === 'US');

    // Unified View (Guest & User)
    return (
        <div className="space-y-6">

            {preferences.showIndices && <MarketIndices />}

            {(preferences.showAgenda || preferences.showIpo) && (
                <div className={`grid grid-cols-1 ${preferences.showAgenda && preferences.showIpo ? 'lg:grid-cols-2' : ''} gap-6`}>
                    {preferences.showAgenda && <AgendaWidget />}
                    {preferences.showIpo && <IpoWidget />}
                </div>
            )}

            {/* Market Heatmap moved to /market/heatmap */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Takip Listem</h1>
                <SymbolSearch onSelect={handleAddSymbol} />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                {/* Guest Warning Banner */}
                {status === 'unauthenticated' && watchlist.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Örnek Takip Listesi</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Bu liste örnek amaçlıdır. Kendi favori hisselerinizi eklemek ve yönetmek için giriş yapın.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => { setAuthView('LOGIN'); setShowGuestDialog(true); }} className="bg-white dark:bg-transparent border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                                Giriş Yap
                            </Button>
                            <Button size="sm" onClick={() => { setAuthView('REGISTER'); setShowGuestDialog(true); }}>
                                Kayıt Ol
                            </Button>
                        </div>
                    </div>
                )}
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
                                                disabled={status !== 'authenticated'}
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
                                                disabled={status !== 'authenticated'}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        )}

                        {watchlist.length === 0 && !loading && (
                            <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                                {status === 'authenticated' ? (
                                    <>
                                        <div className="text-4xl mb-3">📈</div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Listeniz Boş</h3>
                                        <p className="text-gray-500 mb-0">Yukarıdaki arama çubuğundan hisse ekleyerek takibe başlayın.</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-4xl mb-3">🔒</div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Takip Listesi Oluşturun</h3>
                                        <p className="text-gray-500 mb-4 max-w-sm mx-auto">Kendi favori hisselerinizi takip etmek ve portföy oluşturmak için ücretsiz hesap oluşturun.</p>
                                        <div className="flex justify-center gap-3">
                                            <Button variant="outline" onClick={() => { setAuthView('LOGIN'); setShowGuestDialog(true); }}>Giriş Yap</Button>
                                            <Button onClick={() => { setAuthView('REGISTER'); setShowGuestDialog(true); }}>Kayıt Ol</Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </DndContext>

            <AuthModal
                isOpen={showGuestDialog}
                onClose={() => setShowGuestDialog(false)}
                initialView={authView}
            />
        </div>
    );
}
