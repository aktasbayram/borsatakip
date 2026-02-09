"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft, FileText, ImageIcon, LayoutList } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "@/components/ui/rich-text-editor";

interface PostEditorProps {
    initialData?: any;
}

export default function PostEditor({ initialData }: PostEditorProps) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        content: initialData?.content || "",
        excerpt: initialData?.excerpt || "",
        imageUrl: initialData?.imageUrl || "",
        category: initialData?.category || "Genel",
        isPublished: initialData?.isPublished ?? true,
    });

    const isEdit = !!initialData?.id;

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEdit && formData.title) {
            const generatedSlug = formData.title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");
            setFormData((prev) => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.title, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await axios.put(`/api/admin/posts/${initialData.id}`, formData);
                enqueueSnackbar("Yazı güncellendi", { variant: "success" });
            } else {
                await axios.post("/api/admin/posts", formData);
                enqueueSnackbar("Yazı oluşturuldu", { variant: "success" });
            }
            router.push("/admin/posts");
            router.refresh();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Bir hata oluştu";
            enqueueSnackbar(typeof errorMsg === "string" ? errorMsg : "Giriş verilerini kontrol edin", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/posts">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEdit ? "Yazıyı Düzenle" : "Yeni Yazı Ekle"}
                    </h1>
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Güncelle" : "Yayınla"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Editor Area */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                İçerik Editörü
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Yazı Başlığı</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Yazı başlığını buraya girin..."
                                    className="h-12 text-lg font-bold bg-accent/30 border-none rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>URL (Slug)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">/blog/</span>
                                    <Input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="pl-14 bg-accent/30 border-none rounded-xl font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Makale İçeriği</Label>
                                <div className="min-h-[500px]">
                                    <RichTextEditor
                                        content={formData.content}
                                        onChange={(html: string) => setFormData({ ...formData, content: html })}
                                        placeholder="Makalenizi yazmaya başlayın..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Options */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-primary to-indigo-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutList className="w-5 h-5 text-indigo-500" />
                                Yazı Ayarları
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Öne Çıkan Görsel URL
                                </Label>
                                <Input
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="bg-accent/30 border-none rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="bg-accent/30 border-none rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Kısa Özet (Excerpt)</Label>
                                <Textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Yazının kısa bir özetini buraya yazın..."
                                    className="bg-accent/30 border-none rounded-xl h-24"
                                />
                            </div>

                            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Yayınlama Durumu</Label>
                                    <p className="text-[10px] text-muted-foreground">Makaleyi hemen yayına al veya taslak olarak sakla.</p>
                                </div>
                                <Switch
                                    checked={formData.isPublished}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Help */}
                    <Card className="border-none shadow-xl bg-indigo-500/5 backdrop-blur-xl border border-indigo-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-500">İpucu</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground leading-relaxed">
                            Markdown kullanarak yazılarınızı zenginleştirebilirsiniz. **Kalın**, *İtalik*, [Link](url) gibi yapılar desteklenmektedir.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
