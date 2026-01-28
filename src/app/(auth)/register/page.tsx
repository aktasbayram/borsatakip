'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
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
                                Hesap Oluştur
                            </CardTitle>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">Borsa Takip'e katılın</p>
                        </CardHeader>

                        <RegisterForm
                            onLoginClick={() => window.location.href = '/login'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
