"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSnackbar } from "notistack";
import axios from "axios";
import { Loader2, Save, X } from "lucide-react";

interface EditorChoiceFormProps {
    initialData?: any;
}

export function EditorChoiceForm({ initialData }: EditorChoiceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const [formData, setFormData] = useState({
        symbol: initialData?.symbol || "",
        title: initialData?.title || "",
        content: initialData?.content || "",
        technicalReview: initialData?.technicalReview || "",
        fundamentalReview: initialData?.fundamentalReview || "",
        targetPrice: initialData?.targetPrice || "",
        stopLoss: initialData?.stopLoss || "",
        chartUrl: initialData?.chartUrl || "",
        isPublished: initialData?.isPublished !== undefined ? initialData.isPublished : true,
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/admin/editor-choices/${initialData.id}`, formData);
                enqueueSnackbar("Analiz başarıyla güncellendi", { variant: "success" });
            } else {
                await axios.post("/api/admin/editor-choices", formData);
                enqueueSnackbar("Analiz başarıyla oluşturuldu", { variant: "success" });
            }
            router.push("/admin/editor-choices");
            router.refresh();
        } catch (error: any) {
            const message = error.response?.data || "Bir hata oluştu";
            enqueueSnackbar(message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="symbol">Hisse Kodu (Örn: THYAO)</Label>
                    <Input
                        id="symbol"
                        required
                        placeholder="THYAO"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                        id="title"
                        required
                        placeholder="Teknik Görünüm Pozitif"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Genel Yorum / Özet Analiz</Label>
                <Textarea
                    id="content"
                    required
                    placeholder="Hisse hakkındaki genel görüşünüz..."
                    className="min-height-[100px]"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="technicalReview">Teknik Analiz Detayı (Opsiyonel)</Label>
                    <Textarea
                        id="technicalReview"
                        placeholder="Destek, direnç, formasyon bilgileri..."
                        value={formData.technicalReview}
                        onChange={(e) => setFormData({ ...formData, technicalReview: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fundamentalReview">Temel Analiz Detayı (Opsiyonel)</Label>
                    <Textarea
                        id="fundamentalReview"
                        placeholder="Bilanço, sektör, çarpan bilgileri..."
                        value={formData.fundamentalReview}
                        onChange={(e) => setFormData({ ...formData, fundamentalReview: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="targetPrice">Hedef Fiyat</Label>
                    <Input
                        id="targetPrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.targetPrice}
                        onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                        id="stopLoss"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.stopLoss}
                        onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="chartUrl">Grafik Görsel URL (Opsiyonel)</Label>
                    <Input
                        id="chartUrl"
                        placeholder="https://..."
                        value={formData.chartUrl}
                        onChange={(e) => setFormData({ ...formData, chartUrl: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950">
                <Switch
                    id="published"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="published">Yayında (Kullanıcılar görebilir)</Label>
            </div>

            <div className="flex items-center justify-end gap-x-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/editor-choices")}
                    disabled={loading}
                >
                    <X className="w-4 h-4 mr-2" />
                    İptal
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {initialData ? "Güncelle" : "Kaydet"}
                </Button>
            </div>
        </form>
    );
}
