'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Plus, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface SystemSetting {
    key: string;
    value: string;
    category: string;
    isSecret: boolean;
    updatedAt: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSetting, setNewSetting] = useState({ key: '', value: '', category: 'GENERAL', isSecret: false });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Scripts State
    const [scripts, setScripts] = useState({
        header: '',
        body: '',
        footer: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data: SystemSetting[] = await res.json();
                setSettings(data);

                // Populate Scripts
                setScripts({
                    header: data.find(s => s.key === 'SCRIPT_HEADER')?.value || '',
                    body: data.find(s => s.key === 'SCRIPT_BODY')?.value || '',
                    footer: data.find(s => s.key === 'SCRIPT_FOOTER')?.value || ''
                });
            } else {
                setMessage({ type: 'error', text: 'Ayarlar getirilemedi.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `Bağlantı hatası: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (setting: Partial<SystemSetting>) => {
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(setting),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Ayar başarıyla güncellendi' });
                fetchSettings();
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Güncelleme başarısız oldu' });
        }
    };

    const handleCreate = async () => {
        if (!newSetting.key || !newSetting.value) {
            setMessage({ type: 'error', text: 'Anahtar ve Değer zorunludur' });
            return;
        }
        await handleUpdate(newSetting);
        setNewSetting({ key: '', value: '', category: 'GENERAL', isSecret: false });
    };

    const handleSaveScripts = async () => {
        try {
            // Save all 3 scripts sequentially or in parallel
            await Promise.all([
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'SCRIPT_HEADER', value: scripts.header, category: 'SYSTEM', isSecret: false })
                }),
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'SCRIPT_BODY', value: scripts.body, category: 'SYSTEM', isSecret: false })
                }),
                fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'SCRIPT_FOOTER', value: scripts.footer, category: 'SYSTEM', isSecret: false })
                })
            ]);
            setMessage({ type: 'success', text: 'Takip kodları başarıyla kaydedildi!' });
            fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Kodlar kaydedilirken hata oluştu.' });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-6 space-y-6 container mx-auto max-w-6xl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Sistem Ayarları
                </h1>
            </div>

            {message && (
                <div className={`p-4 rounded-md flex justify-between items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="font-bold text-lg">×</button>
                </div>
            )}

            <Tabs defaultValue="scripts" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
                    <TabsTrigger value="scripts">Takip Kodları</TabsTrigger>
                    <TabsTrigger value="sms">SMS Ayarları</TabsTrigger>
                    <TabsTrigger value="general">Api Ayarları</TabsTrigger>
                </TabsList>

                {/* --- TRACKING SCRIPTS TAB --- */}
                {/* --- TRACKING SCRIPTS TAB --- */}
                <TabsContent value="scripts" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Genel Takip Kodları</CardTitle>
                            <CardDescription>
                                Google Analytics, Facebook Pixel veya diğer takip kodlarını buraya ekleyebilirsiniz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Header Kodları (&lt;head&gt; içine)</label>
                                <Textarea
                                    placeholder="<!-- Google Analytics -->"
                                    className="font-mono text-xs min-h-[150px]"
                                    value={scripts.header}
                                    onChange={(e) => setScripts({ ...scripts, header: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Body Kodları (&lt;body&gt; başlangıcına)</label>
                                <Textarea
                                    placeholder="<!-- GTM Noscript -->"
                                    className="font-mono text-xs min-h-[150px]"
                                    value={scripts.body}
                                    onChange={(e) => setScripts({ ...scripts, body: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Footer Kodları (&lt;body&gt; sonuna)</label>
                                <Textarea
                                    placeholder="<!-- Chat Widget -->"
                                    className="font-mono text-xs min-h-[150px]"
                                    value={scripts.footer}
                                    onChange={(e) => setScripts({ ...scripts, footer: e.target.value })}
                                />
                            </div>

                            <Button onClick={handleSaveScripts} className="w-full">
                                <Save className="mr-2 h-4 w-4" /> Tüm Kodları Kaydet
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NETGSM / SMS SETTINGS TAB (New) --- */}
                <TabsContent value="sms" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Netgsm SMS Ayarları</CardTitle>
                            <CardDescription>
                                SMS gönderimi için Netgsm API bilgilerinizi girin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Netgsm Kullanıcı Adı (850xxxxxxx)</label>
                                    <Input
                                        placeholder="850xxxxxxx"
                                        value={settings.find(s => s.key === 'NETGSM_USER')?.value || ''}
                                        onChange={(e) => {
                                            const newSettings = settings.map(s => s.key === 'NETGSM_USER' ? { ...s, value: e.target.value } : s);
                                            if (!settings.find(s => s.key === 'NETGSM_USER')) {
                                                newSettings.push({ key: 'NETGSM_USER', value: e.target.value, category: 'NOTIFICATION', isSecret: false, updatedAt: new Date().toISOString() });
                                            }
                                            setSettings(newSettings);
                                        }}
                                    />
                                    <Button size="sm" className="w-fit" onClick={() => handleUpdate({ key: 'NETGSM_USER', value: settings.find(s => s.key === 'NETGSM_USER')?.value, category: 'NOTIFICATION' })}>Kaydet</Button>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Netgsm Şifre</label>
                                    <Input
                                        type="password"
                                        placeholder="******"
                                        value={settings.find(s => s.key === 'NETGSM_PASSWORD')?.value || ''}
                                        onChange={(e) => {
                                            const newSettings = settings.map(s => s.key === 'NETGSM_PASSWORD' ? { ...s, value: e.target.value } : s);
                                            if (!settings.find(s => s.key === 'NETGSM_PASSWORD')) {
                                                newSettings.push({ key: 'NETGSM_PASSWORD', value: e.target.value, category: 'NOTIFICATION', isSecret: true, updatedAt: new Date().toISOString() });
                                            }
                                            setSettings(newSettings);
                                        }}
                                    />
                                    <Button size="sm" className="w-fit" onClick={() => handleUpdate({ key: 'NETGSM_PASSWORD', value: settings.find(s => s.key === 'NETGSM_PASSWORD')?.value, category: 'NOTIFICATION', isSecret: true })}>Kaydet</Button>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">SMS Başlığı (Header)</label>
                                    <Input
                                        placeholder="Örn: BORSA"
                                        value={settings.find(s => s.key === 'NETGSM_HEADER')?.value || ''}
                                        onChange={(e) => {
                                            const newSettings = settings.map(s => s.key === 'NETGSM_HEADER' ? { ...s, value: e.target.value } : s);
                                            if (!settings.find(s => s.key === 'NETGSM_HEADER')) {
                                                newSettings.push({ key: 'NETGSM_HEADER', value: e.target.value, category: 'NOTIFICATION', isSecret: false, updatedAt: new Date().toISOString() });
                                            }
                                            setSettings(newSettings);
                                        }}
                                    />
                                    <Button size="sm" className="w-fit" onClick={() => handleUpdate({ key: 'NETGSM_HEADER', value: settings.find(s => s.key === 'NETGSM_HEADER')?.value, category: 'NOTIFICATION' })}>Kaydet</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- GENERAL SETTINGS TAB (Previous Content) --- */}
                <TabsContent value="general" className="space-y-6 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Yeni Ayar Ekle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-sm font-medium">Anahtar (Key)</label>
                                    <Input
                                        placeholder="örn: GEMINI_API_KEY"
                                        value={newSetting.key}
                                        onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-sm font-medium">Değer (Value)</label>
                                    <Input
                                        placeholder="Değer"
                                        value={newSetting.value}
                                        onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Kategori</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newSetting.category}
                                        onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
                                    >
                                        <option value="GENERAL">Genel</option>
                                        <option value="AI">Yapay Zeka (AI)</option>
                                        <option value="MARKET">Borsa/Piyasa</option>
                                        <option value="NOTIFICATION">Bildirim</option>
                                        <option value="SYSTEM">Sistem</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 pb-3">
                                    <input
                                        type="checkbox"
                                        id="isSecretNew"
                                        checked={newSetting.isSecret}
                                        onChange={(e) => setNewSetting({ ...newSetting, isSecret: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="isSecretNew" className="text-sm">Gizli</label>
                                </div>

                                <Button onClick={handleCreate} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Ekle
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mevcut Ayarlar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground font-medium border-b">
                                        <tr>
                                            <th className="p-4">Anahtar (Key)</th>
                                            <th className="p-4">Değer (Value)</th>
                                            <th className="p-4">Kategori</th>
                                            <th className="p-4">Gizli</th>
                                            <th className="p-4 w-[100px]">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {settings.filter(s =>
                                            !s.key.startsWith('SCRIPT_') &&
                                            !s.key.startsWith('CONTACT_') &&
                                            s.key !== 'DEFAULT_WATCHLIST'
                                        ).map((setting) => (
                                            <tr key={setting.key} className="hover:bg-muted/50 transition-colors">
                                                <td className="p-4 font-mono font-medium">{setting.key}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type={setting.isSecret ? "password" : "text"}
                                                            defaultValue={setting.value}
                                                            onChange={(e) => setting.value = e.target.value}
                                                            className="font-mono text-xs h-8 min-w-[200px]"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                        {setting.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-muted-foreground">{setting.isSecret ? 'Evet' : 'Hayır'}</td>
                                                <td className="p-4">
                                                    <Button size="sm" variant="ghost" onClick={() => handleUpdate(setting)}>
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {settings.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    Hiçbir ayar bulunamadı.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
