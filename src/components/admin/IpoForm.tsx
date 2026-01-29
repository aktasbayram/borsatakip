"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface IpoFormProps {
    initialData?: any;
}

export function IpoForm({ initialData }: IpoFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: initialData?.code || "",
        company: initialData?.company || "",
        status: initialData?.status || "DRAFT",
        isNew: initialData?.isNew || false,
        statusText: initialData?.statusText || "",
        date: initialData?.date || "",
        price: initialData?.price || "",
        lotCount: initialData?.lotCount || "",
        market: initialData?.market || "",
        distributionMethod: initialData?.distributionMethod || "",
        url: initialData?.url || "",
        imageUrl: initialData?.imageUrl || "",
    });

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await axios.put(`/api/admin/ipos/${initialData.id}`, formData);
            } else {
                await axios.post("/api/admin/ipos", formData);
            }
            router.push("/admin/ipos");
            router.refresh();
        } catch (error: any) {
            console.error("Failed to save IPO:", error);

            // Show the specific error message from the server if available
            if (error.response?.data) {
                // If the error confirms DB sync issue, explicitly guide the user
                if (typeof error.response.data === 'string' && error.response.data.includes('schema not synced')) {
                    alert('⚠️ KRİTİK EYLEM GEREKİYOR: \n\n' + error.response.data + '\n\nLütfen terminali kapatıp "npx prisma generate" çalıştırın, sonra tekrar başlatın.');
                } else {
                    alert(`Hata: ${error.response.data}`);
                }
            } else {
                alert("Bir hata oluştu. Lütfen tekrar deneyin.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bist Kodu (Benzersiz)</Label>
                            <Input
                                required
                                value={formData.code}
                                onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                                placeholder="ORNEK"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Şirket Adı</Label>
                            <Input
                                required
                                value={formData.company}
                                onChange={(e) => handleChange("company", e.target.value)}
                                placeholder="Örnek Şirket A.Ş."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Durum</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => handleChange("status", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Taslak (Draft)</SelectItem>
                                    <SelectItem value="NEW">Yeni (Onaylı/Talep Bekleyen)</SelectItem>
                                    <SelectItem value="ACTIVE">Aktif (İşleme Başladı/Eski)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-4 border p-3 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Yeni Etiketi</Label>
                                <p className="text-xs text-muted-foreground">Listede "YENİ" olarak işaretlenir</p>
                            </div>
                            <Switch
                                checked={formData.isNew}
                                onCheckedChange={(val) => handleChange("isNew", val)}
                                className="ml-auto"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Özel Durum Metni (Opsiyonel)</Label>
                        <Input
                            value={formData.statusText}
                            onChange={(e) => handleChange("statusText", e.target.value)}
                            placeholder="TALEP TOPLANIYOR"
                        />
                        <p className="text-[10px] text-muted-foreground">Boş bırakılırsa otomatik belirlenir. Animasyonlu rozet için "TALEP TOPLANIYOR" yazın.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tarih</Label>
                            <Input value={formData.date} onChange={(e) => handleChange("date", e.target.value)} placeholder="28-29-30 Ocak" />
                        </div>
                        <div className="space-y-2">
                            <Label>Fiyat</Label>
                            <Input value={formData.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="21,50 TL" />
                        </div>
                        <div className="space-y-2">
                            <Label>Lot Sayısı</Label>
                            <Input value={formData.lotCount} onChange={(e) => handleChange("lotCount", e.target.value)} placeholder="50.000.000 Lot" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pazar</Label>
                            <Input value={formData.market} onChange={(e) => handleChange("market", e.target.value)} placeholder="Yıldız Pazar" />
                        </div>
                        <div className="space-y-2">
                            <Label>Dağıtım Yöntemi</Label>
                            <Input value={formData.distributionMethod} onChange={(e) => handleChange("distributionMethod", e.target.value)} placeholder="Eşit Dağıtım" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Detay URL (Opsiyonel)</Label>
                        <Input value={formData.url} onChange={(e) => handleChange("url", e.target.value)} placeholder="https://halkarz.com/..." />
                        <p className="text-[10px] text-muted-foreground">Detaylar çekilemezse yönlendirilecek link.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Logo URL (Opsiyonel)</Label>
                        <Input value={formData.imageUrl} onChange={(e) => handleChange("imageUrl", e.target.value)} placeholder="https://..." />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/ipos")}>
                    İptal
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Kaydet
                </Button>
            </div>
        </form>
    );
}
