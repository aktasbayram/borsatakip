"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, ExternalLink, FileText, LayoutList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useSnackbar } from "notistack";

export default function PostsAdminPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchPosts = async () => {
        try {
            const response = await axios.get("/api/admin/posts");
            setPosts(response.data.data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            enqueueSnackbar("Yazılar yüklenirken hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;

        try {
            await axios.delete(`/api/admin/posts/${id}`);
            enqueueSnackbar("Yazı başarıyla silindi", { variant: "success" });
            setPosts(posts.filter((post) => post.id !== id));
        } catch (error) {
            enqueueSnackbar("Yazı silinirken hata oluştu", { variant: "error" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Yazılar & Blog</h1>
                    <p className="text-muted-foreground">
                        Sitedeki haberleri, analizleri ve makaleleri buradan yönetin.
                    </p>
                </div>
                <Link href="/admin/posts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Yazı Ekle
                    </Button>
                </Link>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    Yükleniyor...
                                </TableCell>
                            </TableRow>
                        ) : posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <LayoutList className="w-10 h-10 opacity-20" />
                                        <p>Henüz hiç yazı oluşturulmamış.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{post.title}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">/{post.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{post.category || "Genel"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                                            {post.isPublished ? "Yayında" : "Taslak"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs font-medium">
                                        {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                            <Button variant="ghost" size="icon" title="Görüntüle">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/posts/${post.id}`}>
                                            <Button variant="ghost" size="icon" title="Düzenle">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Sil"
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Plus className="w-4 h-4 rotate-45" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
