'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import Link from 'next/link';

interface UserIndex {
    id?: string;
    symbol: string;
    name: string;
    order: number;
}

// Popular indices for quick add
const POPULAR_INDICES = [
    { symbol: 'XU100.IS', name: 'BIST 100' },
    { symbol: 'XU030.IS', name: 'BIST 30' },
    { symbol: 'XBANK.IS', name: 'BIST Bankacılık' },
    { symbol: 'XUSIN.IS', name: 'BIST Sınai' },
    { symbol: 'XELKT.IS', name: 'BIST Elektrik' },
    { symbol: 'USDTRY=X', name: 'Dolar/TL' },
    { symbol: 'EURTRY=X', name: 'Euro/TL' },
    { symbol: 'XAUTRY=X', name: 'Gram Altın' },
];

export default function IndicesManagementPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [indices, setIndices] = useState<UserIndex[]>([]);
    const [customSymbol, setCustomSymbol] = useState('');
    const [customName, setCustomName] = useState('');

    useEffect(() => {
        fetchIndices();
    }, []);

    const fetchIndices = async () => {
        try {
            const res = await axios.get('/api/user/indices');
            const userIndices = res.data;

            // If user has no custom indices, show defaults
            if (userIndices.length === 0) {
                const DEFAULT_INDICES = [
                    { symbol: 'XU100.IS', name: 'BIST 100', order: 0 },
                    { symbol: 'XU030.IS', name: 'BIST 30', order: 1 },
                    { symbol: 'USDTRY=X', name: 'Dolar/TL', order: 2 },
                    { symbol: 'EURTRY=X', name: 'Euro/TL', order: 3 },
                ];
                setIndices(DEFAULT_INDICES);
            } else {
                setIndices(userIndices);
            }
        } catch (error) {
            console.error('Fetch indices error:', error);
        }
    };

    const handleAddIndex = async (symbol: string, name: string) => {
        try {
            await axios.post('/api/user/indices', { symbol, name });
            enqueueSnackbar('Endeks eklendi.', { variant: 'success' });
            fetchIndices();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Bir hata oluştu.', { variant: 'error' });
        }
    };

    const handleDeleteIndex = async (id: string) => {
        try {
            await axios.delete(`/api/user/indices/${id}`);
            enqueueSnackbar('Endeks silindi.', { variant: 'success' });
            fetchIndices();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Bir hata oluştu.', { variant: 'error' });
        }
    };

    const handleCustomAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customSymbol || !customName) return;

        await handleAddIndex(customSymbol, customName);
        setCustomSymbol('');
        setCustomName('');
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/settings/account" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        ← Geri
                    </Link>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Endeks Yönetimi
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Dashboard'da görüntülemek istediğiniz endeksleri seçin</p>
            </div>

            {/* Premium Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-4 border-gray-200/80 dark:border-white/20 shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-30"></div>

                <div className="relative p-8">
                    {/* Current Indices */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mevcut Endeksler</h3>
                        <div className="space-y-2">
                            {indices.map((index) => (
                                <div key={index.id || index.symbol} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{index.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{index.symbol}</p>
                                    </div>
                                    {index.id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteIndex(index.id!)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Sil
                                        </Button>
                                    )}
                                    {!index.id && (
                                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                            Varsayılan
                                        </span>
                                    )}
                                </div>
                            ))}
                            {indices.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                    Henüz endeks eklenmemiş. Aşağıdan ekleyebilirsiniz.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Popular Indices */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Popüler Endeksler</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {POPULAR_INDICES.map((index) => (
                                <Button
                                    key={index.symbol}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddIndex(index.symbol, index.name)}
                                    className="justify-start text-left h-auto py-2"
                                    disabled={indices.some(i => i.symbol === index.symbol)}
                                >
                                    <div>
                                        <p className="font-medium text-xs">{index.name}</p>
                                        <p className="text-[10px] text-gray-500">{index.symbol}</p>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Index */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Özel Endeks Ekle</h3>
                        <form onSubmit={handleCustomAdd} className="flex gap-2">
                            <Input
                                placeholder="Sembol (örn: XU100.IS)"
                                value={customSymbol}
                                onChange={(e) => setCustomSymbol(e.target.value)}
                                className="h-10 bg-gray-50/50 dark:bg-gray-800/50"
                            />
                            <Input
                                placeholder="İsim (örn: BIST 100)"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="h-10 bg-gray-50/50 dark:bg-gray-800/50"
                            />
                            <Button type="submit" className="h-10 bg-gradient-to-r from-blue-600 to-purple-600">
                                Ekle
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
