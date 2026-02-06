'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { AdForm } from "./ad-form";
import { useSnackbar } from "notistack";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AdPlacement {
    id: string;
    label: string;
    location: string;
    adCode: string;
    platform: string;
    isActive: boolean;
}

export default function AdsPage() {
    const [ads, setAds] = useState<AdPlacement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAd, setEditingAd] = useState<AdPlacement | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/admin/ads', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setAds(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const toggleStatus = async (ad: AdPlacement) => {
        const newStatus = !ad.isActive;
        // Optimistic update
        setAds(ads.map(a => a.id === ad.id ? { ...a, isActive: newStatus } : a));

        try {
            const response = await fetch(`/api/admin/ads/${ad.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ad, isActive: newStatus })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Toggle failed:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const updatedAd = await response.json();
            console.log('Ad updated successfully:', updatedAd);

            enqueueSnackbar(`Reklam ${newStatus ? 'aktif' : 'pasif'} edildi`, { variant: 'success' });
        } catch (error) {
            console.error('Toggle error:', error);
            enqueueSnackbar('Güncelleme başarısız', { variant: 'error' });
            fetchAds(); // Revert
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;

        try {
            await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
            enqueueSnackbar('Reklam silindi', { variant: 'success' });
            fetchAds();
        } catch (error) {
            enqueueSnackbar('Silme başarısız', { variant: 'error' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Reklam Yönetimi</h1>
                    <p className="text-muted-foreground">Google AdSense ve özel reklam alanlarını yönetin.</p>
                </div>
                {!isCreating && !editingAd && (
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Reklam Ekle
                    </Button>
                )}
            </div>

            {(isCreating || editingAd) && (
                <AdForm
                    initialData={editingAd}
                    onSuccess={() => {
                        setIsCreating(false);
                        setEditingAd(null);
                        fetchAds();
                    }}
                    onCancel={() => {
                        setIsCreating(false);
                        setEditingAd(null);
                    }}
                />
            )}

            {!isCreating && !editingAd && (
                <div className="grid gap-4">
                    {loading ? (
                        <div>Yükleniyor...</div>
                    ) : ads.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                            Henüz hiç reklam alanı eklenmemiş.
                        </div>
                    ) : (
                        ads.map((ad) => (
                            <Card key={ad.id} className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {ad.label}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                            {ad.location}
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className={`flex items-center gap-1 ${ad.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            {ad.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {ad.isActive ? 'Yayında' : 'Pasif'}
                                        </span>
                                        <span>•</span>
                                        <span>{ad.platform === 'ALL' ? 'Tüm Cihazlar' : ad.platform}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 mr-4">
                                        <span className="text-sm font-medium">Durum</span>
                                        <Switch
                                            checked={ad.isActive}
                                            onCheckedChange={() => toggleStatus(ad)}
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setEditingAd(ad)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(ad.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
