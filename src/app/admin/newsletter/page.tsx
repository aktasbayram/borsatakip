"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Trash2,
    UserCheck,
    UserMinus,
    Copy,
    Check,
    Mail,
    Download,
    Search
} from "lucide-react";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function NewsletterAdminPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [copied, setCopied] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/newsletter");
            setSubscribers(res.data.data || []);
        } catch (error) {
            enqueueSnackbar("Aboneler yüklenirken hata oluştu.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await axios.put("/api/admin/newsletter", { id, isActive: !currentStatus });
            enqueueSnackbar("Durum güncellendi.", { variant: "success" });
            fetchSubscribers();
        } catch (error) {
            enqueueSnackbar("Güncelleme başarısız.", { variant: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu aboneyi silmek istediğinize emin misiniz?")) return;
        try {
            await axios.delete(`/api/admin/newsletter?id=${id}`);
            enqueueSnackbar("Abone silindi.", { variant: "success" });
            fetchSubscribers();
        } catch (error) {
            enqueueSnackbar("Silme işlemi başarısız.", { variant: "error" });
        }
    };

    const copyAllEmails = () => {
        const emails = filteredSubscribers.map(s => s.email).join(", ");
        navigator.clipboard.writeText(emails);
        setCopied(true);
        enqueueSnackbar("Tüm e-postalar kopyalandı!", { variant: "info" });
        setTimeout(() => setCopied(false), 2000);
    };

    const exportToCSV = () => {
        const headers = ["ID", "Email", "Durum", "Katılım Tarihi"];
        const rows = filteredSubscribers.map(s => [
            s.id,
            s.email,
            s.isActive ? "Aktif" : "Pasif",
            format(new Date(s.createdAt), "dd.MM.yyyy HH:mm")
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bulten-aboneleri-${format(new Date(), "dd-MM-yyyy")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bülten Aboneleri</h1>
                    <p className="text-muted-foreground">Bülteninize kayıt olan kullanıcıları yönetin.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAllEmails}
                        className="gap-2"
                        disabled={filteredSubscribers.length === 0}
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        E-postaları Kopyala
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="gap-2"
                        disabled={filteredSubscribers.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        CSV İndir
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-border/10">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="E-posta ile ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-accent/20 border-border/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-[300px]">E-posta</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Kayıt Tarihi</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Yükleniyor...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredSubscribers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-medium">
                                            Abone bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubscribers.map((subscriber) => (
                                        <TableRow key={subscriber.id} className="hover:bg-accent/5 transition-colors">
                                            <TableCell className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {subscriber.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {subscriber.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                        Pasif
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(subscriber.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary"
                                                        onClick={() => handleToggleStatus(subscriber.id, subscriber.isActive)}
                                                        title={subscriber.isActive ? "Pasif Yap" : "Aktif Yap"}
                                                    >
                                                        {subscriber.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => handleDelete(subscriber.id)}
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
