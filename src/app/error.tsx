'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-6">
                <svg
                    className="w-12 h-12 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Bir şeyler ters gitti!</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
                Beklenmedik bir hata oluştu. Teknik ekibimiz bilgilendirildi.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Tekrar Dene
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    Ana Sayfaya Dön
                </Button>
            </div>
        </div>
    );
}
