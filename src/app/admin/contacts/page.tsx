'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSnackbar } from "notistack";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string; // UNREAD, READ_REPLIED
    createdAt: string;
}

export default function AdminContactsPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const fetchMessages = async () => {
        try {
            const res = await axios.get("/api/admin/contacts");
            setMessages(res.data);
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Mesajlar yüklenemedi", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bu mesajı silmek istiyor musunuz?")) return;

        try {
            await axios.delete(`/api/admin/contacts/${id}`);
            setMessages(messages.filter(m => m.id !== id));
            enqueueSnackbar("Mesaj silindi", { variant: "success" });
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (error) {
            enqueueSnackbar("Silme başarısız", { variant: "error" });
        }
    };

    const handleView = async (msg: Message) => {
        setSelectedMessage(msg);
        // Mark as READ if unread
        if (msg.status === "UNREAD") {
            try {
                await axios.patch(`/api/admin/contacts/${msg.id}`, { status: "READ" });
                setMessages(messages.map(m => m.id === msg.id ? { ...m, status: "READ" } : m));
            } catch (error) {
                console.error("Status update failed");
            }
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                Gelen Mesajlar
            </h1>

            <Card className="p-0 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Durum</TableHead>
                            <TableHead>Kimden</TableHead>
                            <TableHead>Konu</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Yükleniyor...</TableCell>
                            </TableRow>
                        ) : messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                                    Henüz mesaj yok.
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
                                <TableRow
                                    key={msg.id}
                                    className={`cursor-pointer ${msg.status === 'UNREAD' ? 'bg-blue-50/50 dark:bg-blue-900/10 font-medium' : ''}`}
                                    onClick={() => handleView(msg)}
                                >
                                    <TableCell>
                                        {msg.status === 'UNREAD' ? (
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" title="Okunmadı" />
                                        ) : (
                                            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 block" title="Okundu" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div>{msg.name}</div>
                                        <div className="text-xs text-gray-500">{msg.email}</div>
                                    </TableCell>
                                    <TableCell>{msg.subject}</TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {new Date(msg.createdAt).toLocaleDateString("tr-TR")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            onClick={(e) => handleDelete(msg.id, e)}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                        <DialogDescription>
                            {selectedMessage?.name} ({selectedMessage?.email})
                            <span className="block text-xs mt-1">
                                {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg my-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                        {selectedMessage?.message}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => window.open(`mailto:${selectedMessage?.email}`)}>
                            Yanıtla (Email)
                        </Button>
                        <Button onClick={() => setSelectedMessage(null)}>
                            Kapat
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
