"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pencil, Search, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteEditorChoiceButton } from "./delete-choice-button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface EditorChoiceTableClientProps {
    initialChoices: any[];
}

export function EditorChoiceTableClient({ initialChoices }: EditorChoiceTableClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredChoices = useMemo(() => {
        return initialChoices.filter((choice) => {
            return (
                choice.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                choice.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }).sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    }, [initialChoices, searchQuery]);

    const totalPages = Math.ceil(filteredChoices.length / itemsPerPage);
    const paginatedChoices = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredChoices.slice(start, start + itemsPerPage);
    }, [filteredChoices, currentPage]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Hisse veya başlık ara..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hisse</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Yayın Tarihi</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedChoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    {searchQuery ? "Arama sonucu bulunamadı." : "Henüz analiz eklenmemiş."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedChoices.map((choice: any) => (
                                <TableRow key={choice.id}>
                                    <TableCell>
                                        <Badge variant="outline" className="font-bold">
                                            {choice.symbol}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {choice.title}
                                    </TableCell>
                                    <TableCell>
                                        {choice.isPublished ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                <Eye className="w-3 h-3 mr-1" />
                                                Yayında
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <EyeOff className="w-3 h-3 mr-1" />
                                                Taslak
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {choice.publishedAt ? format(new Date(choice.publishedAt), 'dd MMM yyyy HH:mm', { locale: tr }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/editor-choices/${choice.id}`}>
                                                <Button size="icon" variant="ghost">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <DeleteEditorChoiceButton id={choice.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Toplam {filteredChoices.length} kayıttan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredChoices.length)} arası.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Önceki
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Sonraki
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
