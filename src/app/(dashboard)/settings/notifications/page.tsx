'use client';

import { useState, useEffect } from 'react';
import { generateTelegramCode, toggleNotification, getNotificationSettings, updateSmtpSettings } from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Mail, Server } from 'lucide-react';
import { useSnackbar } from 'notistack';

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingSmtp, setSavingSmtp] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // SMTP Form State
    const [smtpForm, setSmtpForm] = useState({
        host: '',
        port: 587,
        user: '',
        password: '',
        secure: false
    });

    useEffect(() => {
        getNotificationSettings().then(s => {
            setSettings(s);
            if (s) {
                setSmtpForm({
                    host: s.smtpHost || '',
                    port: s.smtpPort || 587,
                    user: s.smtpUser || '',
                    password: s.smtpPassword || '', // Password might not be returned for security, but usually is for edit
                    secure: s.smtpSecure ?? false
                });
            }
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

    const handleSaveSmtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSmtp(true);
        try {
            await updateSmtpSettings(smtpForm);
            enqueueSnackbar("SMTP ayarları kaydedildi.", { variant: 'success' });
            // Refresh settings to confirm
            const updated = await getNotificationSettings();
            setSettings(updated);
        } catch (error) {
            enqueueSnackbar("Kaydedilirken hata oluştu.", { variant: 'error' });
        } finally {
            setSavingSmtp(false);
        }
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
                <Card className="md:row-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-orange-500" /> E-posta Bildirimleri
                        </CardTitle>
                        <CardDescription>
                            Günlük özetler ve kritik uyarılar için.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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

                        {/* SMTP Settings Form */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Server className="h-4 w-4" /> SMTP Sunucu Ayarları
                            </h3>
                            <form onSubmit={handleSaveSmtp} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="smtpHost">SMTP Host</Label>
                                    <Input
                                        id="smtpHost"
                                        placeholder="smtp.gmail.com"
                                        value={smtpForm.host}
                                        onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="smtpPort">Port</Label>
                                        <Input
                                            id="smtpPort"
                                            placeholder="587"
                                            type="number"
                                            value={smtpForm.port}
                                            onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="grid gap-2 items-center">
                                        <div className="flex items-center space-x-2 mt-6">
                                            <Switch
                                                id="smtpSecure"
                                                checked={smtpForm.secure}
                                                onCheckedChange={(c) => setSmtpForm({ ...smtpForm, secure: c })}
                                            />
                                            <Label htmlFor="smtpSecure">SSL/TLS</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="smtpUser">Kullanıcı Adı (E-posta)</Label>
                                    <Input
                                        id="smtpUser"
                                        placeholder="ornek@gmail.com"
                                        value={smtpForm.user}
                                        onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="smtpPassword">Şifre / App Password</Label>
                                    <Input
                                        id="smtpPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={smtpForm.password}
                                        onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={savingSmtp}>
                                    {savingSmtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Ayarları Kaydet
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
