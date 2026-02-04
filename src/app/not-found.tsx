import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800 mb-4">404</h1>
            <h2 className="text-2xl font-bold mb-2">Sayfa Bulunamadı</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                Aradığınız sayfa silinmiş, taşınmış veya hiç var olmamış olabilir.
            </p>
            <Link href="/">
                <Button size="lg" className="px-8">
                    Ana Sayfaya Dön
                </Button>
            </Link>
        </div>
    );
}
