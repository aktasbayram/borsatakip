'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { PriceChart } from '@/components/charts/PriceChart';
// import TradingViewWidget from '@/components/TradingViewWidget'; // Use the wrapper
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSnackbar } from 'notistack';
import { Input } from '@/components/ui/input';

import { CreateAlertDialog } from '@/components/alerts/CreateAlertDialog';
import { TechnicalAnalysis } from '@/components/features/TechnicalAnalysis';
import { AIAnalysisModal } from '@/components/ai/AIAnalysisModal';

export default function SymbolPage() {
    const params = useParams();
    const symbol = params.symbol as string;
    const market = params.market as 'BIST' | 'US';
    const { enqueueSnackbar } = useSnackbar();

    const [quote, setQuote] = useState<any>(null);
    const [candles, setCandles] = useState<any[]>([]);
    const [rsiData, setRsiData] = useState<any[]>([]);
    const [macdData, setMacdData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('3M'); // Default to daily view
    const [interval, setInterval] = useState('1d'); // Default to daily interval

    // ... imports ...
    const { calculateRSI, calculateMACD } = require('@/lib/indicators');
    const [kapNews, setKapNews] = useState<any[]>([]);
    const [selectedNews, setSelectedNews] = useState<any>(null);

    // AI Analysis
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Trade Form
    const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [portfolios, setPortfolios] = useState<any[]>([]);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState('');

    // Alert Form
    const [alertTarget, setAlertTarget] = useState(0);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        if (quote) {
            if (price === 0) setPrice(quote.price);
            if (alertTarget === 0) setAlertTarget(quote.price);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quote]);

    // Fetch portfolios
    useEffect(() => {
        const loadPortfolios = async () => {
            try {
                const res = await axios.get('/api/portfolio');
                if (res.data.length > 0) {
                    setPortfolios(res.data);
                    setSelectedPortfolioId(res.data[0].id);
                } else {
                    // Hiç portföy yoksa otomatik "Ana Portföy" oluştur
                    try {
                        const createRes = await axios.post('/api/portfolio/manage', { name: 'Ana Portföy' });
                        const newPortfolio = createRes.data;
                        setPortfolios([newPortfolio]);
                        setSelectedPortfolioId(newPortfolio.id);
                    } catch (createError) {
                        console.error('Failed to create default portfolio', createError);
                    }
                }
            } catch (e) {
                console.error('Failed to load portfolios', e);
            }
        };
        loadPortfolios();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const requests = [
                    axios.get(`/api/market/quote?symbol=${symbol}&market=${market}`),
                    axios.get(`/api/market/candles?symbol=${symbol}&market=${market}&range=${range}&interval=${interval}`)
                ];

                // Fetch KAP news only for BIST stocks
                if (market === 'BIST') {
                    requests.push(axios.get(`/api/market/news?symbol=${symbol}&market=${market}`));
                }

                const responses = await Promise.all(requests);
                setQuote(responses[0].data);

                // Map timestamp to time for PriceChart
                const formattedCandles = responses[1].data.map((c: any) => ({
                    ...c,
                    time: c.timestamp
                }));
                setCandles(formattedCandles);

                // Calculate Indicators
                const closes = formattedCandles.map((c: any) => c.close);
                const times = formattedCandles.map((c: any) => c.time);

                // Need to ensure calculations use the raw close prices
                if (closes.length > 0) {
                    setRsiData(calculateRSI(closes, times));
                    setMacdData(calculateMACD(closes, times));
                } else {
                    setRsiData([]);
                    setMacdData([]);
                }

                // Set KAP news if available
                if (market === 'BIST' && responses[2]) {
                    setKapNews(responses[2].data);
                }
            } catch (error) {
                console.error(error);
                setCandles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const dataInterval = window.setInterval(fetchData, 60000);
        return () => window.clearInterval(dataInterval);
    }, [symbol, market, range, interval]);

    const handleTransaction = async () => {
        try {
            await axios.post('/api/portfolio', {
                portfolioId: selectedPortfolioId,
                symbol,
                market,
                type: tradeType,
                quantity: Number(quantity),
                price: Number(price)
            });
            enqueueSnackbar('İşlem kaydedildi', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Hata oluştu', { variant: 'error' });
        }
    };

    const handleCreateAlert = async () => {
        try {
            await axios.post('/api/alerts', {
                symbol,
                market,
                type: alertTarget > quote.price ? 'PRICE_ABOVE' : 'PRICE_BELOW',
                target: Number(alertTarget)
            });
            enqueueSnackbar('Alarm oluşturuldu', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Hata oluştu', { variant: 'error' });
        }
    };

    // ... (rest of useEffects) ...

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{symbol}</h1>
                    <span className="text-sm text-gray-500">{market}</span>
                </div>
                {quote && (
                    <div className="flex items-center gap-4">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsAIModalOpen(true)}
                            className="hidden md:flex gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20"
                        >
                            <span>✨</span>
                            AI Analiz
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAlertOpen(true)}
                            className="hidden md:flex gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Alarm Kur
                        </Button>
                        {/* Mobile Buttons */}
                        <div className="flex md:hidden gap-2">
                            <Button
                                variant="primary"
                                size="icon"
                                onClick={() => setIsAIModalOpen(true)}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                            >
                                <span>✨</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsAlertOpen(true)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </Button>
                        </div>

                        <div className="text-right">
                            <div className="text-3xl font-bold">{quote.price.toFixed(2)}</div>
                            <div className={quote.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                %{quote.changePercent.toFixed(2)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AIAnalysisModal
                open={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                type="STOCK"
                title={`${symbol} Finansal Analizi`}
                data={{
                    symbol,
                    market,
                    price: quote?.price,
                    change: quote?.changePercent,
                    candles: candles.slice(-30), // Son 30 mum
                    news: kapNews.slice(0, 3) // Son 3 haber
                }}
            />

            <CreateAlertDialog
                open={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                defaultSymbol={symbol}
                defaultMarket={market}
            />

            <div className="h-[600px] w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden relative p-4">
                <div className="flex justify-between items-center mb-2 px-1 gap-2 overflow-x-auto">
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                        {[
                            { label: '15dk', range: '1D', interval: '15m' },
                            { label: '1S', range: '5d', interval: '60m' }, // 1 Saat
                            { label: '4S', range: '1M', interval: '60m' }, // 4 Saat Görünümü (1h candles)
                            { label: 'Gün', range: '3M', interval: '1d' },
                            { label: 'Haf', range: '1Y', interval: '1wk' },
                            { label: 'Ay', range: '5Y', interval: '1mo' },
                        ].map((tf) => (
                            <button
                                key={tf.label}
                                onClick={() => {
                                    setRange(tf.range);
                                    setCandles([]); // Clear for loading state
                                    // We need to fetch with new interval. 
                                    // I'll update the effect dependency to include a new state 'interval'
                                    setInterval(tf.interval);
                                }}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${range === tf.range && interval === tf.interval
                                    ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span>Veriler yükleniyor...</span>
                    </div>
                ) : candles.length > 0 ? (
                    <PriceChart
                        data={candles}
                        height={600}
                        rsiData={rsiData}
                        macdData={macdData}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Bu sembol için grafik verisi bulunamadı.</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Hızlı İşlem (Sanal Portföy)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {portfolios.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    Hedef Portföy Seçimi
                                </label>
                                <select
                                    value={selectedPortfolioId}
                                    onChange={(e) => setSelectedPortfolioId(e.target.value)}
                                    className="w-full h-10 px-3 py-2 rounded-md border-2 border-blue-300 bg-white text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-blue-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-blue-500 font-medium"
                                >
                                    {portfolios.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant={tradeType === 'BUY' ? 'primary' : 'ghost'}
                                onClick={() => setTradeType('BUY')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >AL</Button>
                            <Button
                                variant={tradeType === 'SELL' ? 'primary' : 'ghost'}
                                onClick={() => setTradeType('SELL')}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >SAT</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Adet" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                            <Input label="Fiyat" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                        </div>
                        <Button className="w-full" onClick={handleTransaction}>İşlemi Kaydet</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Fiyat Alarmı Kur</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Hedef Fiyat"
                            type="number"
                            value={alertTarget}
                            onChange={e => setAlertTarget(Number(e.target.value))}
                        />
                        <Button variant="secondary" className="w-full" onClick={handleCreateAlert}>Alarm Ekle</Button>
                    </CardContent>
                </Card>

                <div className="mt-4">
                    <TechnicalAnalysis candles={candles} />
                </div>
            </div>

            {/* KAP News Section - Only for BIST stocks */}
            {market === 'BIST' && kapNews.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>📰</span>
                            KAP Haberleri
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {kapNews.map((news) => (
                                <button
                                    key={news.id}
                                    onClick={() => setSelectedNews(news)}
                                    className="w-full text-left block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm mb-1">{news.title}</h3>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {news.summary}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {new Date(news.date).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <svg
                                            className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* KAP News Modal - Rendered via Portal to avoid z-index/overflow issues */}
            {selectedNews && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
                    onClick={() => setSelectedNews(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex justify-between items-start z-10">
                            <div className="flex-1 pr-4">
                                <h2 className="text-xl font-bold mb-2">{selectedNews.title}</h2>
                                <span className="text-sm text-gray-500">
                                    {selectedNews.date ? new Date(selectedNews.date).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : ''}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                                    {selectedNews.summary}
                                </p>
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <a
                                    href={selectedNews.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
                                >
                                    <span>KAP&apos;ta Görüntüle</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                                <button
                                    onClick={() => setSelectedNews(null)}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
