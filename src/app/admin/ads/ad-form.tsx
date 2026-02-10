'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSnackbar } from "notistack";
import { Loader2 } from "lucide-react";

interface AdPlacement {
    id?: string;
    label: string;
    location: string;
    adCode: string;
    platform: string;
    isActive: boolean;
    maxWidth?: string;
    maxHeight?: string;
}

interface AdFormProps {
    initialData?: AdPlacement | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function AdForm({ initialData, onSuccess, onCancel }: AdFormProps) {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState<Partial<AdPlacement>>(
        initialData || {
            label: '',
            location: '',
            adCode: '',
            platform: 'ALL',
            isActive: true,
            maxWidth: '',
            maxHeight: ''
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData?.id
                ? `/api/admin/ads/${initialData.id}`
                : '/api/admin/ads';

            const method = initialData?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save');

            enqueueSnackbar(initialData ? 'Reklam güncellendi' : 'Reklam oluşturuldu', { variant: 'success' });
            onSuccess();
        } catch (error) {
            enqueueSnackbar('Bir hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card mt-4">
            <h3 className="font-semibold text-lg mb-4">
                {initialData ? 'Reklam Düzenle' : 'Yeni Reklam Ekle'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Etiket (Örn: Sidebar Altı)</Label>
                    <Input
                        value={formData.label}
                        onChange={e => setFormData({ ...formData, label: e.target.value })}
                        required
                        placeholder="Dashboard Grid"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Reklam Konumu</Label>
                    <Select
                        value={formData.location}
                        onValueChange={v => setFormData({ ...formData, location: v })}
                        disabled={!!initialData?.id} // Prevent changing unique key on edit
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Konum Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dashboard_grid_1">Dashboard (Sol Alt)</SelectItem>
                            <SelectItem value="dashboard_grid_2">Dashboard (Sağ Alt)</SelectItem>
                            <SelectItem value="footer_top">Footer (Sayfa Altı)</SelectItem>
                            <SelectItem value="mobile_menu_bottom">Mobil Menü (En Alt)</SelectItem>
                            <SelectItem value="header_full">Header (Tam Genişlik)</SelectItem>
                            <SelectItem value="symbol_detail_banner">Hisse Detay Banner (Grafik Altı)</SelectItem>
                            <SelectItem value="ipo_sidebar_bottom">Halka Arz Detay (Sol Alt)</SelectItem>
                            <SelectItem value="ipo_content_middle">Halka Arz Detay (İçerik Arası)</SelectItem>
                            <SelectItem value="blog_feed_middle">Blog Sayfası (Akış İçi)</SelectItem>
                            <SelectItem value="blog_sidebar_sticky">Blog Sayfası (Yan Panel - Yapışkan)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Reklamın nerede görüneceğini seçin.</p>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Platform Hedefleme</Label>
                <Select
                    value={formData.platform}
                    onValueChange={v => setFormData({ ...formData, platform: v })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tümü (Desktop + Mobile)</SelectItem>
                        <SelectItem value="DESKTOP">Sadece Desktop</SelectItem>
                        <SelectItem value="MOBILE">Sadece Mobile</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Maks. Genişlik (Örn: 100%, 728px)</Label>
                    <Input
                        value={formData.maxWidth}
                        onChange={e => setFormData({ ...formData, maxWidth: e.target.value })}
                        placeholder="100%"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Maks. Yükseklik (Örn: 300px, 90px)</Label>
                    <Input
                        value={formData.maxHeight}
                        onChange={e => setFormData({ ...formData, maxHeight: e.target.value })}
                        placeholder="90px"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>HTML / AdSense Kodu</Label>
                <Textarea
                    value={formData.adCode}
                    onChange={e => setFormData({ ...formData, adCode: e.target.value })}
                    required
                    className="font-mono text-xs min-h-[150px]"
                    placeholder="<ins class='adsbygoogle' ...></ins>"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    İptal
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Kaydet
                </Button>
            </div>
        </form >
    );
}
