'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSnackbar } from 'notistack';

interface LoginFormProps {
    onSuccess?: () => void;
    onRegisterClick?: () => void;
    embedded?: boolean;
}

export function LoginForm({ onSuccess, onRegisterClick, embedded = false }: LoginFormProps) {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    // Quick hack: Default to demo credentials
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push('/');
                }
                router.refresh();
            }
        } catch (error) {
            enqueueSnackbar('Bir hata oluştu.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
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
                    <span className="bg-background px-2 text-gray-500">veya</span>
                </div>
            </div>

            <div className="text-center space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hesabınız yok mu?{' '}
                    <button
                        type="button"
                        onClick={onRegisterClick}
                        className="font-semibold text-blue-600 hover:text-purple-600 dark:text-blue-400 dark:hover:text-purple-400 transition-colors"
                    >
                        Kayıt Ol
                    </button>
                </p>
            </div>
        </form>
    );
}
