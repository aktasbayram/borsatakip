'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';

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
            } else {
                const errText = await res.text();
                console.error('Fetch error:', res.status, errText);
                setMessage({
                    type: 'error',
                    text: `Failed to fetch settings: ${res.status} ${res.statusText} - ${errText.substring(0, 50)}...`
                });
            }
        } catch (error: any) {
            console.error('Network error:', error);
            setMessage({ type: 'error', text: `Network error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (setting: SystemSetting) => {
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(setting),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Setting updated successfully' });
                fetchSettings();
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update setting' });
        }
    };

    const handleCreate = async () => {
        if (!newSetting.key || !newSetting.value) {
            setMessage({ type: 'error', text: 'Key and Value are required' });
            return;
        }
        await handleUpdate(newSetting as SystemSetting);
        setNewSetting({ key: '', value: '', category: 'GENERAL', isSecret: false });
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-6 space-y-6 container mx-auto max-w-6xl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    API & Sistem Ayarları
                </h1>
            </div>

            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text === 'Setting updated successfully' ? 'Ayar başarıyla güncellendi' :
                        message.text === 'Key and Value are required' ? 'Anahtar ve Değer zorunludur' :
                            message.text}
                    <button onClick={() => setMessage(null)} className="float-right font-bold">×</button>
                </div>
            )}

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
                    <div className="rounded-md border">
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
                                {settings.map((setting) => (
                                    <tr key={setting.key} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4 font-mono font-medium">{setting.key}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type={setting.isSecret ? "password" : "text"}
                                                    defaultValue={setting.value}
                                                    onChange={(e) => setting.value = e.target.value}
                                                    className="font-mono text-xs h-8"
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
        </div>
    );
}
