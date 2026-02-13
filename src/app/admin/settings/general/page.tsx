'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Upload, Globe, Search, Share2, Languages } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface SystemSetting {
    key: string;
    value: string;
    category: string;
}

export default function GeneralSettingsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            enqueueSnackbar('Ayarlar yüklenirken hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';

    const updateSettingLocal = (key: string, value: string, category: string = 'GENERAL') => {
        setSettings(prev => {
            const exists = prev.find(s => s.key === key);
            if (exists) {
                return prev.map(s => s.key === key ? { ...s, value } : s);
            }
            return [...prev, { key, value, category }];
        });
    };

    const handleSave = async (keys: string[]) => {
        setSaving(true);
        try {
            const promises = keys.map(key => {
                const s = settings.find(x => x.key === key);
                return fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key,
                        value: s?.value || '',
                        category: s?.category || 'GENERAL'
                    })
                });
            });
            await Promise.all(promises);
            enqueueSnackbar('Ayarlar kaydedildi', { variant: 'success' });
            fetchSettings();
        } catch (error) {
            enqueueSnackbar('Kaydedilirken hata oluştu', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/admin/upload', formData);
            if (res.data.success) {
                updateSettingLocal('SITE_LOGO_URL', res.data.url, 'BRANDING');
                enqueueSnackbar('Logo yüklendi, kaydetmeyi unutmayın', { variant: 'info' });
            }
        } catch (error) {
            enqueueSnackbar('Dosya yükleme hatası', { variant: 'error' });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-6 space-y-6 container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Genel Ayarlar
            </h1>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="branding" className="flex gap-2">
                        <Globe className="w-4 h-4" /> Marka
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="flex gap-2">
                        <Search className="w-4 h-4" /> SEO
                    </TabsTrigger>
                    <TabsTrigger value="social" className="flex gap-2">
                        <Share2 className="w-4 h-4" /> Sosyal Medya
                    </TabsTrigger>
                </TabsList>

                {/* Marka Ayarları */}
                <TabsContent value="branding" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Site Kimliği</CardTitle>
                            <CardDescription>Sitenizin logosu, ismi ve temel dil ayarları.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Site Başlığı (Branding)</label>
                                <Input
                                    value={getSetting('SITE_NAME')}
                                    onChange={(e) => updateSettingLocal('SITE_NAME', e.target.value, 'BRANDING')}
                                    placeholder="Örn: e-borsa.net"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium block">Site Logosu</label>
                                <div className="flex items-center gap-4">
                                    {getSetting('SITE_LOGO_URL') && (
                                        <div className="relative w-16 h-16 border rounded overflow-hidden">
                                            <img src={getSetting('SITE_LOGO_URL')} alt="Logo" className="object-contain w-full h-full" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            value={getSetting('SITE_LOGO_URL')}
                                            onChange={(e) => updateSettingLocal('SITE_LOGO_URL', e.target.value, 'BRANDING')}
                                            placeholder="URL girin veya yükleyin..."
                                            className="mb-2"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={uploading}
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                            >
                                                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                Logo Yükle
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Languages className="w-4 h-4" /> Varsayılan Dil
                                </label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={getSetting('DEFAULT_LANGUAGE') || 'tr'}
                                    onChange={(e) => updateSettingLocal('DEFAULT_LANGUAGE', e.target.value, 'BRANDING')}
                                >
                                    <option value="tr">Türkçe (TR)</option>
                                    <option value="en">English (EN)</option>
                                </select>
                            </div>

                            <Button onClick={() => handleSave(['SITE_NAME', 'SITE_LOGO_URL', 'DEFAULT_LANGUAGE'])} disabled={saving} className="w-full">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Marka Ayarlarını Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SEO Ayarları */}
                <TabsContent value="seo" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Ayarları</CardTitle>
                            <CardDescription>Arama motorları için sitenizin optimizasyon ayarları.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Anasayfa Başlığı (SEO Title)</label>
                                <Input
                                    value={getSetting('SEO_TITLE')}
                                    onChange={(e) => updateSettingLocal('SEO_TITLE', e.target.value, 'SEO')}
                                    placeholder="Örn: Borsa Takibi ve Analiz Platformu"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Anahtar Kelimeler (Keywords)</label>
                                <Input
                                    value={getSetting('SEO_KEYWORDS')}
                                    onChange={(e) => updateSettingLocal('SEO_KEYWORDS', e.target.value, 'SEO')}
                                    placeholder="borsa, takip, hisse senedi, analiz..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Site Açıklaması (Description)</label>
                                <Textarea
                                    value={getSetting('SEO_DESCRIPTION')}
                                    onChange={(e) => updateSettingLocal('SEO_DESCRIPTION', e.target.value, 'SEO')}
                                    placeholder="Site içeriği hakkında kısa bilgi..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <Button onClick={() => handleSave(['SEO_TITLE', 'SEO_KEYWORDS', 'SEO_DESCRIPTION'])} disabled={saving} className="w-full">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                SEO Ayarlarını Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sosyal Medya Ayarları */}
                <TabsContent value="social" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sosyal Medya Adresleri</CardTitle>
                            <CardDescription>Footer ve iletişim alanlarında görünecek linkler.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Twitter / X</label>
                                <Input
                                    value={getSetting('SOCIAL_X')}
                                    onChange={(e) => updateSettingLocal('SOCIAL_X', e.target.value, 'SOCIAL')}
                                    placeholder="https://x.com/kullaniciadi"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instagram</label>
                                <Input
                                    value={getSetting('SOCIAL_INSTAGRAM')}
                                    onChange={(e) => updateSettingLocal('SOCIAL_INSTAGRAM', e.target.value, 'SOCIAL')}
                                    placeholder="https://instagram.com/kullaniciadi"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Facebook</label>
                                <Input
                                    value={getSetting('SOCIAL_FACEBOOK')}
                                    onChange={(e) => updateSettingLocal('SOCIAL_FACEBOOK', e.target.value, 'SOCIAL')}
                                    placeholder="https://facebook.com/sayfaadi"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">LinkedIn</label>
                                <Input
                                    value={getSetting('SOCIAL_LINKEDIN')}
                                    onChange={(e) => updateSettingLocal('SOCIAL_LINKEDIN', e.target.value, 'SOCIAL')}
                                    placeholder="https://linkedin.com/company/sirketadi"
                                />
                            </div>
                            <Button onClick={() => handleSave(['SOCIAL_X', 'SOCIAL_INSTAGRAM', 'SOCIAL_FACEBOOK', 'SOCIAL_LINKEDIN'])} disabled={saving} className="w-full">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Sosyal Medya Linklerini Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
