"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Search, Smartphone, Globe, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface SeoManagerProps {
    formData: any;
    setFormData: (data: any) => void;
}

export function SeoManager({ formData, setFormData }: SeoManagerProps) {
    const [analysis, setAnalysis] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    // Analyze content whenever relevant fields change
    useEffect(() => {
        analyzeContent();
    }, [formData.seoTitle, formData.seoDescription, formData.focusKeyword, formData.title, formData.content]);

    // Fetch suggestions when focus keyword changes (debounce could be added)
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!formData.focusKeyword || formData.focusKeyword.length < 3) {
                setSuggestions([]);
                return;
            }

            try {
                const res = await fetch(`/api/admin/keywords?q=${encodeURIComponent(formData.focusKeyword)}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter out keywords already in the list
                    const currentKeywords = formData.keywords ? formData.keywords.split(",").map((k: string) => k.trim()) : [];
                    const filtered = data.suggestions.filter((s: string) => !currentKeywords.includes(s));
                    setSuggestions(filtered.slice(0, 8)); // Top 8 suggestions
                }
            } catch (error) {
                console.error("Suggestion fetch error", error);
            }
        };

        const timer = setTimeout(fetchSuggestions, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [formData.focusKeyword, formData.keywords]);

    const analyzeContent = () => {
        if (!formData.focusKeyword) {
            setAnalysis([]);
            setScore(0);
            return;
        }

        const keyword = formData.focusKeyword.toLowerCase();
        const title = (formData.seoTitle || formData.title || "").toLowerCase();
        const description = (formData.seoDescription || "").toLowerCase();
        const content = (formData.content || "").toLowerCase();

        // Remove HTML tags and entities for content analysis
        const plainContent = content
            .replace(/<[^>]*>/g, " ") // Replace tags with space to avoid merging words
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const wordCount = plainContent ? plainContent.split(" ").length : 0;

        const checks = [
            {
                id: "keyword-in-title",
                label: "Anahtar kelime başlıkta geçiyor",
                passed: title.includes(keyword),
                score: 20
            },
            {
                id: "keyword-in-desc",
                label: "Anahtar kelime meta açıklamasında geçiyor",
                passed: description.includes(keyword),
                score: 20
            },
            {
                id: "keyword-in-content",
                label: "Anahtar kelime içerikte geçiyor",
                passed: plainContent.toLowerCase().includes(keyword),
                score: 20
            },
            {
                id: "title-length",
                label: "SEO Başlığı uygun uzunlukta (30-60 karakter)",
                passed: title.length >= 30 && title.length <= 60,
                score: 10
            },
            {
                id: "desc-length",
                label: "Meta Açıklaması uygun uzunlukta (120-160 karakter)",
                passed: description.length >= 120 && description.length <= 160,
                score: 10
            },
            {
                id: "keyword-start-title",
                label: "Anahtar kelime başlığın başında",
                passed: title.startsWith(keyword),
                score: 10
            },
            {
                id: "content-length",
                label: `İçerik uzunluğu yeterli (Şu an: ${wordCount} kelime, Hedef: 300)`,
                passed: wordCount >= 300,
                score: 10
            }
        ];

        const totalScore = checks.reduce((acc, check) => acc + (check.passed ? check.score : 0), 0);
        setAnalysis(checks);
        setScore(totalScore);
    };

    return (
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    SEO & Analiz
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="general">Genel Ayarlar</TabsTrigger>
                        <TabsTrigger value="social">Sosyal Medya</TabsTrigger>
                        <TabsTrigger value="analysis">Analiz & Skor</TabsTrigger>
                    </TabsList>

                    {/* General SEO Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                <Globe className="w-4 h-4" /> Google Önizleme Simülasyonu
                            </h3>
                            <div className="bg-card p-4 rounded-lg border shadow-sm max-w-2xl">
                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">B</span>
                                    borsatakip.com › blog › {formData.slug || "yazi-url"}
                                </div>
                                <div className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] font-medium hover:underline cursor-pointer truncate">
                                    {formData.seoTitle || formData.title || "Yazı Başlığı"}
                                </div>
                                <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                                    {formData.seoDescription || formData.excerpt || "Meta açıklaması buraya gelecek..."}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Odak Anahtar Kelime</Label>
                            <Input
                                placeholder="Örn: borsa analizi"
                                value={formData.focusKeyword || ""}
                                onChange={(e) => handleChange("focusKeyword", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">İçeriğinizi bu kelimeye göre optimize edeceğiz.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>SEO Başlığı (Meta Title)</Label>
                                    <span className={`text-xs ${(formData.seoTitle?.length || 0) > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {formData.seoTitle?.length || 0}/60
                                    </span>
                                </div>
                                <Input
                                    placeholder={formData.title}
                                    value={formData.seoTitle || ""}
                                    onChange={(e) => handleChange("seoTitle", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Canonical URL (Opsiyonel)</Label>
                                <Input
                                    placeholder="https://..."
                                    value={formData.canonicalUrl || ""}
                                    onChange={(e) => handleChange("canonicalUrl", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Meta Açıklaması (Description)</Label>
                                <span className={`text-xs ${(formData.seoDescription?.length || 0) > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {formData.seoDescription?.length || 0}/160
                                </span>
                            </div>
                            <Textarea
                                placeholder="Arama sonuçlarında görünecek kısa açıklama..."
                                className="h-24 resize-none"
                                value={formData.seoDescription || ""}
                                onChange={(e) => handleChange("seoDescription", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Anahtar Kelimeler (Keywords)</Label>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-primary">
                                {(formData.keywords ? formData.keywords.split(",").filter((k: string) => k.trim() !== "") : []).map((keyword: string, index: number) => (
                                    <span key={index} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                        {keyword.trim()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentKeywords = formData.keywords.split(",").filter((k: string) => k.trim() !== "");
                                                const newKeywords = currentKeywords.filter((_: string, i: number) => i !== index).join(",");
                                                handleChange("keywords", newKeywords);
                                            }}
                                            className="hover:text-red-500"
                                        >
                                            <span className="sr-only">Sil</span>
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px]"
                                    placeholder="Kelime yazıp Enter veya Virgül'e basın"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === ",") {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                const currentKeywords = formData.keywords ? formData.keywords.split(",").filter((k: string) => k.trim() !== "") : [];
                                                if (!currentKeywords.includes(val)) {
                                                    const newKeywords = [...currentKeywords, val].join(",");
                                                    handleChange("keywords", newKeywords);
                                                }
                                                e.currentTarget.value = "";
                                            }
                                        } else if (e.key === "Backspace" && e.currentTarget.value === "") {
                                            const currentKeywords = formData.keywords ? formData.keywords.split(",").filter((k: string) => k.trim() !== "") : [];
                                            if (currentKeywords.length > 0) {
                                                const newKeywords = currentKeywords.slice(0, -1).join(",");
                                                handleChange("keywords", newKeywords);
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {suggestions.length > 0 && (
                                    <div className="w-full text-xs font-semibold text-muted-foreground mt-1">
                                        Google Önerileri (Eklemek için tıklayın):
                                    </div>
                                )}
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            const currentKeywords = formData.keywords ? formData.keywords.split(",").filter((k: string) => k.trim() !== "") : [];
                                            if (!currentKeywords.includes(s)) {
                                                const newKeywords = [...currentKeywords, s].join(",");
                                                handleChange("keywords", newKeywords);
                                                // Remove added suggestion from list (optional UX choice)
                                                setSuggestions(prev => prev.filter(item => item !== s));
                                            }
                                        }}
                                        className="text-xs bg-muted hover:bg-muted/80 border border-border rounded-full px-3 py-1 transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Kelimeleri virgül veya Enter ile ayırabilirsiniz.</p>
                        </div>
                    </TabsContent>

                    {/* Social Media Settings */}
                    <TabsContent value="social" className="space-y-6">
                        <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                <Smartphone className="w-4 h-4" /> Sosyal Medya Önizleme
                            </h3>
                            <div className="bg-card rounded-lg border shadow-sm max-w-sm overflow-hidden mx-auto md:mx-0">
                                <div className="aspect-[1.91/1] bg-muted relative">
                                    {(formData.ogImage || formData.imageUrl) ? (
                                        <img src={formData.ogImage || formData.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Görsel Yok</div>
                                    )}
                                </div>
                                <div className="p-3 bg-[#f0f2f5] dark:bg-[#202020]">
                                    <div className="text-[10px] uppercase text-muted-foreground mb-0.5">BORSATAKIP.COM</div>
                                    <div className="font-bold text-sm leading-tight mb-1 text-black dark:text-white">
                                        {formData.ogTitle || formData.seoTitle || formData.title || "Başlık"}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                        {formData.ogDescription || formData.seoDescription || "Açıklama..."}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Sosyal Medya Başlığı (OG Title)</Label>
                                <Input
                                    placeholder={formData.seoTitle || formData.title}
                                    value={formData.ogTitle || ""}
                                    onChange={(e) => handleChange("ogTitle", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sosyal Medya Açıklaması (OG Description)</Label>
                                <Textarea
                                    placeholder={formData.seoDescription}
                                    value={formData.ogDescription || ""}
                                    onChange={(e) => handleChange("ogDescription", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sosyal Medya Görseli (OG Image URL)</Label>
                                <Input
                                    placeholder={formData.imageUrl}
                                    value={formData.ogImage || ""}
                                    onChange={(e) => handleChange("ogImage", e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Analysis & Score */}
                    <TabsContent value="analysis" className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                {/* Simple Circular Progress Placeholder */}
                                <div className={`w-full h-full rounded-full border-4 flex items-center justify-center text-2xl font-bold
                                    ${score >= 80 ? 'border-green-500 text-green-500' : score >= 50 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}
                                `}>
                                    {score}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">SEO Skoru</h3>
                                <p className="text-sm text-muted-foreground">
                                    {score >= 80 ? "Harika! İçerik yayına hazır." : score >= 50 ? "İyi, ama eksikler var." : "Geliştirilmesi gerekiyor."}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3 mt-4">
                            {analysis.map((check) => (
                                <div key={check.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    {check.passed ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <div className={`text-sm font-medium ${check.passed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {check.label}
                                        </div>
                                    </div>
                                    {check.passed && (
                                        <span className="text-xs font-bold text-green-500">+{check.score}</span>
                                    )}
                                </div>
                            ))}

                            {analysis.length === 0 && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Analiz Bekleniyor</AlertTitle>
                                    <AlertDescription>
                                        Analiz sonuçlarını görmek için lütfen bir "Odak Anahtar Kelime" girin.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
