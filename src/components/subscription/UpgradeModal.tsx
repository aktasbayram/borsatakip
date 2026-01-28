'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export function UpgradeModal({ open, onClose, title, description }: UpgradeModalProps) {
    const router = useRouter();

    if (!open) return null;

    const handleUpgrade = () => {
        onClose();
        router.push('/upgrade');
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                        <span className="text-2xl">⚡</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {title || "AI Krediniz Bitti!"}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {description || "Daha fazla AI analizi yapmak için bir üst pakete geçin. Aylık 50 veya 100 kredili paketlerinden birini seçebilirsiniz."}
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleUpgrade}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                        >
                            Paket Yükselt
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
