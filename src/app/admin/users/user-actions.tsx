'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

interface UserActionsProps {
    userId: string;
    currentRole: string;
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok) {
                enqueueSnackbar('Kullanıcı silindi.', { variant: 'success' });
                router.refresh();
            } else {
                enqueueSnackbar(data.message || 'Hata oluştu.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Bir hata oluştu.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async () => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        if (!confirm(`Kullanıcı rolünü ${newRole} olarak değiştirmek istediğinize emin misiniz?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();

            if (res.ok) {
                enqueueSnackbar('Rol güncellendi.', { variant: 'success' });
                router.refresh();
            } else {
                enqueueSnackbar(data.message || 'Hata oluştu.', { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar('Bir hata oluştu.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRoleChange}
                disabled={loading}
                className={currentRole === 'ADMIN' ? 'text-amber-600 border-amber-200' : 'text-blue-600 border-blue-200'}
            >
                {currentRole === 'ADMIN' ? 'Yöneticiyi Al' : 'Yönetici Yap'}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
                Sil
            </Button>
        </div>
    );
}
