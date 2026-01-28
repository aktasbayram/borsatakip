'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CopyIcon, CheckIcon } from 'lucide-react';

interface BankTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: string;
    amount: number;
}

interface BankAccount {
    id: string;
    bankName: string;
    accountHolder: string;
    iban: string;
    logoUrl?: string;
}

export function BankTransferModal({ isOpen, onClose, pkg, amount }: BankTransferModalProps) {
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [senderName, setSenderName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [step, setStep] = useState<'INFO' | 'FORM'>('INFO');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchBanks();
            setStep('INFO');
            setSenderName('');
        }
    }, [isOpen]);

    const fetchBanks = async () => {
        try {
            const res = await axios.get('/api/bank-accounts');
            setBanks(res.data);
            if (res.data.length > 0) setSelectedBankId(res.data[0].id);
        } catch (error) {
            console.error('Failed to fetch banks', error);
        } finally {
            setLoadingBanks(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        enqueueSnackbar('IBAN kopyalandı', { variant: 'success' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!senderName) {
            enqueueSnackbar('Lütfen gönderen adını giriniz.', { variant: 'error' });
            return;
        }

        setSubmitting(true);
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
            setSubmitting(false);
        }
    };

    const selectedBank = banks.find(b => b.id === selectedBankId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card text-card-foreground">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white text-center">
                    <DialogTitle className="text-2xl font-bold mb-1">
                        {pkg} Paket
                    </DialogTitle>
                    <div className="text-3xl font-extrabold mt-2">
                        ₺{amount}
                    </div>
                    <DialogDescription className="text-violet-100 mt-2">
                        Havale/EFT ile ödeme yapın
                    </DialogDescription>
                </div>

                <div className="p-6">
                    {loadingBanks ? (
                        <div className="flex justify-center py-8">Yükleniyor...</div>
                    ) : banks.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Aktif banka hesabı bulunamadı.</div>
                    ) : step === 'INFO' ? (
                        <div className="space-y-6">
                            <Tabs value={selectedBankId} onValueChange={setSelectedBankId} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4 h-auto p-1 bg-muted/50">
                                    {banks.map(bank => (
                                        <TabsTrigger
                                            key={bank.id}
                                            value={bank.id}
                                            className="text-xs sm:text-sm py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                        >
                                            {bank.bankName}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {selectedBank && (
                                    <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground font-medium">Alıcı Adı:</span>
                                            <span className="font-semibold">{selectedBank.accountHolder}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-muted-foreground text-sm font-medium">IBAN:</span>
                                            <div
                                                className="relative group cursor-pointer"
                                                onClick={() => handleCopy(selectedBank.iban)}
                                            >
                                                <code className="block w-full bg-background border border-input rounded-lg p-3 font-mono text-sm sm:text-base text-center transition-colors group-hover:border-primary">
                                                    {selectedBank.iban}
                                                </code>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary">
                                                    {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 text-xs text-yellow-800 dark:text-yellow-400 flex gap-2">
                                            <span>⚠️</span>
                                            <span>
                                                Açıklama kısmına <strong>"Borsa Takip - [Kullanıcı Adınız]"</strong> yazmayı unutmayın.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Tabs>

                            <Button onClick={() => setStep('FORM')} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-6">
                                Ödemeyi Yaptım, Bildir
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="senderName">Gönderen Adı Soyadı</Label>
                                <Input
                                    id="senderName"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    placeholder="Banka hesabındaki isim"
                                    required
                                    className="py-6 text-lg"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Ödemeyi kontrol edebilmemiz için gönderen ismini doğru girmelisiniz.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <Button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                                    {submitting ? 'Gönderiliyor...' : '✅ Bildirimi Tamamla'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => setStep('INFO')} disabled={submitting} className="w-full">
                                    Geri Dön
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
