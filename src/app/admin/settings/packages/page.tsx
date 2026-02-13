'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSnackbar } from 'notistack';
import { Plus, X } from 'lucide-react';

interface Package {
    id: string;
    name: string;
    displayName: string;
    price: number;
    credits: number;
    smsCredits: number;
    maxAlerts: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
    canSeeEditorChoices: boolean;
}

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        displayName: string;
        price: string;
        credits: string;
        smsCredits: string;
        maxAlerts: string;
        features: string[];
        isPopular: boolean;
        isActive: boolean;
        canSeeEditorChoices: boolean;
    }>({
        name: '',
        displayName: '',
        price: '',
        credits: '',
        smsCredits: '0',
        maxAlerts: '2',
        features: [''],
        isPopular: false,
        isActive: true,
        canSeeEditorChoices: false
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await axios.get('/api/admin/packages');
            setPackages(res.data);
        } catch (error) {
            enqueueSnackbar('Paketler yüklenemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pkg: Package) => {
        setFormData({
            name: pkg.name,
            displayName: pkg.displayName,
            price: pkg.price.toString(),
            credits: pkg.credits.toString(),
            smsCredits: (pkg.smsCredits || 0).toString(),
            maxAlerts: (pkg.maxAlerts || 2).toString(),
            features: pkg.features.length ? pkg.features : [''],
            isPopular: pkg.isPopular,
            isActive: pkg.isActive,
            canSeeEditorChoices: pkg.canSeeEditorChoices || false
        });
        setEditId(pkg.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            name: '',
            displayName: '',
            price: '',
            credits: '',
            smsCredits: '0',
            maxAlerts: '2',
            features: [''],
            isPopular: false,
            isActive: true,
            canSeeEditorChoices: false
        });
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter empty features
        const cleanFeatures = formData.features.filter(f => f.trim() !== '');
        const payload = { ...formData, features: cleanFeatures };

        try {
            if (editId) {
                await axios.put('/api/admin/packages', { id: editId, ...payload });
                enqueueSnackbar('Paket güncellendi', { variant: 'success' });
            } else {
                await axios.post('/api/admin/packages', payload);
                enqueueSnackbar('Paket oluşturuldu', { variant: 'success' });
            }
            fetchPackages();
            handleCancel();
        } catch (error) {
            enqueueSnackbar('İşlem başarısız', { variant: 'error' });
        }
    };

    const deletePackage = async (id: string) => {
        if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
        try {
            await axios.delete(`/api/admin/packages?id=${id}`);
            enqueueSnackbar('Paket silindi', { variant: 'success' });
            fetchPackages();
        } catch (error) {
            enqueueSnackbar('Silme başarısız', { variant: 'error' });
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">AI Paket Yönetimi</h1>

            {/* Editor Form */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <CardTitle>{isEditing ? 'Paketi Düzenle' : 'Yeni Paket Oluştur'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dahili Kod (Benzersiz)</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    placeholder="Örn: ULTRA_PRO"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Görünen İsim</Label>
                                <Input
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    placeholder="Örn: Ultra Paket"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fiyat (TL)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Aylık Kredi (AI)</Label>
                                <Input
                                    type="number"
                                    value={formData.credits}
                                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                    placeholder="100"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Aylık SMS Kredisi</Label>
                                <Input
                                    type="number"
                                    value={formData.smsCredits}
                                    onChange={(e) => setFormData({ ...formData, smsCredits: e.target.value })}
                                    placeholder="50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Maksimum Alarm</Label>
                                <Input
                                    type="number"
                                    value={formData.maxAlerts}
                                    onChange={(e) => setFormData({ ...formData, maxAlerts: e.target.value })}
                                    placeholder="2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Özellikler</Label>
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        placeholder={`Özellik ${index + 1}`}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                                        <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addFeature} className="mt-2">
                                <Plus className="w-4 h-4 mr-2" /> Özellik Ekle
                            </Button>
                        </div>

                        <div className="flex items-center gap-8 py-2">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="popular"
                                    checked={formData.isPopular}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                                />
                                <Label htmlFor="popular">Popüler Etiketi</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="active"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="active">Aktif</Label>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                id="editor-choices"
                                checked={formData.canSeeEditorChoices}
                                onCheckedChange={(checked) => setFormData({ ...formData, canSeeEditorChoices: checked })}
                            />
                            <Label htmlFor="editor-choices">Editörün Seçimleri Erişimi</Label>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                                {isEditing ? 'Güncelle' : 'Oluştur'}
                            </Button>
                            {isEditing && (
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    İptal
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <div className="grid md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                    <Card key={pkg.id} className={`hover:border-primary/50 transition-colors ${!pkg.isActive ? 'opacity-60' : ''}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">{pkg.displayName}</CardTitle>
                                <div className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                                    {pkg.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">{pkg.price} ₺</div>
                                <div className="text-sm text-muted-foreground">{pkg.credits} AI Kredi</div>
                                <div className="text-sm text-muted-foreground">{pkg.smsCredits || 0} SMS Kredi</div>
                                <div className="text-sm text-muted-foreground">{pkg.maxAlerts || 2} Alarm</div>
                                {pkg.canSeeEditorChoices && (
                                    <div className="text-xs text-green-600 font-bold mt-1">
                                        Editör Seçimleri ✓
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm space-y-1 mb-4 text-muted-foreground">
                                {pkg.features.slice(0, 3).map((f, i) => (
                                    <li key={i}>• {f}</li>
                                ))}
                                {pkg.features.length > 3 && <li>...</li>}
                            </ul>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(pkg)}>
                                    Düzenle
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => deletePackage(pkg.id)}>
                                    Sil
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
}
