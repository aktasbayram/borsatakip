'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BankTransferModal } from '@/components/payment/BankTransferModal';

export default function PricingPage() {
    const [selectedPackage, setSelectedPackage] = useState<'BASIC' | 'PRO' | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handlePurchase = (pkg: 'BASIC' | 'PRO') => {
        setSelectedPackage(pkg);
        setModalOpen(true);
    };

    return (
        <div className="container mx-auto py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2">Paketler</h1>
                <p className="text-gray-500">İhtiyacınıza uygun paketi seçin ve özelliklerin keyfini çıkarın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Free Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-2xl">Free</CardTitle>
                        <CardDescription>Başlangıç için ideal</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-4xl font-bold mb-4">0 TL <span className="text-lg font-normal text-gray-500">/ay</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center">✅ Günde 5 AI Analizi</li>
                            <li className="flex items-center">✅ Temel Borsa Verileri</li>
                            <li className="flex items-center">✅ Standart Destek</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" disabled>Mevcut Plan</Button>
                    </CardFooter>
                </Card>

                {/* Basic Plan */}
                <Card className="flex flex-col border-blue-500 border-2 relative">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">Popüler</div>
                    <CardHeader>
                        <CardTitle className="text-2xl text-blue-600">Basic</CardTitle>
                        <CardDescription>Aktif yatırımcılar için</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-4xl font-bold mb-4">299 TL <span className="text-lg font-normal text-gray-500">/ay</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center">✅ <strong>Günde 50 AI Analizi</strong> (10x)</li>
                            <li className="flex items-center">✅ Öncelikli Destek</li>
                            <li className="flex items-center">✅ Reklamsız Deneyim</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handlePurchase('BASIC')}>
                            Satın Al
                        </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className="flex flex-col border-purple-500 border-2">
                    <CardHeader>
                        <CardTitle className="text-2xl text-purple-600">Pro</CardTitle>
                        <CardDescription>Profesyoneller için</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="text-4xl font-bold mb-4">599 TL <span className="text-lg font-normal text-gray-500">/ay</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center">✅ <strong>Günde 100 AI Analizi</strong> (20x)</li>
                            <li className="flex items-center">✅ Gelişmiş Analitik Araçları</li>
                            <li className="flex items-center">✅ Erken Erişim Özellikleri</li>
                            <li className="flex items-center">✅ 7/24 VIP Destek</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handlePurchase('PRO')}>
                            Satın Al
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {selectedPackage && (
                <BankTransferModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    pkg={selectedPackage}
                    amount={selectedPackage === 'BASIC' ? 299 : 599}
                />
            )}
        </div>
    );
}
