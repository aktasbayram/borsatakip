"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Building2, Ticket, TrendingUp, Info, Search, ListFilter, Rocket, ChevronLeft, ChevronRight, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface IpoItem {
    code: string;
    company: string;
    date: string;
    price: string;
    lotCount: string;
    market: string;
    url: string;
    imageUrl: string;
    distributionMethod: string;
    isNew: boolean;
    statusText?: string;
    status?: 'New' | 'Active' | 'Draft';
}

export default function IpoPage() {
    const [ipos, setIpos] = useState<IpoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [approvedPage, setApprovedPage] = useState(1);
    const [draftPage, setDraftPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchIpos = async () => {
            try {
                const response = await fetch('/api/market/ipos');
                let data = await response.json();

                if (!Array.isArray(data)) {
                    console.error('API returned non-array data:', data);
                    data = [];
                }

                setIpos(data);
            } catch (error) {
                console.error('Failed to fetch IPOs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIpos();
    }, []);

    const filteredIpos = ipos.filter(ipo =>
        ipo.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ipo.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const approvedIpos = filteredIpos.filter(x => x.status === 'Active' || x.status === 'New');
    const draftIpos = filteredIpos.filter(x => x.status !== 'Active' && x.status !== 'New');

    const newIpos = approvedIpos.filter(x => x.isNew);

    const paginatedApproved = approvedIpos.slice((approvedPage - 1) * itemsPerPage, approvedPage * itemsPerPage);
    const paginatedDrafts = draftIpos.slice((draftPage - 1) * itemsPerPage, draftPage * itemsPerPage);

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setApprovedPage(1);
        setDraftPage(1);
    };

    if (loading) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse text-sm uppercase tracking-widest">Veriler Hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0">
            {/* Header Section - Refined Glassmorphism */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 lg:p-12 border border-slate-800 shadow-2xl group">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                            <Rocket className="w-3.5 h-3.5" />
                            Yatırım Fırsatları
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none text-white italic">
                            Halka Arz <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 pr-2">Takvimi</span>
                        </h1>
                        <p className="text-slate-400 text-sm lg:text-base font-medium leading-relaxed max-w-xl">
                            Borsa İstanbul'da gerçekleşecek en yeni halka arzları, talep toplama tarihlerini ve şirket analizlerini tek noktadan takip edin.
                        </p>
                    </div>

                    <div className="relative w-full lg:w-80 group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/search:text-primary transition-colors" />
                        <Input
                            placeholder="Şirket veya Kod ara..."
                            className="h-14 pl-12 bg-slate-900/50 border-slate-800 text-white rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 font-medium"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="approved" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <TabsList className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl h-14 w-full md:w-auto grid grid-cols-2 md:inline-flex shadow-inner">
                        <TabsTrigger value="approved" className="rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg h-11 px-8 text-xs font-black uppercase tracking-widest transition-all gap-3">
                            Onaylı Listesi
                            <Badge variant="secondary" className="bg-primary/10 text-primary group-data-[state=active]:bg-primary group-data-[state=active]:text-white border-0">{approvedIpos.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="drafts" className="rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg h-11 px-8 text-xs font-black uppercase tracking-widest transition-all gap-3">
                            Taslak Listesi
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-0">{draftIpos.length}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    {!searchTerm && (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                        </div>
                    )}
                </div>

                <TabsContent value="approved" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Featured Section - Modernized Grid */}
                    {!searchTerm && newIpos.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"></div>
                                    <h2 className="text-xl font-black text-white italic tracking-tight">Talep Toplayanlar</h2>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-tighter">
                                    <Zap className="w-3 h-3 fill-primary" />
                                    Yeni Başvurular
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {newIpos.map((ipo, index) => (
                                    <Link key={index} href={`/market/ipo/${ipo.code}`} className="group block">
                                        <Card className="relative h-full overflow-hidden border-slate-800 bg-slate-950/40 backdrop-blur-sm hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[2rem] p-6 lg:p-7 flex flex-col gap-6">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                                <Building2 className="w-16 h-16 text-primary" />
                                            </div>

                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                    {ipo.imageUrl ? (
                                                        <img src={ipo.imageUrl} alt={ipo.code} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-xs font-black text-slate-950">{ipo.code}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-widest px-2.5 h-6">YENİ</Badge>
                                                    {ipo.statusText && (
                                                        <div className="h-6 px-3 rounded-full bg-blue-600 flex items-center gap-1.5 shadow-lg shadow-blue-500/20 animate-pulse">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">{ipo.statusText}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 relative z-10">
                                                <h3 className="font-black text-xl text-white tracking-tight leading-tight group-hover:text-primary transition-colors">{ipo.company}</h3>
                                                <div className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                                                    <span>{ipo.code}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                                    <span>{ipo.market}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2 mt-auto relative z-10">
                                                <div className="flex-1 bg-slate-900/50 rounded-[1.25rem] p-3 border border-slate-800/50 group-hover:border-primary/20 transition-colors">
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Fiyat</span>
                                                    <span className="text-lg font-black text-white italic">{ipo.price}</span>
                                                </div>
                                                <div className="flex-1 bg-slate-900/50 rounded-[1.25rem] p-3 border border-slate-800/50 group-hover:border-primary/20 transition-colors">
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-0.5">Tarih</span>
                                                    <span className="text-lg font-black text-white italic">{ipo.date}</span>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                                <ArrowRight className="w-5 h-5 text-primary" />
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Approved Table - Polished UI */}
                    <div className="space-y-6">
                        {!searchTerm && newIpos.length > 0 && (
                            <div className="flex items-center gap-3 px-2">
                                <ListFilter className="w-5 h-5 text-slate-500" />
                                <h2 className="text-lg font-black text-white italic tracking-tight">Tüm Halka Arzlar</h2>
                            </div>
                        )}
                        <div className="bg-slate-950/40 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
                            <IpoTable
                                ipos={paginatedApproved}
                                totalItems={approvedIpos.length}
                                currentPage={approvedPage}
                                onPageChange={setApprovedPage}
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="drafts" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row items-center gap-4 p-6 bg-slate-900/40 border border-amber-500/20 rounded-[2rem] text-amber-500 text-sm font-medium">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Info className="w-6 h-6" />
                        </div>
                        <p className="leading-relaxed">Aşağıdaki şirketler SPK onay aşamasındadır. Tarih ve fiyat bilgileri resmi onay sonrası kesinleşmektedir.</p>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
                        <IpoTable
                            ipos={paginatedDrafts}
                            isDraft
                            totalItems={draftIpos.length}
                            currentPage={draftPage}
                            onPageChange={setDraftPage}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function IpoTable({
    ipos,
    isDraft = false,
    totalItems,
    currentPage,
    onPageChange,
    itemsPerPage
}: {
    ipos: IpoItem[],
    isDraft?: boolean,
    totalItems: number,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPage: number
}) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalItems === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 border border-slate-800">
                    <Building2 className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-xl font-black text-white italic mb-2">Sonuç Bulunamadı</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Bu kategoride gösterilecek herhangi bir kayıt bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-900/50">
                        <TableRow className="border-slate-800 hover:bg-transparent h-14">
                            <TableHead className="w-[380px] text-xs font-black uppercase tracking-widest text-slate-500 pl-8">Şirket Adı</TableHead>
                            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500">{isDraft ? 'Durum' : 'Sembol'}</TableHead>
                            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500">Birim Fiyat</TableHead>
                            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500">Dağıtım Tarihi</TableHead>
                            <TableHead className="hidden md:table-cell text-xs font-black uppercase tracking-widest text-slate-500">Miktar & Yapı</TableHead>
                            <TableHead className="text-right pr-8 text-xs font-black uppercase tracking-widest text-slate-500">Detay</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ipos.map((ipo, index) => (
                            <TableRow key={index} className="group border-slate-800 hover:bg-slate-900/40 transition-colors h-20">
                                <TableCell className="pl-8">
                                    <Link href={`/market/ipo/${ipo.code}`} className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-white p-1 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                                            {ipo.imageUrl ? (
                                                <img src={ipo.imageUrl} alt={ipo.company} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-950">{ipo.code || '?'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-white font-black text-sm group-hover:text-primary transition-colors truncate italic tracking-tight">{ipo.company}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {ipo.isNew && !isDraft && <Badge variant="secondary" className="text-[8px] h-3.5 px-1 bg-primary/10 text-primary border-primary/20">YENİ</Badge>}
                                                {ipo.statusText && !isDraft && (
                                                    <span className="flex items-center gap-1.5 text-[8px] font-black text-blue-400 uppercase tracking-widest">
                                                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></div>
                                                        {ipo.statusText}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {isDraft ? (
                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest border-amber-500/20 text-amber-500 bg-amber-500/5">TASLAK</Badge>
                                    ) : (
                                        <span className="font-mono text-xs font-bold text-slate-400">{ipo.code}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-black text-white italic">{ipo.price || '-'}</span>
                                </TableCell>
                                <TableCell>
                                    {isDraft ? (
                                        <span className="text-slate-600 italic text-[10px] font-bold uppercase tracking-widest">Bekleniyor</span>
                                    ) : (
                                        <span className="text-sm font-medium text-slate-400">{ipo.date}</span>
                                    )}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-black text-slate-300 tracking-tight">{ipo.lotCount}</span>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{ipo.distributionMethod}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <Link href={`/market/ipo/${ipo.code}`} className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-primary group-hover:border-primary/30 group-hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls - Refined */}
            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8 border-t border-slate-800 bg-slate-900/20">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 order-2 md:order-1">
                        Sayfa <span className="text-slate-300">{currentPage}</span> / {totalPages}
                        <span className="mx-3 opacity-20">|</span>
                        Toplam <span className="text-slate-300">{totalItems}</span> Kayıt
                    </div>
                    <div className="flex items-center gap-2 order-1 md:order-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800 transition-all border border-transparent disabled:opacity-30"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Geri
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                    return (
                                        <Button
                                            key={page}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 w-8 rounded-lg text-xs font-black transition-all",
                                                currentPage === page
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary'
                                                    : 'text-slate-600 hover:text-white hover:bg-slate-800'
                                            )}
                                            onClick={() => onPageChange(page)}
                                        >
                                            {page}
                                        </Button>
                                    );
                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                    return <span key={page} className="px-1 text-slate-700 text-xs font-black">...</span>;
                                }
                                return null;
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800 transition-all border border-transparent disabled:opacity-30"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            İleri
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
