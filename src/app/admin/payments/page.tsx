'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSnackbar } from 'notistack';

interface Transaction {
    id: string;
    user: { email: string; name: string | null };
    package: string;
    amount: number;
    senderName: string;
    status: string;
    createdAt: string;
}

export default function AdminPaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const fetchTransactions = async () => {
        try {
            const res = await axios.get('/api/admin/payments');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Veriler yüklenemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(action === 'APPROVE' ? 'Onaylamak istiyor musunuz?' : 'Reddetmek istiyor musunuz?')) return;

        try {
            await axios.patch('/api/admin/payments', { id, action });
            enqueueSnackbar('İşlem başarılı', { variant: 'success' });
            fetchTransactions(); // Refresh
        } catch (error) {
            console.error(error);
            enqueueSnackbar('İşlem başarısız', { variant: 'error' });
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Ödeme Bildirimleri</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Bekleyen ve Geçmiş İşlemler</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-800 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Kullanıcı</th>
                                    <th className="px-4 py-3">Paket</th>
                                    <th className="px-4 py-3">Tutar</th>
                                    <th className="px-4 py-3">Gönderen</th>
                                    <th className="px-4 py-3">Tarih</th>
                                    <th className="px-4 py-3">Durum</th>
                                    <th className="px-4 py-3">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                            Kayıt bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{tx.user.name || 'İsimsiz'}</div>
                                                <div className="text-xs text-gray-500">{tx.user.email}</div>
                                            </td>
                                            <td className="px-4 py-3 font-bold">{tx.package}</td>
                                            <td className="px-4 py-3">{tx.amount} TL</td>
                                            <td className="px-4 py-3">{tx.senderName}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(tx.createdAt).toLocaleString('tr-TR')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${tx.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        tx.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {tx.status === 'APPROVED' ? 'ONAYLANDI' :
                                                        tx.status === 'REJECTED' ? 'REDDEDİLDİ' : 'BEKLİYOR'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {tx.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleAction(tx.id, 'APPROVE')}
                                                        >
                                                            Onayla
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8"
                                                            onClick={() => handleAction(tx.id, 'REJECT')}
                                                        >
                                                            Reddet
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
