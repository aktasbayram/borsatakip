'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search as SearchIcon } from 'lucide-react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface SearchResult {
    symbol: string;
    description: string;
    market: 'BIST' | 'US';
}

interface SymbolSearchProps {
    onSelect: (result: SearchResult) => void;
}

export function SymbolSearch({ onSelect }: SymbolSearchProps) {
    const [query, setQuery] = useState('');
    const [market, setMarket] = useState<'BIST' | 'US'>('BIST');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await axios.get(`/api/market/search?q=${query}&market=${market}`);
                setResults(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, market]);

    return (
        <div className="relative w-full max-w-2xl ml-auto">
            {/* Main Search Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-4 border-gray-200/80 dark:border-white/20 shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 group">

                {/* Background Gradient Blob */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-3xl opacity-40 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full blur-3xl opacity-40 transition-opacity duration-500"></div>

                <div className="relative p-2">
                    {/* Market Selector Tabs - Floating Style */}
                    <div className="flex p-1 mb-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-md">
                        <button
                            onClick={() => setMarket('BIST')}
                            className={`flex-1 flex items-center justify-center gap-3 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${market === 'BIST'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className="w-6 h-4 shadow-sm rounded-sm">
                                <rect width="1200" height="800" fill="#E30A17" />
                                <circle cx="444" cy="400" r="240" fill="#ffffff" />
                                <circle cx="474" cy="400" r="192" fill="#E30A17" />
                                <path fill="#ffffff" d="m636 400 134.686 43.141-83.337 114.714 8.794-141.565L795.531 528.32 720 400l75.531-128.32-99.388 111.91L687.35 242.145l83.337 114.714L636 400z" />
                            </svg>
                            BIST
                        </button>
                        <button
                            onClick={() => setMarket('US')}
                            className={`flex-1 flex items-center justify-center gap-3 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${market === 'US'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1235 650" className="w-6 h-4 shadow-sm rounded-sm">
                                <rect width="1235" height="650" fill="#B22234" />
                                <rect width="1235" height="50" y="50" fill="#FFFFFF" />
                                <rect width="1235" height="50" y="150" fill="#FFFFFF" />
                                <rect width="1235" height="50" y="250" fill="#FFFFFF" />
                                <rect width="1235" height="50" y="350" fill="#FFFFFF" />
                                <rect width="1235" height="50" y="450" fill="#FFFFFF" />
                                <rect width="1235" height="50" y="550" fill="#FFFFFF" />
                                <rect width="494" height="350" fill="#3C3B6E" />
                                {/* Simplified Stars for visual scale */}
                                <g fill="#FFFFFF">
                                    <path d="M 24.7 17.5 l 3.8 11.6 h 12.2 l -9.9 7.2 l 3.8 11.6 l -9.9 -7.2 l -9.9 7.2 l 3.8 -11.6 l -9.9 -7.2 h 12.2 Z" transform="translate(10,12)" />
                                    <path d="M 24.7 17.5 l 3.8 11.6 h 12.2 l -9.9 7.2 l 3.8 11.6 l -9.9 -7.2 l -9.9 7.2 l 3.8 -11.6 l -9.9 -7.2 h 12.2 Z" transform="translate(60,12)" />
                                    <path d="M 24.7 17.5 l 3.8 11.6 h 12.2 l -9.9 7.2 l 3.8 11.6 l -9.9 -7.2 l -9.9 7.2 l 3.8 -11.6 l -9.9 -7.2 h 12.2 Z" transform="translate(10,50)" />
                                    <path d="M 24.7 17.5 l 3.8 11.6 h 12.2 l -9.9 7.2 l 3.8 11.6 l -9.9 -7.2 l -9.9 7.2 l 3.8 -11.6 l -9.9 -7.2 h 12.2 Z" transform="translate(60,50)" />
                                </g>
                            </svg>
                            ABD
                        </button>
                    </div>

                    {/* Search Input Area */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                            <SearchIcon className="w-6 h-6" />
                        </div>
                        <Input
                            placeholder={`${market === 'BIST' ? 'BIST' : 'ABD'} hissesi ara (örn: ${market === 'BIST' ? 'THYAO' : 'AAPL'})...`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-14 h-16 text-lg rounded-xl border-transparent bg-gray-50/50 dark:bg-gray-800/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-gray-400"
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Helper Hint */}
            <div className="mt-3 flex justify-center items-center gap-2 opacity-60">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-400"></div>
                <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">
                    Portföyünüze eklemek için arayın
                </p>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-400"></div>
            </div>

            {/* Results Dropdown - Floating & Animated */}
            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-4 px-2">
                    <Card className="overflow-hidden shadow-2xl rounded-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                        <ul className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
                            {results.map((item, index) => (
                                <li
                                    key={`${item.market}-${item.symbol}`}
                                    className="px-5 py-4 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 cursor-pointer flex justify-between items-center group transition-all duration-200 border-b border-gray-100/10 last:border-0"
                                    onClick={() => {
                                        onSelect(item);
                                        setQuery('');
                                        setResults([]);
                                    }}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:scale-110 transition-transform">
                                            {item.symbol.substring(0, 1)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {item.symbol}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{item.description}</span>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-bold tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 transition-colors">
                                        {item.market}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
}
