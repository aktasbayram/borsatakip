
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Save, MessageSquare, TrendingUp, TrendingDown, Activity, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSnackbar } from "notistack";
import { Textarea } from "@/components/ui/textarea";

export default function AdminBultenPage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editorNote, setEditorNote] = useState("");
    const { enqueueSnackbar } = useSnackbar();

    const fetchSummary = async (force = false) => {
        setLoading(true);
        if (force) setRefreshing(true);
        try {
            const res = await axios.get(`/api/market/bulten${force ? '?force=true' : ''}`);
            setSummary(res.data);
            setEditorNote(res.data?.editorNote || "");
        } catch (error) {
            console.error("Failed to fetch summary:", error);
            enqueueSnackbar("Bülten verileri yüklenemedi.", { variant: "error" });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const handleSaveNote = async () => {
        if (!summary) return;
        setSaving(true);
        try {
            await axios.post("/api/admin/market/bulten/note", {
                date: summary.date,
                note: editorNote
            });
            enqueueSnackbar("Editör notu kaydedildi.", { variant: "success" });
        } catch (error) {
            enqueueSnackbar("Kaydedilemedi.", { variant: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading && !refreshing) {
        return <div className="p-8 text-center animate-pulse text-muted-foreground">Bülten verileri hazırlanıyor...</div>;
    }

    const data = summary?.data || {};

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Günün Bülteni Yönetimi</h1>
                    <p className="text-muted-foreground">Günlük piyasa özetini inceleyin ve editör notu ekleyin.</p>
                </div>
                <Button
                    onClick={() => fetchSummary(true)}
                    disabled={refreshing}
                    className="rounded-xl shadow-lg transition-all hover:scale-105"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Verileri Yenile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Note Section */}
                <Card className="lg:col-span-2 border-primary/20 bg-primary/5 shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-primary/10 border-b border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-xl">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Editörün Notu</CardTitle>
                                <CardDescription>Bültenin en başında görünecek piyasa yorumu.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Textarea
                            value={editorNote}
                            onChange={(e) => setEditorNote(e.target.value)}
                            placeholder="Bugün piyasada neler bekleniyor? Kısa bir özet yazın..."
                            className="min-h-[200px] bg-background/50 border-primary/10 rounded-2xl focus:ring-primary/20"
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleSaveNote} disabled={saving} className="rounded-xl px-8">
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? "Kaydediliyor..." : "Notu Kaydet"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats / Summary View */}
                <div className="space-y-6">
                    <Card className="rounded-[2rem] border-muted bg-muted/30 shadow-sm overflow-hidden">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Özet Veriler
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-2 space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm font-medium text-muted-foreground">Tarih</span>
                                <span className="text-sm font-bold">{summary?.date}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm font-medium text-muted-foreground">Hisse Sayısı (Mover)</span>
                                <span className="text-sm font-bold">{(data.movers?.gainers?.length || 0) + (data.movers?.losers?.length || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm font-medium text-muted-foreground">Etkinlik Sayısı</span>
                                <span className="text-sm font-bold">{data.events?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-medium text-muted-foreground">Aktif Halka Arz</span>
                                <span className="text-sm font-bold">{data.ipos?.length || 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-emerald-500/20 bg-emerald-500/5 shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                    <Activity className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Durum</p>
                                    <p className="text-lg font-black text-emerald-900 dark:text-emerald-400">YAYINDA</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Preview Section */}
            <div className="pt-4">
                <h2 className="text-xl font-bold mb-4">Veri Önizleme</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PreviewList title="En Çok Yükselenler" icon={<TrendingUp className="text-green-500" />} items={data.movers?.gainers} />
                    <PreviewList title="En Çok Düşenler" icon={<TrendingDown className="text-red-500" />} items={data.movers?.losers} />
                    <PreviewList title="Günün Ajandası" icon={<Calendar className="text-blue-500" />} items={data.events} isEvents />
                </div>
            </div>
        </div>
    );
}

function PreviewList({ title, icon, items, isEvents = false }: any) {
    return (
        <Card className="rounded-3xl border-border bg-card/50 shadow-sm overflow-hidden">
            <CardHeader className="p-4 border-b border-border/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
                {!items || items.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Veri bulunamadı.</p>
                ) : (
                    items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-border/30 last:border-0">
                            <span className="font-bold">{isEvents ? item.title : item.code}</span>
                            <span className={isEvents ? "text-muted-foreground" : item.change.includes("-") ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                                {isEvents ? item.time : item.change}
                            </span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
