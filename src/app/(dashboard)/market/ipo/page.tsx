"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Building2, Ticket, TrendingUp, Info, Search, ListFilter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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

    // Separate categories with STRICT filtering
    // Only Active and New go to approved, everything else goes to drafts
    const approvedIpos = filteredIpos.filter(x => x.status === 'Active' || x.status === 'New');
    const draftIpos = filteredIpos.filter(x => x.status !== 'Active' && x.status !== 'New');

    // Filter "New" items for the Featured Cards
    const newIpos = approvedIpos.filter(x => x.isNew);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-7xl py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Halka Arz Takvimi</h1>
                    <p className="text-muted-foreground text-sm">
                        Güncel, taslak ve tamamlanan halka arzları detaylı inceleyin.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Şirket veya Kod ara..."
                        className="pl-9 bg-muted/40 border-muted-foreground/20 focus:bg-background transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="approved" className="w-full">
                <TabsList className="mb-8 p-1 bg-muted/50 border border-border/50 rounded-xl h-12 w-full md:w-auto grid grid-cols-2 md:inline-flex">
                    <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10 px-6 transition-all">
                        Onaylı Halka Arzlar
                        <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">{approvedIpos.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="drafts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10 px-6 transition-all">
                        Taslak Halka Arzlar
                        <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">{draftIpos.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="approved" className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
                    {/* Featured Section - Only show new items here if no search is active */}
                    {!searchTerm && newIpos.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                                <span className="relative flex h-2.5 w-2.5 mr-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                </span>
                                Talep Toplama / Yeni Başvurular
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {newIpos.map((ipo, index) => (
                                    <Link key={index} href={`/market/ipo/${ipo.url.split('/').filter(Boolean).pop()}`} className="group block h-full">
                                        <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-card to-secondary/10">
                                            <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                            <CardContent className="flex-1 p-5 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="w-12 h-12 rounded-lg bg-white p-1 border border-border/50 shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                                                        {ipo.imageUrl ? (
                                                            <img src={ipo.imageUrl} alt={ipo.code} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-black">{ipo.code}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {ipo.statusText && (
                                                            <Badge className="relative overflow-hidden bg-blue-600 text-white hover:bg-blue-700 border-0 text-[10px] whitespace-nowrap h-6 px-2 shadow-md animate-pulse">
                                                                <span className="mr-1.5 relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                                                </span>
                                                                {ipo.statusText.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0 h-6 px-2">YENİ</Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{ipo.company}</h3>
                                                    <div className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                                                        <span>{ipo.code}</span>
                                                        <span className="w-1 h-1 rounded-full bg-border"></span>
                                                        <span>{ipo.market}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm pt-2">
                                                    <div className="bg-background/80 rounded-md px-2.5 py-1.5 border border-border/50 shadow-sm">
                                                        <span className="text-xs text-muted-foreground block">Fiyat</span>
                                                        <span className="font-semibold">{ipo.price}</span>
                                                    </div>
                                                    <div className="bg-background/80 rounded-md px-2.5 py-1.5 border border-border/50 shadow-sm">
                                                        <span className="text-xs text-muted-foreground block">Tarih</span>
                                                        <span className="font-semibold">{ipo.date}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Approved Table */}
                    <div className="space-y-4">
                        {!searchTerm && newIpos.length > 0 && <h2 className="text-lg font-semibold flex items-center gap-2 mt-8">
                            <ListFilter className="w-5 h-5 text-muted-foreground" />
                            Tüm Liste
                        </h2>}
                        <IpoTable ipos={approvedIpos} />
                    </div>
                </TabsContent>

                <TabsContent value="drafts" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex items-center gap-2 mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-yellow-700 dark:text-yellow-500 text-sm">
                        <Info className="w-4 h-4 shrink-0" />
                        <p>Bu listedeki şirketler SPK onay aşamasındadır. Tarih ve fiyat bilgileri kesinleşmemiştir.</p>
                    </div>
                    <IpoTable ipos={draftIpos} isDraft />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function IpoTable({ ipos, isDraft = false }: { ipos: IpoItem[], isDraft?: boolean }) {
    if (ipos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card rounded-xl border border-border">
                <Building2 className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium">Kayıt Bulunamadı</h3>
                <p>Bu kategoride gösterilecek halka arz bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[350px]">Şirket</TableHead>
                        <TableHead>{isDraft ? 'Durum' : 'BIST Kodu'}</TableHead>
                        <TableHead>Fiyat</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead className="hidden md:table-cell">Lot & Dağıtım</TableHead>
                        <TableHead className="text-right">Detay</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ipos.map((ipo, index) => (
                        <TableRow key={index} className="group cursor-pointer hover:bg-muted/30">
                            <TableCell className="font-medium">
                                <Link href={`/market/ipo/${ipo.url.split('/').filter(Boolean).pop()}`} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-md bg-white p-0.5 border border-border/60 shrink-0 overflow-hidden flex items-center justify-center">
                                        {ipo.imageUrl ? (
                                            <img src={ipo.imageUrl} alt={ipo.company} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] font-bold text-black">{ipo.code || '?'}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="group-hover:text-primary transition-colors line-clamp-1">{ipo.company}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            {ipo.isNew && !isDraft && <Badge variant="secondary" className="md:hidden w-fit text-[9px] h-4 px-1 bg-green-500/10 text-green-600">YENİ</Badge>}
                                            {ipo.statusText && !isDraft && (
                                                <Badge className="w-fit text-[9px] h-4 px-1 bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm animate-pulse flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-ping"></span>
                                                    {ipo.statusText.toUpperCase()}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell>
                                {isDraft ? (
                                    <Badge variant="outline" className="font-mono text-xs border-yellow-500/30 text-yellow-600 bg-yellow-500/5">TASLAK</Badge>
                                ) : (
                                    <Badge variant="outline" className="font-mono">{ipo.code}</Badge>
                                )}
                            </TableCell>
                            <TableCell className="font-semibold text-muted-foreground text-sm">
                                {ipo.price || '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                                {isDraft ? (
                                    <span className="text-muted-foreground italic text-xs">Bekleniyor...</span>
                                ) : (
                                    ipo.date
                                )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="text-xs text-muted-foreground">
                                    <div className="font-medium text-foreground">{ipo.lotCount}</div>
                                    <div className="opacity-70">{ipo.distributionMethod}</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {ipo.isNew && !isDraft && <Badge variant="secondary" className="hidden md:inline-flex text-[10px] h-5 px-1.5 bg-green-500/10 text-green-600">YENİ</Badge>}
                                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Link href={`/market/ipo/${ipo.url.split('/').filter(Boolean).pop()}`}>
                                            <Info className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                        </Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
