'use client';

import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BankTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: 'BASIC' | 'PRO';
    amount: number;
}

export function BankTransferModal({ isOpen, onClose, pkg, amount }: BankTransferModalProps) {
    const [senderName, setSenderName] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [step, setStep] = useState<'INFO' | 'FORM'>('INFO');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!senderName) {
            enqueueSnackbar('Lütfen gönderen adını giriniz.', { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/payment/notification', {
                package: pkg,
                amount,
                senderName
            });
            enqueueSnackbar('Ödeme bildiriminiz alındı. Onaylandıktan sonra hesabınız güncellenecektir.', { variant: 'success' });
            onClose();
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Bildirim gönderilirken bir hata oluştu.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{pkg} Paket Ödemesi - {amount} TL</DialogTitle>
                    <DialogDescription>
                        Lütfen ilgili tutarı aşağıdaki IBAN hesabına gönderin ve bildirim formunu doldurun.
                    </DialogDescription>
                </DialogHeader>

                {step === 'INFO' ? (
                    <div className="grid gap-4 py-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-500">Banka:</span>
                                <span>Ziraat Bankası</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-500">Alıcı:</span>
                                <span>Bayram Aktaş</span>
                            </div>
                            <div className="flex flex-col mt-2">
                                <span className="font-semibold text-gray-500 mb-1">IBAN:</span>
                                <code className="bg-white dark:bg-black p-2 rounded border font-mono select-all">
                                    TR12 3456 7890 1234 5678 9012 34
                                </code>
                            </div>
                            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                ⚠️ Açıklama kısmına "Borsa Takip - [Kullanıcı Adınız]" yazmayı unutmayın.
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={() => setStep('FORM')} className="w-full">
                                Ödemeyi Yaptım, Bildir
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="senderName">Gönderen Adı Soyadı</Label>
                            <Input
                                id="senderName"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="Örn: Ahmet Yılmaz"
                                required
                            />
                        </div>
                        <DialogFooter className="flex-col gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setStep('INFO')} disabled={loading}>
                                Geri Dön
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Gönderiliyor...' : 'Bildirim Gönder'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
