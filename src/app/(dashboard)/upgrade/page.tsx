'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UpgradePage() {
    const [currentTier, setCurrentTier] = useState<string>('FREE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentTier();
    }, []);

    const fetchCurrentTier = async () => {
        try {
            const res = await axios.get('/api/user/credits');
            setCurrentTier(res.data.tier || 'FREE');
        } catch (error) {
            console.error('Failed to fetch tier:', error);
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            tier: 'FREE',
            name: 'FREE',
            credits: 5,
            price: 0,
            features: [
                '5 AI Analiz / Ay',
                'Temel Özellikler',
                'Fiyat Alarmları',
                'Portföy Takibi'
            ],
        },
        {
            tier: 'BASIC_50',
            name: 'BASIC',
            credits: 50,
            price: 49,
            features: [
                '50 AI Analiz / Ay',
                'Tüm Özellikler',
                'Öncelikli Destek',
                'Gelişmiş Grafikler'
            ],
            popular: true,
        },
        {
            tier: 'PRO_100',
            name: 'PRO',
            credits: 100,
            price: 89,
            features: [
                '100 AI Analiz / Ay',
                'Tüm Özellikler',
                '7/24 Destek',
                'API Erişimi'
            ],
        },
    ];

    if (loading) {
        return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
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
                {plans.map((plan) => {
                    const isCurrent = plan.tier === currentTier;
                    const tierIndex = plans.findIndex(p => p.tier === plan.tier);
                    const currentIndex = plans.findIndex(p => p.tier === currentTier);
                    const isUpgrade = tierIndex > currentIndex;
                    const isDowngrade = tierIndex < currentIndex;

                    return (
                        <Card
                            key={plan.tier}
                            className={`relative ${plan.popular && !isCurrent
                                    ? 'border-2 border-violet-500 shadow-xl'
                                    : isCurrent
                                        ? 'border-2 border-green-500 shadow-xl'
                                        : ''
                                }`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Mevcut Paket
                                    </span>
                                </div>
                            )}
                            {plan.popular && !isCurrent && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        En Popüler
                                    </span>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="text-center">
                                    <div className="text-2xl font-bold mb-2">{plan.name}</div>
                                    <div className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                                        {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {plan.credits} kredi / ay
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <ul className="space-y-3 mb-6">
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
                                            ? 'bg-green-600 cursor-default'
                                            : isDowngrade
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : plan.popular
                                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                                                    : ''
                                        }`}
                                    disabled={isCurrent || isDowngrade}
                                >
                                    {isCurrent ? 'Mevcut Paket' : isDowngrade ? 'Düşürme Yapılamaz' : 'Yükselt'}
                                </Button>

                                {!isCurrent && isUpgrade && (
                                    <p className="text-xs text-center text-gray-500 mt-3">
                                        Ödeme entegrasyonu yakında eklenecek
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
                <p>Tüm paketler aylık otomatik yenilenir. İstediğiniz zaman iptal edebilirsiniz.</p>
            </div>
        </div>
    );
}
