'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSnackbar } from 'notistack';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    // Quick hack: Default to demo credentials
    const [formData, setFormData] = useState({
        email: 'user@example.com',
        password: 'password'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                enqueueSnackbar('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.', { variant: 'error' });
            } else {
                enqueueSnackbar('Giriş başarılı!', { variant: 'success' });
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            enqueueSnackbar('Bir hata oluştu.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 p-4 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-md relative">
                {/* Premium Card */}
                <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-4 border-gray-200/80 dark:border-white/20 shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300">
                    {/* Gradient Overlay */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-40"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full blur-3xl opacity-40"></div>

                    <div className="relative p-8">
                        <CardHeader className="p-0 mb-8">
                            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Borsa Takip
                            </CardTitle>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">Hesabınıza giriş yapın</p>
                        </CardHeader>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                                />
                                <Input
                                    label="Şifre"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="h-12 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Giriş Yapılıyor...
                                    </span>
                                ) : 'Giriş Yap'}
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white/70 dark:bg-gray-900/70 px-2 text-gray-500">veya</span>
                                </div>
                            </div>

                            <div className="text-center space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Hesabınız yok mu?{' '}
                                    <Link href="/register" className="font-semibold text-blue-600 hover:text-purple-600 dark:text-blue-400 dark:hover:text-purple-400 transition-colors">
                                        Kayıt Ol
                                    </Link>
                                </p>
                                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        💡 Demo: user@example.com / password
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
