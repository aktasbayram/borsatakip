'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BankTransferModal } from '@/components/payment/BankTransferModal';

interface Package {
    id: string;
    name: string;
    displayName: string;
    price: number;
    credits: number;
    features: string[];
    isPopular: boolean;
    color?: string;
}

export default function UpgradePage() {
    const { status } = useSession();
    const router = useRouter();
    const [currentTier, setCurrentTier] = useState<string>('FREE');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<{ name: string, price: number } | null>(null);
    const [plans, setPlans] = useState<Package[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests = [axios.get('/api/packages')];

                // Only fetch credits if user is authenticated
                if (status === 'authenticated') {
                    requests.push(axios.get('/api/user/credits'));
                }

                const results = await Promise.all(requests);

                setPlans(results[0].data);

                if (status === 'authenticated' && results[1]) {
                    setCurrentTier(results[1].data.tier || 'FREE');
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (status !== 'loading') {
            fetchData();
        }
    }, [status]);

    const handlePurchase = (pkg: Package) => {
        if (status === 'unauthenticated') {
            const redirectUrl = pkg.name === 'FREE' ? '/register' : '/login';
            router.push(`${redirectUrl}?callbackUrl=${encodeURIComponent(window.location.href)}`);
            return;
        }

        // Map dynamic package to payment modal props
        setSelectedPackage({ name: pkg.name, price: pkg.price });
        setModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
    }

    // Sort plans by price
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                    AI Kredi Paketleri
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    İhtiyacınıza uygun paketi seçin ve AI analizlerinden sınırsızca yararlanın
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {sortedPlans.map((plan) => {
                    const isCurrent = status === 'authenticated' && plan.name === currentTier;

                    // Find current plan details to compare prices
                    const currentPlanDetails = sortedPlans.find(p => p.name === currentTier);
                    const currentPrice = (status === 'authenticated' && currentPlanDetails) ? currentPlanDetails.price : 0;

                    // Logic:
                    // If isCurrent -> "Mevcut Paket" (Disabled)
                    // If plan.price < currentPrice -> "Düşür" (Disabled or handled differently?) -> Let's disable for now
                    // If plan.price > currentPrice -> "Yükselt" (Enabled)

                    const isDowngrade = plan.price < currentPrice;

                    return (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col ${plan.isPopular && !isCurrent ? 'border-2 border-violet-500 shadow-xl' :
                                isCurrent ? 'border-2 border-green-500 shadow-xl' : ''
                                }`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Mevcut Paket
                                    </span>
                                </div>
                            )}
                            {plan.isPopular && !isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        En Popüler
                                    </span>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="text-center">
                                    <div className="text-2xl font-bold mb-2">{plan.displayName}</div>
                                    <div className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                                        ₺{plan.price}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {plan.credits} kredi / ay
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col">
                                <ul className="space-y-3 mb-6 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">{feature.replace('SMS Bildirimleri', '50 SMS Bildirimi')}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full ${isCurrent
                                        ? 'bg-green-600 cursor-default hover:bg-green-600'
                                        : isDowngrade
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200'
                                            : plan.name === 'FREE' && status === 'unauthenticated'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : plan.isPopular
                                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                                                    : ''
                                        }`}
                                    disabled={isCurrent || isDowngrade}
                                    onClick={() => !isCurrent && !isDowngrade && handlePurchase(plan)}
                                >
                                    {isCurrent
                                        ? 'Mevcut Paket'
                                        : isDowngrade
                                            ? 'Paket Düşürülemez'
                                            : (plan.name === 'FREE' && status === 'unauthenticated' ? 'Hemen Başla' : 'Yükselt')}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
                <p>Tüm paketler aylık otomatik yenilenir. İstediğiniz zaman iptal edebilirsiniz.</p>
            </div>

            {selectedPackage && (
                <BankTransferModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    pkg={selectedPackage.name as any} // Cast for now, will fix Modal next
                    amount={selectedPackage.price}
                />
            )}
        </div>
    );
}
