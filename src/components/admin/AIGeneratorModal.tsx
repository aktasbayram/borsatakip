'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AIGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AIGeneratorModal({ isOpen, onClose }: AIGeneratorModalProps) {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const handleGenerate = async () => {
        if (!keyword.trim()) return;

        setLoading(true);
        try {
            const res = await axios.post('/api/ai/generate-blog', { keyword });
            const data = res.data;

            // Save to localStorage to pick up in the editor
            const draftPost = {
                title: data.title,
                content: data.content,
                excerpt: data.excerpt,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                focusKeyword: data.focusKeyword || keyword, // Use generated or the input
                imageUrl: data.imageUrl,
                category: data.category,
                keywords: data.keywords,
                isPublished: false
            };

            // Store in sessionStorage to pass to the /new page
            sessionStorage.setItem('ai_generated_post', JSON.stringify(draftPost));

            enqueueSnackbar('Taslak başarıyla oluşturuldu! Düzenleme ekranına yönlendiriliyorsunuz.', { variant: 'success' });

            // Redirect to new post page
            router.push('/admin/posts/new?source=ai');
            onClose();

        } catch (error: any) {
            console.error('Generation failed - Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            const errorMessage = error.response?.data?.error || error.message || 'Bilinmeyen bir hata oluştu';
            const errorDetails = error.response?.data?.details || '';

            enqueueSnackbar(`Hata: ${errorMessage} ${errorDetails ? `(${errorDetails})` : ''}`, {
                variant: 'error',
                autoHideDuration: 8000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
                <DialogHeader>
                    <div className="mx-auto bg-primary/20 p-3 rounded-full mb-4 w-fit">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">Yapay Zeka ile Yazı Oluştur</DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        Sadece bir konu veya anahtar kelime girin, gerisini yapay zekaya bırakın. SEO uyumlu makaleniz saniyeler içinde hazır olsun.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Konu / Anahtar Kelime</label>
                        <Input
                            placeholder="Örn: Yenilenebilir Enerji, Borsa İstanbul Analizi..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            disabled={loading}
                            className="bg-slate-950/50 border-slate-700 text-white focus:ring-primary h-12"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !keyword.trim()}
                        className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 transition-all text-base gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                İçerik Üretiliyor...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Sihirli Dokunuşla Oluştur
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
