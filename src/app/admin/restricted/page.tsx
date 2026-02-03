
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Trash2, GripVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSnackbar } from "notistack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RestrictedStock {
    id: string;
    code: string;
    company: string;
    measure: string;
    measureCredit: boolean;
    measureGross: boolean;
    measureSingle: boolean;
    measureOrder: boolean;
    measureNet: boolean;
    startDate: string;
    endDate: string;
    sortOrder: number;
}

function SortableRow({ item, onDelete }: { item: RestrictedStock, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as 'relative',
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <TableRow ref={setNodeRef} style={style} className={`${isDragging ? "bg-accent" : "hover:bg-primary/5"} transition-colors border-b border-border/50 h-20`}>
            <TableCell className="w-[40px] px-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-xl transition-colors inline-flex"
                >
                    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                </div>
            </TableCell>
            <TableCell className="font-black font-mono tracking-tighter text-lg text-primary">{item.code}</TableCell>
            <TableCell className="max-w-[150px] truncate font-medium text-muted-foreground" title={item.company}>{item.company}</TableCell>

            {[item.measureCredit, item.measureGross, item.measureSingle, item.measureOrder, item.measureNet].map((active, idx) => (
                <TableCell key={idx} className="text-center">
                    {active ? (
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    ) : (
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/20 mx-auto"></div>
                    )}
                </TableCell>
            ))}

            <TableCell className="whitespace-nowrap font-bold text-xs tabular-nums text-muted-foreground/70">{item.startDate}</TableCell>
            <TableCell className="whitespace-nowrap font-bold text-xs tabular-nums text-red-500/70">{item.endDate}</TableCell>
            <TableCell className="text-right px-6">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => onDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default function AdminRestrictedStocksPage() {
    const [stocks, setStocks] = useState<RestrictedStock[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchStocks = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/market/restricted');
            setStocks(res.data.stocks);
            setLastUpdated(res.data.lastUpdated);
        } catch (error) {
            enqueueSnackbar("Veriler getirilemedi", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await axios.post('/api/market/restricted', { action: 'sync' });
            enqueueSnackbar(`${res.data.added} yeni, ${res.data.updated} güncellendi.`, { variant: "success" });
            fetchStocks();
        } catch (error) {
            enqueueSnackbar("Senkronizasyon başarısız", { variant: "error" });
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        try {
            await axios.delete(`/api/market/restricted?id=${id}`);
            setStocks(stocks.filter(s => s.id !== id));
            enqueueSnackbar("Silindi", { variant: "success" });
        } catch (error) {
            enqueueSnackbar("Silme başarısız", { variant: "error" });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setStocks((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);

            // Update Backend
            const updates = newItems.map((item, index) => ({
                id: item.id,
                sortOrder: index // 0 at top
            }));

            axios.post('/api/market/restricted', { action: 'reorder', items: updates })
                .catch(() => enqueueSnackbar("Sıralama kaydedilemedi", { variant: "error" }));

            return newItems;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tedbirli Hisseler</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-muted-foreground italic text-sm">Otomatik takip edilen tedbirli hisseleri yönetin.</p>
                        {lastUpdated && (
                            <div className="flex items-center gap-1.5 bg-blue-500/5 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/10 text-[10px] font-semibold tracking-tight uppercase">
                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                <span>Güncel: {new Date(lastUpdated).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}
                    </div>
                </div>
                <Button onClick={handleSync} disabled={syncing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                    {syncing ? 'Taranıyor...' : 'Verileri Yenile'}
                </Button>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-[2rem] blur opacity-25"></div>
                <div className="relative bg-card rounded-[2rem] border border-border shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-border bg-muted/30">
                        <h3 className="text-xl font-bold tracking-tight">Hisse Listesi</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Sıralamayı değiştirmek için sürükleyin.</p>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50 border-b border-border/50 uppercase tracking-widest text-[10px] font-black text-muted-foreground/60">
                                    <TableRow className="hover:bg-transparent border-none h-12">
                                        <TableHead className="w-[40px] px-8"></TableHead>
                                        <TableHead>Kod</TableHead>
                                        <TableHead>Şirket</TableHead>
                                        <TableHead className="text-center">Kredili</TableHead>
                                        <TableHead className="text-center">Brüt</TableHead>
                                        <TableHead className="text-center">Tek Fiyat</TableHead>
                                        <TableHead className="text-center">Emir</TableHead>
                                        <TableHead className="text-center">İnternet</TableHead>
                                        <TableHead>Başlangıç</TableHead>
                                        <TableHead>Bitiş</TableHead>
                                        <TableHead className="text-right px-8 px-8">İşlem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && stocks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center py-20 text-muted-foreground font-medium italic animate-pulse">Veriler hazırlanıyor...</TableCell>
                                        </TableRow>
                                    ) : (
                                        <SortableContext items={stocks.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                            {stocks.map(stock => (
                                                <SortableRow key={stock.id} item={stock} onDelete={handleDelete} />
                                            ))}
                                        </SortableContext>
                                    )}
                                    {!loading && stocks.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center py-20 text-muted-foreground">
                                                Listelenecek veri yok. "Verileri Yenile" butonuna tıklayın.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}
