'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSnackbar } from 'notistack';

interface User {
    id: string;
    email: string;
    name: string | null;
    subscriptionTier: string;
    aiCredits: number;
    aiCreditsTotal: number;
    createdAt: string;
}

export default function AdminPackagesPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data);
        } catch (error) {
            enqueueSnackbar('Kullanıcılar yüklenemedi', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePackageChange = async (userId: string, newTier: string) => {
        try {
            await axios.put(`/api/admin/users/${userId}/package`, { tier: newTier });
            enqueueSnackbar('Paket güncellendi', { variant: 'success' });
            fetchUsers(); // Refresh list
        } catch (error) {
            enqueueSnackbar('Paket güncellenemedi', { variant: 'error' });
            console.error('Package update error:', error);
        }
    };

    const getTierBadge = (tier: string) => {
        const badges: Record<string, { label: string; color: string }> = {
            'FREE': { label: 'FREE', color: 'bg-gray-500' },
            'BASIC_50': { label: 'BASIC', color: 'bg-blue-500' },
            'PRO_100': { label: 'PRO', color: 'bg-purple-500' },
        };
        const badge = badges[tier] || badges['FREE'];
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Paket Yönetimi</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Kullanıcı Paketleri</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Email</th>
                                    <th className="text-left p-3">İsim</th>
                                    <th className="text-left p-3">Mevcut Paket</th>
                                    <th className="text-left p-3">Krediler</th>
                                    <th className="text-left p-3">Paket Değiştir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="p-3">{user.email}</td>
                                        <td className="p-3">{user.name || '-'}</td>
                                        <td className="p-3">{getTierBadge(user.subscriptionTier)}</td>
                                        <td className="p-3">
                                            <span className="font-mono">{user.aiCredits}/{user.aiCreditsTotal}</span>
                                        </td>
                                        <td className="p-3">
                                            <select
                                                value={user.subscriptionTier}
                                                onChange={(e) => handlePackageChange(user.id, e.target.value)}
                                                className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                                            >
                                                <option value="FREE">FREE (5)</option>
                                                <option value="BASIC_50">BASIC (50)</option>
                                                <option value="PRO_100">PRO (100)</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
