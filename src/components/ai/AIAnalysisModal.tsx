
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
        } catch (err) {
            console.error(err);
            setError('Analiz oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <span className="text-2xl">✨</span>
                        {title}
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                            AI Asistan
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Analiz Hazırlanıyor</h3>
                                <p className="text-sm text-gray-500 animate-pulse">
                                    {type === 'STOCK' ? 'Piyasa verileri taranıyor...' : 'Portföy riski hesaplanıyor...'}
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Bir Hata Oluştu</h3>
                            <p className="text-gray-500 mb-6 max-w-sm">{error}</p>
                            <Button onClick={fetchAnalysis} variant="outline" className="min-w-[120px]">
                                Tekrar Dene
                            </Button>
                        </div>
                    ) : (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 pb-2 border-b border-gray-100 dark:border-gray-800" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4 flex items-center gap-2" {...props} />,
                                    h3: ({ node, ...props }) => <div className="mt-6 mb-3 font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 text-lg px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100/50 dark:border-blue-900/50" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-[15px]" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="space-y-2 my-4 pl-4" {...props} />,
                                    li: ({ node, ...props }) => (
                                        <li className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                            <span className="flex-1">{props.children}</span>
                                        </li>
                                    ),
                                    strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 dark:text-gray-100 bg-yellow-50 dark:bg-yellow-900/20 px-1 rounded" {...props} />
                                }}
                            >
                                {analysis || ''}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t flex justify-end">
                    <Button variant="ghost" onClick={onClose}>Kapat</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
