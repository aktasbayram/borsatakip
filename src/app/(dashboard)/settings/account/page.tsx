'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, Check } from 'lucide-react';

import { useSession } from "next-auth/react";

export default function AccountSettingsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
    }

    if (status === 'unauthenticated') return null;

    // Profile State
    const [profile, setProfile] = useState({
        id: '',
        name: '',
        email: '',
        phoneNumber: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    id: data.id || '',
                    name: data.name || '',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    phoneNumber: profile.phoneNumber
                })
            });

            if (!res.ok) throw new Error('Güncelleme başarısız');

            await update({ name: profile.name }); // Update session immediately
            enqueueSnackbar('Profil bilgileri güncellendi', { variant: 'success' });
            // Force a hard refresh if needed, but update() should suffice for client components
            // router.refresh(); 
        } catch (error) {
            enqueueSnackbar('Hata oluştu', { variant: 'error' });
        } finally {
            setProfileLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profile.id);
        setCopied(true);
        enqueueSnackbar('ID kopyalandı', { variant: 'success' });
        setTimeout(() => setCopied(false), 2000);
    };

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            enqueueSnackbar('Yeni şifreler eşleşmiyor.', { variant: 'error' });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Bir hata oluştu.');
            }

            enqueueSnackbar('Şifreniz başarıyla güncellendi.', { variant: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/settings/indices" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        ← Geri
                    </Link>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Hesap Ayarları
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Hesap güvenliğinizi yönetin</p>
            </div>

            {/* Profile Information */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-4 border-gray-200/80 dark:border-white/20 shadow-lg mb-8 transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-gradient-to-bl from-blue-500 to-indigo-600 rounded-full blur-3xl opacity-20"></div>

                <div className="relative p-8">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Profil Bilgileri
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Kişisel bilgilerinizi buradan yönetebilirsiniz.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                    Kullanıcı ID
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={profile.id}
                                        readOnly
                                        className="h-12 bg-gray-100/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 text-gray-500 font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={copyToClipboard}
                                        className="h-12 w-12 shrink-0 border-2 border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="ID'yi Kopyala"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Input
                                label="Ad Soyad"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Adınız Soyadınız"
                                className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            />

                            <Input
                                label="E-posta"
                                value={profile.email}
                                readOnly
                                disabled
                                className="h-12 bg-gray-100/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 text-gray-500 opacity-70"
                            />

                            <Input
                                label="Telefon Numarası"
                                value={profile.phoneNumber}
                                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                                placeholder="5XX XXX XX XX"
                                className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={profileLoading}
                                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                {profileLoading ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Password Change */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-4 border-gray-200/80 dark:border-white/20 shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300">
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full blur-3xl opacity-30"></div>

                <div className="relative p-8">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Şifre Değiştir
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Hesabınızın güvenliği için şifrenizi güncelleyebilirsiniz.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        <div className="space-y-4">
                            <Input
                                label="Mevcut Şifre"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                                className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            />
                            <Input
                                label="Yeni Şifre"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            />
                            <Input
                                label="Yeni Şifre (Tekrar)"
                                type="password"
                                value={passwordData.confirmNewPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                required
                                className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Güncelleniyor...
                                    </span>
                                ) : 'Şifreyi Güncelle'}
                            </Button>
                        </div>

                        {/* Security Tip */}
                        <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Güvenlik İpucu</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        Güçlü bir şifre en az 8 karakter uzunluğunda olmalı ve harf, rakam ve özel karakterler içermelidir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
