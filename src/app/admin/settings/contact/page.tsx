'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSnackbar } from "notistack";

export default function ContactSettingsPage() {
    const [config, setConfig] = useState<Record<string, string>>({
        CONTACT_ADDRESS: "",
        CONTACT_PHONE: "",
        CONTACT_EMAIL: "",
        CONTACT_MAP_URL: ""
    });
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        axios.get("/api/settings/contact")
            .then(res => {
                // Merge with defaults to ensure controlled inputs
                setConfig(prev => ({ ...prev, ...res.data }));
            })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put("/api/settings/contact", config);
            enqueueSnackbar("İletişim ayarları güncellendi", { variant: "success" });
        } catch (error) {
            enqueueSnackbar("Güncelleme başarısız", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                    İletişim Ayarları
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    İletişim sayfasında görünecek bilgileri buradan yönetebilirsiniz.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Genel Bilgiler</CardTitle>
                        <CardDescription>
                            Kullanıcıların size ulaşabileceği kanalları belirleyin. Boş bırakılan alanlar sayfada görünmez.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="CONTACT_PHONE">Telefon</Label>
                                <Input
                                    id="CONTACT_PHONE"
                                    name="CONTACT_PHONE"
                                    placeholder="+90 555 123 45 67"
                                    value={config.CONTACT_PHONE}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="CONTACT_EMAIL">E-posta</Label>
                                <Input
                                    id="CONTACT_EMAIL"
                                    name="CONTACT_EMAIL"
                                    placeholder="info@sirket.com"
                                    value={config.CONTACT_EMAIL}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="CONTACT_ADDRESS">Adres</Label>
                            <Textarea
                                id="CONTACT_ADDRESS"
                                name="CONTACT_ADDRESS"
                                placeholder="Şirket açık adresi..."
                                className="min-h-[100px]"
                                value={config.CONTACT_ADDRESS}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="CONTACT_MAP_URL">Google Maps Embed URL</Label>
                            <Input
                                id="CONTACT_MAP_URL"
                                name="CONTACT_MAP_URL"
                                placeholder="https://www.google.com/maps/embed?..."
                                value={config.CONTACT_MAP_URL}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-gray-500">
                                Google Maps'ten "Paylaş" &gt; "Harita Yerleştir" (Embed) seçeneğini kullanarak URL'yi (src attr) kopyalayın.
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
