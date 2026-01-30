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
import { Pencil, Lock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteIpoButton } from "./delete-ipo-button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface IpoTableClientProps {
    initialIpos: any[];
}

export function IpoTableClient({ initialIpos }: IpoTableClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredIpos = useMemo(() => {
        const filtered = initialIpos.filter((ipo) => {
            const matchesSearch =
                ipo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ipo.company.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            const dateText = ipo.date || '-';
            const isDraftDate = /haz[ıi]rla|taslak|bekle/i.test(dateText);
            const isActuallyDraft = ipo.status === 'DRAFT' || (isDraftDate && !ipo.isLocked);

            if (activeTab === "draft") {
                return isActuallyDraft;
            }
            if (activeTab === "approved") {
                return !isActuallyDraft;
            }

            return true;
        });

        // Smart sort: 'New' tag first, then by Year, then by ID/Creation
        return filtered.sort((a, b) => {
            // Priority to 'YENİ' tagged items
            if (a.isNew && !b.isNew) return -1;
            if (!a.isNew && b.isNew) return 1;

            const getYear = (d: string) => {
                const match = String(d).match(/20\d{2}/);
                return match ? parseInt(match[0]) : 0;
            };
            const yearA = getYear(a.date || '');
            const yearB = getYear(b.date || '');

            if (yearA !== yearB) return yearB - yearA;

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [initialIpos, searchQuery, activeTab]);

    // Pagination logic
    const totalPages = Math.ceil(filteredIpos.length / itemsPerPage);
    const paginatedIpos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredIpos.slice(start, start + itemsPerPage);
    }, [filteredIpos, currentPage]);

    // Reset pagination when search or tab changes
    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={handleTabChange}>
                    <TabsList>
                        <TabsTrigger value="all">Tümü ({initialIpos.length})</TabsTrigger>
                        <TabsTrigger value="approved">Onaylı/Aktif ({initialIpos.filter(x => {
                            const dateText = x.date || '-';
                            const isDraftDate = /haz[ıi]rla|taslak|bekle/i.test(dateText);
                            return !(x.status === 'DRAFT' || (isDraftDate && !x.isLocked));
                        }).length})</TabsTrigger>
                        <TabsTrigger value="draft">Taslaklar ({initialIpos.filter(x => {
                            const dateText = x.date || '-';
                            const isDraftDate = /haz[ıi]rla|taslak|bekle/i.test(dateText);
                            return x.status === 'DRAFT' || (isDraftDate && !x.isLocked);
                        }).length})</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Kod veya şirket ara..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kod</TableHead>
                            <TableHead>Şirket</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Tarih</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedIpos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    {searchQuery ? "Arama sonucu bulunamadı." : "Henüz manuel eklenmiş halka arz yok."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedIpos.map((ipo: any) => (
                                <TableRow key={ipo.id}>
                                    <TableCell className="font-medium">{ipo.code}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {ipo.company}
                                            {ipo.isLocked && <Lock className="w-3 h-3 text-blue-500" />}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {(() => {
                                                const dateText = ipo.date || '-';
                                                const isDraftDate = /haz[ıi]rla|taslak|bekle/i.test(dateText);
                                                const isActuallyDraft = ipo.status === 'DRAFT' || (isDraftDate && !ipo.isLocked);

                                                let statusText = ipo.status;
                                                if (isActuallyDraft) statusText = 'TASLAK';
                                                else if (ipo.status === 'NEW') statusText = 'YENİ';
                                                else if (ipo.status === 'ACTIVE') statusText = 'AKTİF';

                                                return (
                                                    <Badge variant={isActuallyDraft ? 'secondary' : 'default'}>
                                                        {statusText}
                                                    </Badge>
                                                );
                                            })()}
                                            {ipo.isNew && <Badge variant="outline" className="border-green-500 text-green-500">YENİ ETİKETİ</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{ipo.date || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/ipos/${ipo.id}`}>
                                                <Button size="icon" variant="ghost" title="Düzenle">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <DeleteIpoButton id={ipo.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Toplam <strong>{filteredIpos.length}</strong> kayıttan <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredIpos.length)}</strong> arası gösteriliyor.
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
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "primary" : "outline"}
                                    size="sm"
                                    className="w-8"
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
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
