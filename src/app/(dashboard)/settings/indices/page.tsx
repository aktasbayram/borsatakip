'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import Link from 'next/link';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

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
    { symbol: 'GC=F', name: 'Altın (Ons)' },
    { symbol: 'SI=F', name: 'Gümüş (Ons)' },
];

function SortableIndexItem({ index, onDelete }: { index: UserIndex; onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: index.id || index.symbol });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 group"
        >
            <div className="flex items-center gap-3">
                {index.id && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <GripVertical size={18} />
                    </div>
                )}
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{index.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{index.symbol}</p>
                </div>
            </div>
            {index.id && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(index.id!)}
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
    );
}

export default function IndicesManagementPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [indices, setIndices] = useState<UserIndex[]>([]);
    const [customSymbol, setCustomSymbol] = useState('');
    const [customName, setCustomName] = useState('');
    const [showIndices, setShowIndices] = useState(true);
    const [loadingPrefs, setLoadingPrefs] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchIndices();
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const res = await axios.get('/api/user/preferences');
            if (res.data) {
                setShowIndices(res.data.showIndices !== false);
            }
        } catch (error) {
            console.error('Failed to fetch preferences', error);
        } finally {
            setLoadingPrefs(false);
        }
    };

    const updateShowIndices = async (value: boolean) => {
        setShowIndices(value);
        try {
            await axios.post('/api/user/preferences', { showIndices: value });
            enqueueSnackbar('Ayarlar güncellendi', { variant: 'success' });
            window.dispatchEvent(new Event('preferences-updated'));
        } catch (error) {
            enqueueSnackbar('Güncelleme başarısız', { variant: 'error' });
            setShowIndices(!value);
        }
    };

    const fetchIndices = async () => {
        try {
            const res = await axios.get('/api/user/indices');
            const userIndices = res.data;

            // If user has no custom indices, show defaults
            if (userIndices.length === 0) {
                const DEFAULT_INDICES = [
                    { symbol: 'XU100.IS', name: 'BIST 100', order: 0 },
                    { symbol: 'XU030.IS', name: 'BIST 30', order: 1 },
                    { symbol: 'XBANK.IS', name: 'BIST Banka', order: 2 },
                    { symbol: 'XUSIN.IS', name: 'BIST Sınai', order: 3 },
                    { symbol: 'USDTRY=X', name: 'Dolar/TL', order: 4 },
                    { symbol: 'EURTRY=X', name: 'Euro/TL', order: 5 },
                    { symbol: 'GC=F', name: 'Altın', order: 6 },
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = indices.findIndex((item) => (item.id || item.symbol) === active.id);
        const newIndex = indices.findIndex((item) => (item.id || item.symbol) === over.id);

        const newIndices = arrayMove(indices, oldIndex, newIndex);
        setIndices(newIndices);

        // Update order in backend
        try {
            await axios.post('/api/user/indices/reorder', {
                indices: newIndices.map((idx, i) => ({
                    id: idx.id,
                    order: i
                }))
            });
        } catch (error) {
            console.error('Failed to update order:', error);
            enqueueSnackbar('Sıralama güncellenemedi', { variant: 'error' });
            fetchIndices(); // Revert on error
        }
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
                <p className="text-gray-500 dark:text-gray-400 mt-2">Dashboard'da görüntülemek istediğiniz endeksleri seçin ve sıralayın</p>
            </div>

            {/* Show/Hide Toggle */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="showIndicesToggle" className="text-base font-medium text-blue-900 dark:text-blue-100">Piyasa Endekslerini Göster</Label>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Dashboard'da endeksler bölümünü göster/gizle.
                        </p>
                    </div>
                    <Switch
                        id="showIndicesToggle"
                        checked={showIndices}
                        onCheckedChange={updateShowIndices}
                        disabled={loadingPrefs}
                    />
                </div>
            </div>

            {/* Premium Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-4 border-gray-200/80 dark:border-white/20 shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-30"></div>

                <div className="relative p-8">
                    {/* Current Indices */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Mevcut Endeksler</h3>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={indices.map(idx => idx.id || idx.symbol)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {indices.map((index) => (
                                        <SortableIndexItem
                                            key={index.id || index.symbol}
                                            index={index}
                                            onDelete={handleDeleteIndex}
                                        />
                                    ))}
                                    {indices.length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                            Henüz endeks eklenmemiş. Aşağıdan ekleyebilirsiniz.
                                        </p>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
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

