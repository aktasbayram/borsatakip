'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSnackbar } from 'notistack';
import axios from 'axios';

export default function DashboardSettingsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [preferences, setPreferences] = useState({
        showAgenda: true,
        showIpo: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await axios.get('/api/user/preferences');
                if (res.data) {
                    setPreferences(prev => ({ ...prev, ...res.data }));
                }
            } catch (error) {
                console.error('Failed to fetch preferences', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);

    const updatePreference = async (key: string, value: boolean) => {
        // Optimistic update
        setPreferences(prev => ({ ...prev, [key]: value }));

        try {
            await axios.post('/api/user/preferences', { [key]: value });
            enqueueSnackbar('Ayarlar güncellendi', { variant: 'success' });
            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event('preferences-updated'));
        } catch (error) {
            enqueueSnackbar('Güncelleme başarısız', { variant: 'error' });
            // Revert on failure
            setPreferences(prev => ({ ...prev, [key]: !value }));
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Görünümü</h1>
                <p className="text-sm text-gray-500 mt-1">Ana sayfada hangi widget'ların görüneceğini seçin.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Widget Ayarları</CardTitle>
                    <CardDescription>
                        Dashboard'da görüntülemek istediğiniz widget'ları açıp kapatabilirsiniz.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="showAgenda" className="text-base font-medium">Ekonomik Takvim</Label>
                            <p className="text-sm text-muted-foreground">
                                Ekonomik takvim ve önemli olayları göster.
                            </p>
                        </div>
                        <Switch
                            id="showAgenda"
                            checked={preferences.showAgenda}
                            onCheckedChange={(checked) => updatePreference('showAgenda', checked)}
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="showIpo" className="text-base font-medium">Halka Arzlar</Label>
                            <p className="text-sm text-muted-foreground">
                                Yeni halka arzları göster.
                            </p>
                        </div>
                        <Switch
                            id="showIpo"
                            checked={preferences.showIpo}
                            onCheckedChange={(checked) => updatePreference('showIpo', checked)}
                            disabled={loading}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
