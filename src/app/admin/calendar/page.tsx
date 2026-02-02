"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import axios from "axios";
import { Calendar as CalendarIcon, RefreshCw, Plus, Trash2, Globe, Edit, Lock, Unlock, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSnackbar } from "notistack";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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

// Types
interface AgendaItem {
    id: string;
    time: string;
    countryCode: 'TR' | 'US' | 'EU' | 'CA' | 'CN' | 'JP' | 'GB' | 'DE';
    title: string;
    expectation?: string;
    actual?: string;
    previous?: string;
    impact: 'low' | 'medium' | 'high';
    isManual?: boolean;
    isLocked?: boolean;
    sortOrder?: number;
}

// Sortable Row Component
function SortableRow({ item, onEdit, onDelete }: { item: AgendaItem; onEdit: (item: AgendaItem) => void; onDelete: (id: string) => void }) {
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
        <TableRow
            ref={setNodeRef}
            style={style}
            className={`${item.isLocked ? "bg-muted/30" : ""} ${isDragging ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
        >
            <TableCell>
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded inline-flex"
                >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
            </TableCell>
            <TableCell>
                {item.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
            </TableCell>
            <TableCell className="font-mono">{item.time}</TableCell>
            <TableCell>
                <span className="text-xl" title={item.countryCode}>
                    {{
                        'TR': '🇹🇷', 'US': '🇺🇸', 'EU': '🇪🇺',
                        'CA': '🇨🇦', 'CN': '🇨🇳', 'JP': '🇯🇵',
                        'GB': '🇬🇧', 'DE': '🇩🇪'
                    }[item.countryCode] || '🌐'}
                </span>
            </TableCell>
            <TableCell className="font-medium">
                {item.title}
                {item.isManual && <Badge variant="secondary" className="ml-2 text-[10px]">Manuel</Badge>}
            </TableCell>
            <TableCell>
                <Badge
                    variant={item.impact === 'high' ? 'destructive' : item.impact === 'medium' ? 'default' : 'secondary'}
                    className={item.impact === 'medium' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                    {{ 'high': 'Yüksek', 'medium': 'Orta', 'low': 'Düşük' }[item.impact]}
                </Badge>
            </TableCell>
            <TableCell>{item.expectation || '-'}</TableCell>
            <TableCell className="font-bold">{item.actual || '-'}</TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => onEdit(item)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(item.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

export default function AdminCalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        time: '',
        title: '',
        countryCode: 'TR',
        importance: 'medium',
        expectation: '',
        actual: '',
        isLocked: false,
        sortOrder: 0
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchAgenda = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/agenda?date=${selectedDate}`);
            setItems(res.data);
        } catch (error) {
            enqueueSnackbar("Veriler getirilemedi", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgenda();
    }, [selectedDate]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await axios.post('/api/agenda', { date: selectedDate });
            if (res.data.count !== undefined) {
                enqueueSnackbar(`${res.data.count} kayıt senkronize edildi`, { variant: "success" });
            } else {
                enqueueSnackbar("Senkronizasyon tamamlandı", { variant: "success" });
            }
            fetchAgenda();
        } catch (error) {
            enqueueSnackbar("Senkronizasyon başarısız", { variant: "error" });
        } finally {
            setSyncing(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setItems((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);

            // Backend expects sortOrder update.
            // Since our backend sorts DESCENDING by sortOrder, the first item should have highest sortOrder.
            // We can assign sortOrder = length - index.

            const updates = newItems.map((item, index) => ({
                id: item.id,
                sortOrder: newItems.length - index // Simple strategy: N, N-1, ..., 1
            }));

            // Sync with backend without blocking UI
            // Using a distinct variable for the API call to avoid closure staleness issues
            const apiPayload = {
                action: 'reorder',
                items: updates
            };

            axios.post('/api/agenda', apiPayload).catch(err => {
                console.error("Reorder failed", err);
                enqueueSnackbar("Sıralama güncellenemedi", { variant: "error" });
            });

            return newItems;
        });
    };

    const handleOpenModal = (item?: AgendaItem) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                time: item.time,
                title: item.title,
                countryCode: item.countryCode as any,
                importance: item.impact,
                expectation: item.expectation || '',
                actual: item.actual || '',
                isLocked: item.isLocked || false,
                sortOrder: item.sortOrder || 0
            });
        } else {
            setEditingId(null);
            setFormData({
                time: '',
                title: '',
                countryCode: 'TR',
                importance: 'medium',
                expectation: '',
                actual: '',
                isLocked: false,
                sortOrder: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            // Prepare data for DB (map expectation -> forecast)
            const payload = {
                ...formData,
                forecast: formData.expectation,
                date: selectedDate
            };
            // @ts-ignore
            delete payload.expectation;

            if (editingId) {
                // Update
                await axios.put('/api/agenda', {
                    id: editingId,
                    data: payload
                });
                enqueueSnackbar("Güncellendi", { variant: "success" });
            } else {
                // Create
                await axios.post('/api/agenda', {
                    action: 'create',
                    data: payload
                });
                enqueueSnackbar("Eklendi", { variant: "success" });
            }
            setIsModalOpen(false);
            fetchAgenda();
        } catch (error) {
            enqueueSnackbar("İşlem başarısız", { variant: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
        try {
            await axios.delete(`/api/agenda?id=${id}`);
            enqueueSnackbar("Silindi", { variant: "success" });
            fetchAgenda();
        } catch (e) {
            console.error(e);
            enqueueSnackbar("Silme başarısız", { variant: "error" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ekonomik Takvim</h1>
                    <p className="text-muted-foreground">
                        Ekonomik takvim verilerini yönetin ve senkronize edin.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={syncing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Senkronize Ediliyor...' : 'Şimdi Senkronize Et'}
                    </Button>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Ekle
                    </Button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-card p-6 rounded-lg w-full max-w-md border shadow-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">{editingId ? 'Düzenle' : 'Yeni Veri Ekle'}</h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Saat</label>
                                    <Input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Ülke Kodu</label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.countryCode}
                                    onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                                >
                                    <option value="TR">Türkiye (TR)</option>
                                    <option value="US">ABD (US)</option>
                                    <option value="EU">Avrupa (EU)</option>
                                    <option value="DE">Almanya (DE)</option>
                                    <option value="GB">İngiltere (GB)</option>
                                    <option value="JP">Japonya (JP)</option>
                                    <option value="CN">Çin (CN)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Başlık</label>
                                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Örn: Enflasyon Oranı" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Önem</label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.importance}
                                    onChange={e => setFormData({ ...formData, importance: e.target.value })}
                                >
                                    <option value="low">Düşük</option>
                                    <option value="medium">Orta</option>
                                    <option value="high">Yüksek</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-medium">Beklenti</label>
                                    <Input value={formData.expectation} onChange={e => setFormData({ ...formData, expectation: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Açıklanan</label>
                                    <Input value={formData.actual} onChange={e => setFormData({ ...formData, actual: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isLocked"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={formData.isLocked}
                                    onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                                />
                                <label
                                    htmlFor="isLocked"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Kilitle (Otomatik güncelleme etkilemesin)
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
                            <Button onClick={handleSave}>Kaydet</Button>
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-medium">
                        Takvim Listesi
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="w-auto"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30px]"></TableHead>
                                        <TableHead className="w-[30px]"></TableHead>
                                        <TableHead>Saat</TableHead>
                                        <TableHead className="w-[50px]">Ülke</TableHead>
                                        <TableHead>Başlık</TableHead>
                                        <TableHead>Önem</TableHead>
                                        <TableHead>Beklenti</TableHead>
                                        <TableHead>Açıklanan</TableHead>
                                        <TableHead className="text-right">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                Yükleniyor...
                                            </TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                Bu tarihte veri bulunamadı.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <SortableContext
                                            items={items.map(item => item.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {items.map((item) => (
                                                <SortableRow
                                                    key={item.id}
                                                    item={item}
                                                    onEdit={handleOpenModal}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </SortableContext>
                                    )}
                                </TableBody>
                            </Table>
                        </DndContext>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
