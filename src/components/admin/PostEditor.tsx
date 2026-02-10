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
import { CategoryManager } from "@/components/admin/CategoryManager";
import { SeoManager } from "@/components/admin/SeoManager";
import { slugify } from "@/lib/slugify";
import { useAutosave } from "@/hooks/useAutosave";
import { Cloud, CloudUpload, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
        category: initialData?.category || "Genel", // Keep for compatibility
        categoryId: initialData?.categoryId || initialData?.catRel?.id || "",
        isPublished: initialData?.isPublished ?? true,
        isFeatured: initialData?.isFeatured ?? false,
        featuredOrder: initialData?.featuredOrder ?? 0,
        // SEO Fields
        seoTitle: initialData?.seoTitle || "",
        seoDescription: initialData?.seoDescription || "",
        keywords: initialData?.keywords || "",
        focusKeyword: initialData?.focusKeyword || "",
        canonicalUrl: initialData?.canonicalUrl || "",
        // OG Fields
        ogTitle: initialData?.ogTitle || "",
        ogDescription: initialData?.ogDescription || "",
        ogImage: initialData?.ogImage || "",
    });

    const isEdit = !!initialData?.id;



    // Check for AI generated content
    useEffect(() => {
        const aiPostStr = sessionStorage.getItem('ai_generated_post');
        if (!isEdit && aiPostStr) {
            try {
                const aiPost = JSON.parse(aiPostStr);
                setFormData((prev) => ({
                    ...prev,
                    ...aiPost,
                    slug: slugify(aiPost.title) // Ensure slug is generated
                }));
                enqueueSnackbar("Yapay zeka taslağı yüklendi! 🤖✨", { variant: "info" });
                // Clear it so it doesn't persist on refresh/back
                sessionStorage.removeItem('ai_generated_post');
            } catch (e) {
                console.error("Failed to parse AI post", e);
            }
        }
    }, [isEdit]);

    // Auto-save logic
    const { trigger: triggerAutosave, isAutosaving, lastSavedAt } = useAutosave(async () => {
        // Only autosave if we have the minimum requirements (title, slug, content) 
        // especially for new posts to pass Zod validation on the server
        if (!formData.title || !formData.slug || !formData.content) return;

        try {
            if (isEdit) {
                await axios.put(`/api/admin/posts/${initialData.id}`, { ...formData, autoSave: true });
            } else {
                // For new posts, create a draft and redirect to the edit page
                const res = await axios.post("/api/admin/posts", {
                    ...formData,
                    isPublished: false
                });

                if (res.data?.data?.id) {
                    router.replace(`/admin/posts/${res.data.data.id}`);
                }
            }
        } catch (error) {
            console.error("Autosave Error:", error);
        }
    });

    // Watch for changes to trigger autosave
    useEffect(() => {
        triggerAutosave();
    }, [formData.title, formData.content, formData.excerpt, formData.seoTitle, formData.seoDescription]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEdit && formData.title && !sessionStorage.getItem('ai_generated_post')) { // Don't overwrite if just loaded from AI
            const generatedSlug = slugify(formData.title);
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
                <div className="flex items-center gap-6">
                    {/* Autosave Status */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 px-3 py-1.5 rounded-full border border-border/50">
                        {isAutosaving ? (
                            <>
                                <CloudUpload className="w-3.5 h-3.5 animate-bounce text-indigo-500" />
                                <span>Kaydediliyor...</span>
                            </>
                        ) : lastSavedAt ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-green-500" />
                                <span>Otomatik kaydedildi: {format(lastSavedAt, 'HH:mm:ss', { locale: tr })}</span>
                            </>
                        ) : (
                            <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Değişiklik bekleniyor</span>
                            </>
                        )}
                    </div>

                    <Button onClick={handleSubmit} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
                        <Save className="mr-2 h-4 w-4" />
                        {isEdit ? "Güncelle" : "Yayınla"}
                    </Button>
                </div>
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

                    {/* SEO Manager Component */}
                    <SeoManager formData={formData} setFormData={setFormData} />
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
                                <CategoryManager
                                    selectedCategoryId={formData.categoryId}
                                    onSelect={(id) => setFormData({ ...formData, categoryId: id })}
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

                            <div className="pt-4 border-t border-border/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Yayınlama Durumu</Label>
                                        <p className="text-[10px] text-muted-foreground">Makaleyi hemen yayına al veya taslak olarak sakla.</p>
                                    </div>
                                    <Switch
                                        checked={formData.isPublished}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Öne Çıkar</Label>
                                        <p className="text-[10px] text-muted-foreground">Ana sayfada vitrin alanında göster.</p>
                                    </div>
                                    <Switch
                                        checked={formData.isFeatured}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                                    />
                                </div>

                                {formData.isFeatured && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <Label className="text-xs font-bold">Öne Çıkma Sırası (Büyükten Küçüğe)</Label>
                                        <Input
                                            type="number"
                                            value={formData.featuredOrder}
                                            onChange={(e) => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 0 })}
                                            className="bg-accent/30 border-none rounded-xl"
                                            placeholder="Örn: 10"
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">En yüksek sayıya sahip olan yazı en büyük alanda görünür.</p>
                                    </div>
                                )}
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
