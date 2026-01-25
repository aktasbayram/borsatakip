
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface AIAnalysisModalProps {
    open: boolean;
    onClose: () => void;
    type: 'STOCK' | 'PORTFOLIO';
    data: any;
    title: string;
}

export function AIAnalysisModal({ open, onClose, type, data, title }: AIAnalysisModalProps) {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && !analysis) {
            fetchAnalysis();
        }
    }, [open]);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/ai/analyze', {
                type,
                data
            });
            setAnalysis(res.data.analysis);
        } catch (err: any) {
            console.error(err);
            let msg = err.response?.data?.error || err.message || 'Analiz oluşturulurken bir hata meydana geldi.';

            // Handle Rate Limit specifically
            if (msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota')) {
                msg = '⚠️ Hız sınırı aşıldı. Lütfen 30 saniye bekleyip tekrar deneyin.';
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b border-border bg-gradient-to-r from-background to-muted/20">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <span className="text-2xl">✨</span>
                        {title}
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                            AI Asistan
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg text-foreground">Analiz Hazırlanıyor</h3>
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    {type === 'STOCK' ? 'Piyasa verileri taranıyor...' : 'Portföy riski hesaplanıyor...'}
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Bir Hata Oluştu</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
                            <Button onClick={fetchAnalysis} variant="outline" className="min-w-[120px]">
                                Tekrar Dene
                            </Button>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none text-foreground">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6 pb-2 border-b border-border" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2" {...props} />,
                                    h3: ({ node, ...props }) => <div className="mt-6 mb-3 font-semibold text-primary flex items-center gap-2 text-lg px-4 py-2 bg-primary/5 rounded-lg border border-primary/10" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-muted-foreground leading-relaxed mb-4 text-[15px]" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="space-y-2 my-4 pl-4" {...props} />,
                                    li: ({ node, ...props }) => (
                                        <li className="flex items-start gap-2 text-muted-foreground">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <span className="flex-1">{props.children}</span>
                                        </li>
                                    ),
                                    strong: ({ node, ...props }) => <strong className="font-semibold text-foreground bg-accent px-1 rounded" {...props} />
                                }}
                            >
                                {analysis || ''}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                    <Button variant="ghost" onClick={onClose}>Kapat</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
