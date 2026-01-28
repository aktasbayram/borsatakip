'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSnackbar } from 'notistack';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';

type GuestNotification = {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    link?: string;
};

export default function GuestNotificationsPage() {
    const [notifications, setNotifications] = useState<GuestNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<GuestNotification, 'id'>>({
        title: '',
        message: '',
        type: 'INFO',
        link: ''
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/admin/notifications/guest');
            setNotifications(res.data);
        } catch (error) {
            enqueueSnackbar('Bildirimler yüklenirken hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.message) {
            enqueueSnackbar('Başlık ve mesaj alanları zorunludur', { variant: 'warning' });
            return;
        }

        let newNotifications = [...notifications];

        if (isEditing && editingId) {
            // Update existing
            newNotifications = newNotifications.map(n =>
                n.id === editingId ? { ...formData, id: editingId } : n
            );
        } else {
            // Add new
            newNotifications.push({
                ...formData,
                id: crypto.randomUUID()
            });
        }

        try {
            await axios.post('/api/admin/notifications/guest', newNotifications);
            setNotifications(newNotifications);
            enqueueSnackbar('Kaydedildi', { variant: 'success' });

            // Reset Form
            resetForm();
        } catch (error) {
            enqueueSnackbar('Kaydetme hatası', { variant: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu bildirimi silmek istediğinize emin misiniz?')) return;

        const newNotifications = notifications.filter(n => n.id !== id);

        try {
            await axios.post('/api/admin/notifications/guest', newNotifications);
            setNotifications(newNotifications);
            enqueueSnackbar('Silindi', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Silme hatası', { variant: 'error' });
        }
    };

    const handleEdit = (note: GuestNotification) => {
        setFormData({
            title: note.title,
            message: note.message,
            type: note.type,
            link: note.link
        });
        setEditingId(note.id);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ title: '', message: '', type: 'INFO', link: '' });
        setIsEditing(false);
        setEditingId(null);
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Ziyaretçi Bildirimleri</h1>
            <p className="text-gray-500">
                Giriş yapmamış kullanıcılara gösterilecek varsayılan bildirimleri buradan yönetebilirsiniz.
                Bu bildirimler ziyaretçi sayfayı her yenilediğinde (önbelleğe alınmamışsa) gösterilir.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Bildirimi Düzenle' : 'Yeni Bildirim Ekle'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Başlık"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: Hoşgeldiniz"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mesaj
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Bildirim içeriği..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tip
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full h-10 px-3 rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <option value="INFO">Bilgi (Mavi)</option>
                                    <option value="SUCCESS">Başarı (Yeşil)</option>
                                    <option value="WARNING">Uyarı (Sarı)</option>
                                    <option value="ERROR">Hata (Kırmızı)</option>
                                </select>
                            </div>
                            <Input
                                label="Link (Opsiyonel)"
                                value={formData.link || ''}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                placeholder="/register"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleSave} className="flex-1">
                                {isEditing ? 'Güncelle' : 'Ekle'}
                            </Button>
                            {isEditing && (
                                <Button variant="outline" onClick={resetForm}>
                                    İptal
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* List Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Aktif Bildirimler ({notifications.length})</h2>
                    {notifications.length === 0 && (
                        <div className="text-gray-500 text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed">
                            Henüz eklenmiş bir bildirim yok.
                        </div>
                    )}
                    <div className="space-y-3">
                        {notifications.map((note) => (
                            <div
                                key={note.id}
                                className={`p-4 rounded-lg border flex gap-3 group bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md
                                    ${note.type === 'SUCCESS' ? 'border-l-4 border-l-green-500' :
                                        note.type === 'WARNING' ? 'border-l-4 border-l-yellow-500' :
                                            note.type === 'ERROR' ? 'border-l-4 border-l-red-500' :
                                                'border-l-4 border-l-blue-500'
                                    }`}
                            >
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm">{note.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{note.message}</p>
                                    {note.link && (
                                        <span className="text-xs text-blue-500 mt-2 block truncate">Link: {note.link}</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(note)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                        title="Düzenle"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
