'use client';

import { useState, useEffect } from 'react';
import { generateTelegramCode, toggleNotification, getNotificationSettings, updateSmtpSettings } from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
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

    const [userCredits, setUserCredits] = useState(0);
    const [userPackage, setUserPackage] = useState('FREE');
    const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getNotificationSettings().then(s => {
            setSettings(s);
            if (s) {
                setSmtpForm({
                    host: s.smtpHost || '',
                    port: s.smtpPort || 587,
                    user: s.smtpUser || '',
                    password: s.smtpPassword || '',
                    secure: s.smtpSecure ?? false
                });
            }
            setLoading(false);
        });

        // Fetch user profile for credits and phone number
        fetch('/api/user/profile').then(res => res.json()).then(data => {
            if (data.smsCredits !== undefined) setUserCredits(data.smsCredits);
            if (data.subscriptionTier) setUserPackage(data.subscriptionTier);
            if (data.phoneNumber) setHasPhoneNumber(true);
        });
    }, []);

    const handleGenerateCode = async () => {
        const newCode = await generateTelegramCode();
        setCode(newCode);
        enqueueSnackbar("Doğrulama kodu oluşturuldu!", { variant: 'success' });
    };

    const handleToggle = async (type: 'telegram' | 'email' | 'site' | 'sms', checked: boolean) => {
        // Check for phone number first
        if (type === 'sms' && checked && !hasPhoneNumber) {
            enqueueSnackbar("SMS bildirimlerini açmak için önce telefon numaranızı eklemelisiniz.", {
                variant: 'warning',
                action: (key) => (
                    <Button size="sm" variant="outline" onClick={() => router.push('/settings/account')}>
                        Ekle
                    </Button>
                )
            });
            return;
        }

        // Check for SMS credits
        if (type === 'sms' && checked && userCredits <= 0) {
            enqueueSnackbar("SMS krediniz bitmiştir. Paket yenilemek için tıklayın.", {
                variant: 'error',
                action: (key) => (
                    <Button size="sm" variant="secondary" onClick={() => router.push('/upgrade')}>
                        Paket Al
                    </Button>
                ),
                persist: true
            });
            return;
        }

        // Optimistic update
        const key = type === 'telegram' ? 'telegramEnabled' : type === 'email' ? 'emailEnabled' : type === 'site' ? 'siteEnabled' : 'smsEnabled';
        setSettings((prev: any) => ({ ...prev, [key]: checked }));

        await toggleNotification(type as any, checked);
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
                            <div className="flex flex-col gap-4 bg-green-500/10 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-green-600 font-medium flex items-center gap-2">
                                        ✅ Bağlandı
                                        <span className="text-xs text-muted-foreground font-mono">({settings.telegramChatId})</span>
                                    </span>
                                    <Switch
                                        checked={settings.telegramEnabled}
                                        onCheckedChange={(c) => handleToggle('telegram', c)}
                                    />
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={async () => {
                                        if (!confirm('Bağlantıyı koparmak istediğinize emin misiniz?')) return;
                                        // We need to implement disconnect logic here.
                                        // Since we used actions in this file, let's use a server action or API.
                                        // I'll assume we can add a disconnectTelegram action or use fetch.
                                        // Let's use fetch to my new API for consistency/ease since I know it works.
                                        try {
                                            await fetch('/api/user/notifications', {
                                                method: 'POST',
                                                body: JSON.stringify({ telegramChatId: '', telegramEnabled: false, emailEnabled: settings.emailEnabled })
                                            });
                                            setSettings((prev: any) => ({ ...prev, telegramChatId: '', telegramEnabled: false }));
                                            enqueueSnackbar("Bağlantı koparıldı", { variant: 'success' });
                                        } catch (e) {
                                            enqueueSnackbar("Hata oluştu", { variant: 'error' });
                                        }
                                    }}
                                >
                                    Bağlantıyı Kopar
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <p>1. <a href="https://t.me/byborsatakipbot" target="_blank" className="font-bold underline text-blue-500 hover:text-blue-600">@byborsatakipbot</a> adresine gidin ve <strong>BAŞLAT</strong> butonuna tıklayın.</p>
                                    <p>2. "Kod Oluştur" butonuna tıklayıp size özel komutu alın.</p>
                                    <p>3. Aşağıdaki komutu olduğu gibi kopyalayıp bota gönderin (Sadece kodu değil, başındaki /start ile birlikte).</p>
                                </div>
                                {code ? (
                                    <div className="space-y-2">
                                        <div className="p-4 bg-muted font-mono text-center text-2xl tracking-widest font-bold rounded-md border-2 border-primary border-dashed select-all cursor-pointer hover:bg-muted/80 transition-colors"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`/start ${code}`);
                                                enqueueSnackbar("Komut kopyalandı!", { variant: 'success' });
                                            }}
                                        >
                                            /start {code}
                                        </div>
                                        <p className="text-xs text-center text-muted-foreground">Kopyalamak için kutuya tıklayın</p>
                                    </div>
                                ) : (
                                    <Button onClick={handleGenerateCode} className="w-full">
                                        Kod Oluştur
                                    </Button>
                                )}
                            </div>
                        )}
                        {/* Site Notifications */}
                        <Card className={settings?.siteEnabled ? "border-violet-500/50" : ""}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">🔔</span> Site Bildirimleri
                                </CardTitle>
                                <CardDescription>
                                    Tarayıcı ve uygulama içi anlık bildirimler.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800 rounded-lg">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-violet-900 dark:text-violet-100">Site İçi Uyarılar</span>
                                        <span className="text-sm text-violet-600 dark:text-violet-300">
                                            {settings?.siteEnabled ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={settings?.siteEnabled}
                                        onCheckedChange={(c) => handleToggle('site', c)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* SMS Notifications (Pro Only) */}
                        <Card className={settings?.smsEnabled ? "border-blue-500/50" : ""}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-2xl">📱</span> SMS Bildirimleri
                                    <span className={`ml-auto text-xs font-normal px-2 py-1 bg-gradient-to-r text-white rounded-full ${userPackage === 'PRO' ? 'from-indigo-500 to-purple-600' :
                                        userPackage === 'BASIC' ? 'from-blue-500 to-cyan-600' : 'from-gray-500 to-gray-600'
                                        }`}>
                                        {userPackage}
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    Kritik ani fiyat hareketlerini SMS olarak cebinize gelsin.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-blue-900 dark:text-blue-100">SMS Uyarıları</span>
                                        <span className="text-sm text-blue-600 dark:text-blue-300">
                                            {settings?.smsEnabled ? 'Aktif' : 'Pasif'}
                                            {/* Show credits if enabled or user has credits */}
                                            <span className="ml-2 px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold flex items-center">
                                                Kalan: {userCredits} SMS
                                                {userCredits <= 0 && (
                                                    <span
                                                        onClick={() => router.push('/upgrade')}
                                                        className="ml-2 pl-2 border-l border-blue-400 cursor-pointer hover:underline hover:text-blue-900 dark:hover:text-blue-100"
                                                    >
                                                        (Yükle)
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </div>
                                    <Switch
                                        checked={settings?.smsEnabled}
                                        onCheckedChange={(c) => handleToggle('sms', c)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

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
