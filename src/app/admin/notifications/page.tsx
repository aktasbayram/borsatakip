'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSnackbar } from 'notistack';
import axios from 'axios';

export default function AdminNotificationsPage() {
    const { enqueueSnackbar } = useSnackbar();

    // Form state
    const [targetType, setTargetType] = useState<'ALL' | 'USER'>('ALL');
    const [targetUserEmail, setTargetUserEmail] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [type, setType] = useState('INFO');
    const [sendInApp, setSendInApp] = useState(true);
    const [sendBrowser, setSendBrowser] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (targetType === 'USER' && !targetUserEmail) {
            enqueueSnackbar('Kullanıcı e-posta adresi gerekli', { variant: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/admin/notifications', {
                targetType,
                targetUserEmail,
                title,
                message,
                link,
                type,
                sendInApp,
                sendBrowser
            });
            enqueueSnackbar('Bildirim gönderildi', { variant: 'success' });
            // Reset form
            setTitle('');
            setMessage('');
            setLink('');
            setType('INFO');
            setSendInApp(true);
            setSendBrowser(false);
        } catch (error: any) {
            const msg = error.response?.data || 'Bildirim gönderilemedi';
            enqueueSnackbar(msg, { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Bildirimleri</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Bildirim Gönder</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="targetType">Hedef Kitle</Label>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={targetType === 'ALL' ? 'primary' : 'outline'}
                                    onClick={() => setTargetType('ALL')}
                                >
                                    Tüm Kullanıcılar
                                </Button>
                                <Button
                                    type="button"
                                    variant={targetType === 'USER' ? 'primary' : 'outline'}
                                    onClick={() => setTargetType('USER')}
                                >
                                    Tek Kullanıcı
                                </Button>
                            </div>
                        </div>

                        {targetType === 'USER' && (
                            <div className="space-y-2">
                                <Label htmlFor="email">Kullanıcı E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={targetUserEmail}
                                    onChange={e => setTargetUserEmail(e.target.value)}
                                    required={targetType === 'USER'}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="type">Bildirim Türü</Label>
                            <select
                                id="type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="INFO">Bilgi (Mavi)</option>
                                <option value="SUCCESS">Başarılı (Yeşil)</option>
                                <option value="WARNING">Uyarı (Sarı)</option>
                                <option value="ERROR">Hata (Kırmızı)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık</Label>
                            <Input
                                id="title"
                                placeholder="Bildirim başlığı..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Mesaj</Label>
                            <Input
                                id="message"
                                placeholder="Bildirim içeriği..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={sendInApp}
                                    onChange={e => setSendInApp(e.target.checked)}
                                />
                                <span>Site İçi Bildirim (Zil + Toast)</span>
                            </Label>
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={sendBrowser}
                                    onChange={e => setSendBrowser(e.target.checked)}
                                />
                                <span>Tarayıcı Bildirimi</span>
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Link (İsteğe Bağlı)</Label>
                            <Input
                                id="link"
                                placeholder="/market/us veya https://google.com"
                                value={link}
                                onChange={e => setLink(e.target.value)}
                            />
                        </div>

                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting ? 'Gönderiliyor...' : 'Gönder'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sorun Giderme</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                        Tarayıcı bildirimlerinin çalışıp çalışmadığını test etmek için aşağıdaki butonu kullanın.
                        Tarayıcınızın izin istemesi durumunda lütfen izin verin.
                    </p>
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            if (!('Notification' in window)) {
                                enqueueSnackbar('Tarayıcınız bildirimleri desteklemiyor.', { variant: 'error' });
                                return;
                            }

                            if (Notification.permission !== 'granted') {
                                const permission = await Notification.requestPermission();
                                if (permission !== 'granted') {
                                    enqueueSnackbar('Bildirim izni reddedildi.', { variant: 'error' });
                                    return;
                                }
                            }

                            try {
                                new Notification('Test Bildirimi', {
                                    body: 'Bu bir test tarayıcı bildirimidir.',
                                    icon: '/favicon.ico'
                                });
                                enqueueSnackbar('Test bildirimi gönderildi.', { variant: 'success' });
                            } catch (e) {
                                enqueueSnackbar('Bildirim oluşturulamadı.', { variant: 'error' });
                                console.error(e);
                            }
                        }}
                    >
                        Test Bildirimi Gönder (Masaüstü)
                    </Button>
                </CardContent>
            </Card>
        </div >
    );
}
