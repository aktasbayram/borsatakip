'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSnackbar } from 'notistack';

interface BankAccount {
    id: string;
    bankName: string;
    accountHolder: string;
    iban: string;
    isActive: boolean;
}

export default function AdminBanksPage() {
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ bankName: '', accountHolder: '', iban: '' });
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const res = await axios.get('/api/admin/bank-accounts');
            setBanks(res.data);
        } catch (error) {
            enqueueSnackbar('Bankalar yüklenemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/bank-accounts', formData);
            enqueueSnackbar('Banka eklendi', { variant: 'success' });
            setFormData({ bankName: '', accountHolder: '', iban: '' });
            fetchBanks();
        } catch (error) {
            enqueueSnackbar('Ekleme başarısız', { variant: 'error' });
        }
    };

    const toggleActive = async (id: string, currentState: boolean) => {
        try {
            await axios.put('/api/admin/bank-accounts', { id, isActive: !currentState });
            fetchBanks();
        } catch (error) {
            enqueueSnackbar('Güncelleme başarısız', { variant: 'error' });
        }
    };

    const deleteBank = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await axios.delete(`/api/admin/bank-accounts?id=${id}`);
            enqueueSnackbar('Silindi', { variant: 'success' });
            fetchBanks();
        } catch (error) {
            enqueueSnackbar('Silme başarısız', { variant: 'error' });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Banka Hesap Yönetimi</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Yeni Banka Ekle</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Banka Adı</Label>
                            <Input
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="Örn: Ziraat Bankası"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Alıcı Adı Soyadı</Label>
                            <Input
                                value={formData.accountHolder}
                                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                                placeholder="Örn: Bayram Aktaş"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>IBAN</Label>
                            <Input
                                value={formData.iban}
                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                placeholder="TR..."
                                required
                            />
                        </div>
                        <Button type="submit">Ekle</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Hesaplar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {banks.map((bank) => (
                            <div key={bank.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                <div>
                                    <h3 className="font-bold text-lg">{bank.bankName}</h3>
                                    <p className="text-sm text-gray-500">{bank.accountHolder}</p>
                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{bank.iban}</code>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`switch-${bank.id}`} className="text-sm text-gray-500">
                                            {bank.isActive ? 'Aktif' : 'Pasif'}
                                        </Label>
                                        <Switch
                                            id={`switch-${bank.id}`}
                                            checked={bank.isActive}
                                            onCheckedChange={() => toggleActive(bank.id, bank.isActive)}
                                        />
                                    </div>
                                    <Button variant="danger" size="sm" onClick={() => deleteBank(bank.id)}>
                                        Sil
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
