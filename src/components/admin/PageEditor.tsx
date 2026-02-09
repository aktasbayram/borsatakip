"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Loader2 } from "lucide-react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import axios from "axios";

interface PageEditorProps {
    initialData?: {
        id: string;
        title: string;
        slug: string;
        content: string;
        isActive: boolean;
    };
    pageId?: string;
}

export function PageEditor({ initialData, pageId }: PageEditorProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [loading, setLoading] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        // Auto-generate slug if creating new
        if (!initialData && !slug) {
            setSlug(val.toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (pageId) {
                await axios.put(`/api/admin/pages/${pageId}`, {
                    title,
                    slug,
                    content,
                    isActive
                });
                enqueueSnackbar("Sayfa güncellendi.", { variant: "success" });
            } else {
                await axios.post("/api/admin/pages", {
                    title,
                    slug,
                    content,
                    isActive
                });
                enqueueSnackbar("Sayfa oluşturuldu.", { variant: "success" });
                router.push("/admin/pages");
            }
            router.refresh();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || "Bir hata oluştu.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="active-mode" className="text-sm font-medium">
                        {isActive ? "Yayında" : "Taslak"}
                    </Label>
                    <Switch
                        id="active-mode"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Sayfa Başlığı</Label>
                        <Input
                            value={title}
                            onChange={handleTitleChange}
                            required
                            placeholder="Örn: Gizlilik Politikası"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>URL (Slug)</Label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            placeholder="orn-gizlilik-politikasi"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>İçerik</Label>
                    <div className="min-h-[500px]">
                        <RichTextEditor
                            content={content}
                            onChange={(html: string) => setContent(html)}
                            placeholder="# Başlık\n\n**Kalın Yazı**\n\n- Liste öğesi"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {pageId ? "Güncelle" : "Oluştur"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
