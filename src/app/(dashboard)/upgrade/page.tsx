'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
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
    const [currentTier, setCurrentTier] = useState<string>('FREE');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<{ name: string, price: number } | null>(null);
    const [plans, setPlans] = useState<Package[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [creditsRes, packagesRes] = await Promise.all([
                    axios.get('/api/user/credits'),
                    axios.get('/api/packages')
                ]);
                setCurrentTier(creditsRes.data.tier || 'FREE');
                setPlans(packagesRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePurchase = (pkg: Package) => {
        // Map dynamic package to payment modal props
        // Note: Modal currently accepts 'BASIC' | 'PRO'. 
        // We might need to make Modal more flexible or map carefully.
        // For now, passing the name directly.
        setSelectedPackage({ name: pkg.name, price: pkg.price });
        setModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
    }

    // Sort plans by price
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    // Identify current plan index for upgrade/downgrade logic
    // Assuming 'FREE' is always the base and not in the DB usually, 
    // but if it IS in DB, we should handle it. 
    // If 'FREE' is not in API, we might want to hardcode it or expect it from DB.
    // Let's assume for now we render what API returns.

    // Safety check: if no plans, at least show empty or free
    if (plans.length === 0) {
        // Fallback or just empty
    }

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
                {/* Always show FREE plan if it exists locally or just render DB plans? 
                    Let's render DB plans. If user wants FREE to show, they should add it to DB 
                    OR we hardcode FREE at start. 
                    Let's hardcode FREE as the first option if it's not in DB.
                */}


                {sortedPlans.map((plan) => {
                    const isCurrent = plan.name === currentTier;

                    // Find current plan details to compare prices
                    // Assuming 'FREE' is price 0 if not found in list (or we handle it)
                    const currentPlanDetails = sortedPlans.find(p => p.name === currentTier);
                    const currentPrice = currentPlanDetails ? currentPlanDetails.price : 0; // Default to free(0) if not found

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
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full ${isCurrent
                                        ? 'bg-green-600 cursor-default hover:bg-green-600'
                                        : isDowngrade
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200'
                                            : plan.isPopular
                                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                                                : ''
                                        }`}
                                    disabled={isCurrent || isDowngrade}
                                    onClick={() => !isCurrent && !isDowngrade && handlePurchase(plan)}
                                >
                                    {isCurrent ? 'Mevcut Paket' : isDowngrade ? 'Paket Düşürülemez' : 'Yükselt'}
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
