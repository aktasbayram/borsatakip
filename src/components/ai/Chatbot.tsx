'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Bot, X, Minimize2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Merhaba! Ben finansal asistanınızım. Size nasıl yardımcı olabilirim? 🤖' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text?: string | React.MouseEvent<HTMLButtonElement>) => {
        const content = typeof text === 'string' ? text : inputValue;
        if (!content.trim()) return;

        const userMsg: Message = { role: 'user', content: content };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Fetch watchlist for context if not already loaded or stale
            let context = null;
            try {
                const wRes = await axios.get('/api/watchlist');
                if (wRes.data && wRes.data.length > 0) {
                    // Flatten the structure: We have multiple watchlists, usually the first one matters.
                    // Or merge items from all watchlists.
                    const allItems = wRes.data.flatMap((w: any) => w.items).map((item: any) => ({
                        symbol: item.symbol,
                        price: item.quote?.price,
                        change: item.quote?.changePercent,
                        market: item.market
                    }));
                    context = { watchlist: allItems };
                }
            } catch (err) {
                console.log("Context fetch failed", err);
            }

            const res = await axios.post('/api/ai/chat', {
                messages: [...messages, userMsg],
                context: context
            });

            const aiMsg: Message = { role: 'assistant', content: res.data.content };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen sonra tekrar deneyin.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <Button
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl z-50 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-0 flex items-center justify-center transition-all hover:scale-105"
                onClick={() => setIsOpen(true)}
            >
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white"></div>
                <Bot className="w-8 h-8" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[500px] shadow-2xl z-50 flex flex-col border-blue-500/20 animate-in slide-in-from-bottom-5 fade-in duration-300 dark:bg-gray-900 bg-white">
            <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex flex-row justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <CardTitle className="text-lg">Finans Asistanı</CardTitle>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                        <Minimize2 size={18} />
                    </Button>
                    {/* <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </Button> */}
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 border shadow-sm rounded-bl-none prose dark:prose-invert prose-sm'
                                }`}
                        >
                            {msg.role === 'user' ? (
                                msg.content
                            ) : (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            )}
                        </div>
                    </div>
                ))}

                {messages.length === 1 && (
                    <div className="grid grid-cols-1 gap-2 mt-4">
                        {[
                            "Listemdeki hisseler genel olarak nasıl?",
                            "Takip listemde en çok düşen hangisi?",
                            "Portföyüm riskli mi?"
                        ].map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(q)}
                                className="text-left text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400 font-medium"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-xs text-gray-500 typing-animation">Yazıyor...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-3 border-t bg-white dark:bg-gray-900 rounded-b-lg shrink-0">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Bir soru sorun..."
                        className="flex-1 focus-visible:ring-blue-500"
                        autoFocus
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
