
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSnackbar } from 'notistack';
import axios from 'axios';

export function NotificationSettings() {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [settings, setSettings] = useState({
        telegramChatId: '',
        telegramEnabled: false,
        emailEnabled: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/user/notifications');
            setSettings({
                telegramChatId: res.data.telegramChatId || '',
                telegramEnabled: res.data.telegramEnabled,
                emailEnabled: res.data.emailEnabled
            });
            if (res.data.telegramChatId) {
                setIsConnected(true);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/user/notifications', settings);
            enqueueSnackbar('Bildirim ayarları kaydedildi.', { variant: 'success' });
            if (settings.telegramChatId) {
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (error) {
            enqueueSnackbar('Kaydedilemedi.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-4 border-gray-200/80 dark:border-white/20 shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute top-0 left-0 -mt-8 -ml-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-20"></div>

            <div className="relative p-8">
                <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        Bildirim Ayarları
                    </CardTitle>
                    <CardDescription className="mt-2">
                        Fiyat alarmları ve önemli gelişmelerden nasıl haberdar olmak istediğinizi seçin.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Telegram Section */}
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1-2.4-1.6-.96-.64-.26-1 0-1.72.68-1.9 4-5.68 4-5.68.2-.26-.14-.4-.5-.22-.38.18-5.32 3.4-5.32 3.4l-3.14-.98c-.7-.22-.72-.72.16-1.06 2.8-1.2 9.54-3.56 9.54-3.56s3.3-.34 1.72 4.96z" />
                                    </svg>
                                </div>
                                <div>
                                    <label className="font-semibold text-gray-900 dark:text-gray-100">Telegram Bildirimleri</label>
                                    <p className="text-xs text-gray-500">Botumuz size Telegram üzerinden mesaj atar.</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.telegramEnabled}
                                onCheckedChange={(checked) => setSettings({ ...settings, telegramEnabled: checked })}
                            />
                        </div>

                        {settings.telegramEnabled && (
                            <div className="ml-0 sm:ml-12 space-y-4">
                                {settings.telegramChatId ? (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900 dark:text-green-100">Telegram Botu Bağlandı</p>
                                                <p className="text-xs text-green-700 dark:text-green-300 font-mono mt-0.5">Chat ID: {settings.telegramChatId}</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                if (!confirm("Telegram bağlantısını kesmek istediğinize emin misiniz?")) return;
                                                try {
                                                    const newSettings = { ...settings, telegramChatId: '', telegramEnabled: false };
                                                    await axios.post('/api/user/notifications', newSettings);
                                                    setSettings(newSettings);
                                                    setIsConnected(false);
                                                    enqueueSnackbar('Bağlantı kesildi.', { variant: 'success' });
                                                } catch (e) {
                                                    enqueueSnackbar('İşlem başarısız.', { variant: 'error' });
                                                }
                                            }}
                                            className="w-full sm:w-auto"
                                        >
                                            Bağlantıyı Kes
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Input
                                            label="Telegram Chat ID"
                                            value={settings.telegramChatId}
                                            onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                                            placeholder="Örn: 123456789"
                                            className="bg-white dark:bg-gray-800"
                                        />
                                        <div className="text-xs text-gray-500">
                                            <p>Chat ID'nizi öğrenmek için Telegram botumuza <strong>/start</strong> yazın (Bot adı eklenecek).</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Email Section */}
                    {/*
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700 dark:text-gray-300">E-posta Bildirimleri</label>
                                <p className="text-xs text-gray-500">Geliştirme aşamasında.</p>
                            </div>
                        </div>
                        <Switch disabled checked={false} />
                    </div>
                    */}

                    <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
