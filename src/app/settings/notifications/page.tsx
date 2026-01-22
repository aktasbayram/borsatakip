'use client';

import { useState, useEffect } from 'react';
import { generateTelegramCode, toggleNotification, getNotificationSettings } from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Send, Mail } from 'lucide-react';
import { useSnackbar } from 'notistack';

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        getNotificationSettings().then(s => {
            setSettings(s);
            setLoading(false);
        });
    }, []);

    const handleGenerateCode = async () => {
        const newCode = await generateTelegramCode();
        setCode(newCode);
        enqueueSnackbar("Doğrulama kodu oluşturuldu!", { variant: 'success' });
    };

    const handleToggle = async (type: 'telegram' | 'email', checked: boolean) => {
        // Optimistic update
        setSettings((prev: any) => ({ ...prev, [type === 'telegram' ? 'telegramEnabled' : 'emailEnabled']: checked }));
        await toggleNotification(type, checked);
        enqueueSnackbar("Ayarlar güncellendi", { variant: 'success' });
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Bildirim Ayarları</h1>
                <p className="text-muted-foreground">
                    Piyasa hareketlerinden anında haberdar olmak için kanallarınızı yönetin.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Telegram Integration */}
                <Card className={settings?.telegramEnabled ? "border-green-500/50" : ""}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-blue-500" /> Telegram Entegrasyonu
                        </CardTitle>
                        <CardDescription>
                            Anlık bildirimler için Telegram botumuzu bağlayın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {settings?.telegramChatId ? (
                            <div className="flex items-center justify-between bg-green-500/10 p-4 rounded-lg">
                                <span className="text-green-600 font-medium">✅ Bağlandı</span>
                                <Switch
                                    checked={settings.telegramEnabled}
                                    onCheckedChange={(c) => handleToggle('telegram', c)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm">1. Botumuzu başlatın: <a href="https://t.me/YourBotName" target="_blank" className="font-bold underline text-primary">@BorsaTakipBot</a></p>
                                <p className="text-sm">2. Aşağıdaki kodu bota gönderin: <b>/start {code || "..."}</b></p>
                                {code ? (
                                    <div className="p-4 bg-muted font-mono text-center text-xl tracking-widest rounded-md border-2 border-primary border-dashed">
                                        {code}
                                    </div>
                                ) : (
                                    <Button onClick={handleGenerateCode} className="w-full">
                                        Kod Oluştur
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Email Integration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-orange-500" /> E-posta Bildirimleri
                        </CardTitle>
                        <CardDescription>
                            Günlük özetler ve kritik uyarılar için.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex flex-col">
                                <span className="font-medium">E-posta Uyarıları</span>
                                <span className="text-sm text-muted-foreground">{settings?.emailEnabled ? 'Aktif' : 'Devre Dışı'}</span>
                            </div>
                            <Switch
                                checked={settings?.emailEnabled}
                                onCheckedChange={(c) => handleToggle('email', c)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
