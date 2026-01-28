
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSnackbar } from 'notistack';
import { SymbolSearch } from '@/components/features/SymbolSearch';

interface WatchlistItem {
    symbol: string;
    market: 'BIST' | 'US';
}

export default function DefaultWatchlistPage() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/admin/watchlist/default');
            if (res.data.items) {
                setItems(res.data.items);
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Ayarlar yüklenemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await axios.post('/api/admin/watchlist/default', { items });
            enqueueSnackbar('Ayarlar kaydedildi', { variant: 'success' });
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Kaydetme başarısız', { variant: 'error' });
        }
    };

    const handleAddItem = (result: { symbol: string, market: 'BIST' | 'US' }) => {
        if (items.some(i => i.symbol === result.symbol)) {
            enqueueSnackbar('Bu sembol zaten listede', { variant: 'warning' });
            return;
        }
        setItems([...items, { symbol: result.symbol, market: result.market }]);
    };

    const handleRemove = (symbol: string) => {
        setItems(items.filter(i => i.symbol !== symbol));
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Varsayılan Takip Listesi</h1>
                <p className="text-muted-foreground">
                    Ziyaretçi (üye olmayan) kullanıcılara gösterilecek varsayılan hisse senetleri.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste Yönetimi</CardTitle>
                    <CardDescription>
                        Listeye eklenen hisseler, giriş yapmamış kullanıcıların ana sayfasında görünecektir.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="mb-4">
                            <label className="text-sm font-medium mb-1 block">Sembol Ekle</label>
                            <SymbolSearch onSelect={handleAddItem} />
                        </div>

                        <div className="border rounded-md divide-y">
                            {items.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    Liste boş.
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.symbol} className="p-3 flex justify-between items-center bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg">{item.symbol}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.market === 'BIST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                {item.market}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(item.symbol)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Sil
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button onClick={handleSave}>
                            Değişiklikleri Kaydet
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
