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
        leadUnderwriter: initialData?.leadUnderwriter || "",
        firstTradingDate: initialData?.firstTradingDate || "",
        // url: initialData?.url || "", // Removed per user request
        imageUrl: initialData?.imageUrl || "",
        showOnHomepage: initialData?.showOnHomepage || false,
    });

    // Detailed text fields (will be packed into summaryInfo JSON)
    const [details, setDetails] = useState({
        fundsUse: initialData?.summaryInfo?.find((x: any) => x.title.includes("Fon") || x.title.includes("Kullanım Yeri"))?.items?.join("\n") || "",
        allocation: initialData?.summaryInfo?.find((x: any) => x.title.includes("Tahsisat"))?.items?.join("\n") || "",
        pledges: initialData?.summaryInfo?.find((x: any) => x.title.includes("Satmama"))?.items?.join("\n") || "",
        // New Fields
        ipoShape: initialData?.summaryInfo?.find((x: any) => x.title.includes("Şekli"))?.items?.join("\n") || "",
        saleMethod: initialData?.summaryInfo?.find((x: any) => x.title.includes("Satış Yöntemi"))?.items?.join("\n") || "", // Distinct from 'Dağıtım' if needed
        possibleLots: initialData?.summaryInfo?.find((x: any) => x.title.includes("Dağıtılacak Pay") || x.title.includes("Olası"))?.items?.join("\n") || "",
        financials: initialData?.summaryInfo?.find((x: any) => x.title.includes("Finansal"))?.items?.join("\n") || "",
        priceStability: initialData?.summaryInfo?.find((x: any) => x.title.includes("Fiyat İstikrarı"))?.items?.join("\n") || "",
        publicRatio: initialData?.summaryInfo?.find((x: any) => x.title.includes("Halka Açıklık"))?.items?.join("\n") || "",
        discount: initialData?.summaryInfo?.find((x: any) => x.title.includes("İskonto"))?.items?.join("\n") || "",
    });

    const handleDetailChange = (field: string, value: string) => {
        setDetails((prev) => ({ ...prev, [field]: value }));
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Construct summaryInfo JSON from text fields
        const summaryInfo = [];
        if (details.fundsUse) summaryInfo.push({ title: "Fonun Kullanım Yeri", items: details.fundsUse.split("\n").filter(Boolean) });
        if (details.allocation) summaryInfo.push({ title: "Tahsisat Grupları", items: details.allocation.split("\n").filter(Boolean) });
        if (details.pledges) summaryInfo.push({ title: "Satmama Taahhüdü", items: details.pledges.split("\n").filter(Boolean) });

        // New Fields Packaging
        if (details.ipoShape) summaryInfo.push({ title: "Halka Arz Şekli", items: details.ipoShape.split("\n").filter(Boolean) });
        if (details.saleMethod) summaryInfo.push({ title: "Halka Arz Satış Yöntemi", items: details.saleMethod.split("\n").filter(Boolean) });
        if (details.financials) summaryInfo.push({ title: "Finansal Tablo", items: details.financials.split("\n").filter(Boolean) });
        if (details.priceStability) summaryInfo.push({ title: "Fiyat İstikrarı", items: details.priceStability.split("\n").filter(Boolean) });
        if (details.possibleLots) summaryInfo.push({ title: "Dağıtılacak Pay Miktarı (Olası)", items: details.possibleLots.split("\n").filter(Boolean) });
        if (details.publicRatio) summaryInfo.push({ title: "Halka Açıklık", items: details.publicRatio.split("\n").filter(Boolean) });
        if (details.discount) summaryInfo.push({ title: "Halka Arz İskontosu", items: details.discount.split("\n").filter(Boolean) });

        const payload = { ...formData, summaryInfo };

        try {
            if (initialData) {
                await axios.put(`/api/admin/ipos/${initialData.id}`, payload);
            } else {
                await axios.post("/api/admin/ipos", payload);
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

                        <div className="flex items-center gap-4 border p-3 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Anasayfa Widget'ı</Label>
                                <p className="text-xs text-muted-foreground">İşaretlendiyse anasayfada gösterilir</p>
                            </div>
                            <Switch
                                checked={formData.showOnHomepage}
                                onCheckedChange={(val) => handleChange("showOnHomepage", val)}
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
                        <div className="space-y-2">
                            <Label>Aracı Kurum</Label>
                            <Input value={formData.leadUnderwriter} onChange={(e) => handleChange("leadUnderwriter", e.target.value)} placeholder="Gedik Yatırım" />
                        </div>
                        <div className="space-y-2">
                            <Label>Bist İlk İşlem Tarihi</Label>
                            <Input value={formData.firstTradingDate} onChange={(e) => handleChange("firstTradingDate", e.target.value)} placeholder="3 Şubat 2026" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Ek Detaylar (İsteğe Bağlı)</h3>
                    <p className="text-sm text-muted-foreground">Her satır bir madde olarak görünecektir.</p>

                    <div className="space-y-2">
                        <Label>Halka Arz Şekli</Label>
                        <textarea
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={details.ipoShape}
                            onChange={(e) => handleDetailChange("ipoShape", e.target.value)}
                            placeholder="Sermaye Artırımı: ...&#10;Ortak Satışı: ..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Satış Yöntemi (Opsiyonel)</Label>
                            <Input
                                value={details.saleMethod}
                                onChange={(e) => handleDetailChange("saleMethod", e.target.value)}
                                placeholder="Borsa'da Satış - Sabit Fiyat..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fiyat İstikrarı</Label>
                            <Input
                                value={details.priceStability}
                                onChange={(e) => handleDetailChange("priceStability", e.target.value)}
                                placeholder="30 gün süreyle planlanmaktadır..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Fonun Kullanım Yeri</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={details.fundsUse}
                            onChange={(e) => handleDetailChange("fundsUse", e.target.value)}
                            placeholder="%60 İşletme Sermayesi&#10;%40 Yatırım"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Dağıtılacak Pay Miktarı (Olası)</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={details.possibleLots}
                            onChange={(e) => handleDetailChange("possibleLots", e.target.value)}
                            placeholder="2.1 Milyon Katılım ~ 24 Lot&#10;2.5 Milyon Katılım ~ 20 Lot"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tahsisat Grupları</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={details.allocation}
                            onChange={(e) => handleDetailChange("allocation", e.target.value)}
                            placeholder="%70 Yurt İçi Bireysel&#10;%30 Yurt İçi Kurumsal"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Satmama Taahhüdü</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={details.pledges}
                            onChange={(e) => handleDetailChange("pledges", e.target.value)}
                            placeholder="1 Yıl İhraççı&#10;1 Yıl Ortaklar"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Finansal Tablo (Her satır bir veri)</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            value={details.financials}
                            onChange={(e) => handleDetailChange("financials", e.target.value)}
                            placeholder="2024/9 Hasılat: 5.4 Milyar TL&#10;2023 Hasılat: 4.2 Milyar TL"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Halka Açıklık</Label>
                            <Input
                                value={details.publicRatio}
                                onChange={(e) => handleDetailChange("publicRatio", e.target.value)}
                                placeholder="%20.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Halka Arz İskontosu</Label>
                            <Input
                                value={details.discount}
                                onChange={(e) => handleDetailChange("discount", e.target.value)}
                                placeholder="%25"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Logo URL</Label>
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
