'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, X, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    _count?: {
        posts: number;
    };
}

interface CategoryManagerProps {
    selectedCategoryId?: string;
    onSelect: (categoryId: string) => void;
}

export function CategoryManager({ selectedCategoryId, onSelect }: CategoryManagerProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // Create & Edit State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { enqueueSnackbar } = useSnackbar();

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/admin/categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openCreateDialog = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (e: React.MouseEvent, category: Category) => {
        e.stopPropagation();
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;

        setLoading(true);
        try {
            if (editingCategory) {
                // Update
                const res = await axios.put(`/api/admin/categories/${editingCategory.id}`, formData);
                enqueueSnackbar('Kategori güncellendi', { variant: 'success' });
            } else {
                // Create
                const res = await axios.post('/api/admin/categories', formData);
                enqueueSnackbar('Kategori oluşturuldu', { variant: 'success' });
                onSelect(res.data.id); // Auto select new category
            }

            setIsDialogOpen(false);
            await fetchCategories();
        } catch (error: any) {
            const msg = error.response?.data?.error || 'İşlem başarısız oldu';
            enqueueSnackbar(msg, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;

        try {
            await axios.delete(`/api/admin/categories/${deleteId}`);
            enqueueSnackbar('Kategori silindi', { variant: 'success' });
            if (selectedCategoryId === deleteId) onSelect(''); // Deselect if deleted
            await fetchCategories();
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Silme işlemi başarısız';
            enqueueSnackbar(msg, { variant: 'error' });
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Kategori</Label>
                <Button variant="ghost" size="sm" onClick={openCreateDialog} className="h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Yeni Ekle
                </Button>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</DialogTitle>
                        <DialogDescription>
                            Blog kategorisini {editingCategory ? 'güncelleyin' : 'oluşturun'}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Kategori Adı</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Örn: Teknoloji"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Açıklama (İsteğe bağlı)</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Kategori açıklaması..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Emin misiniz?</DialogTitle>
                        <DialogDescription>
                            Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            Eğer kategorinin içinde yazılar varsa silme işlemi engellenecektir.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>İptal</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={`
                            group relative cursor-pointer p-3 rounded-lg border text-sm transition-all
                            flex items-center justify-between
                            ${selectedCategoryId === cat.id
                                ? 'bg-primary/10 border-primary text-primary font-medium'
                                : 'bg-background hover:bg-muted border-border text-muted-foreground'}
                        `}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FolderPlus className="w-4 h-4 shrink-0" />
                            <div className="flex flex-col truncate">
                                <span className="truncate">{cat.name}</span>
                                {cat._count && (
                                    <span className="text-[10px] opacity-70">{cat._count.posts} Yazı</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => openEditDialog(e, cat)}
                                title="Düzenle"
                            >
                                <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:text-red-500"
                                onClick={(e) => handleDeleteClick(e, cat.id)}
                                title="Sil"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                    Henüz kategori yok.
                </div>
            )}
        </div>
    );
}
