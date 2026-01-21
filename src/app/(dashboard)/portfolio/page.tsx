'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSnackbar } from 'notistack';
import { PortfolioAllocationChart } from '@/components/charts/PortfolioAllocationChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortfolioAnalysis } from '@/components/features/PortfolioAnalysis';

const Trash2 = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
    </svg>
);

const Edit = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const Plus = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M12 5v14M5 12h14" />
    </svg>
);

interface Trade {
    id: string;
    symbol: string;
    market: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    date: string;
}

interface Portfolio {
    id: string;
    name: string;
    trades: Trade[];
}

export default function PortfolioPage() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
    const [holdings, setHoldings] = useState<any[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    // Edit trade modal state
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [editForm, setEditForm] = useState({ quantity: 0, price: 0 });

    const fetchPortfolios = async () => {
        try {
            const res = await axios.get('/api/portfolio');
            setPortfolios(res.data);

            // If no portfolio selected or selected one doesn't exist anymore, select the first one
            if (res.data.length > 0) {
                // If currently selected ID is not in the new list (or empty), select the first one
                if (!selectedPortfolioId || !res.data.find((p: Portfolio) => p.id === selectedPortfolioId)) {
                    setSelectedPortfolioId(res.data[0].id);
                }
            } else {
                setSelectedPortfolioId('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, []);

    // Effect to calculate holdings when selected portfolio changes
    useEffect(() => {
        if (!selectedPortfolioId || portfolios.length === 0) {
            setHoldings([]);
            setTotalValue(0);
            return;
        }

        const currentPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
        if (!currentPortfolio) return;

        calculateHoldings(currentPortfolio);
    }, [selectedPortfolioId, portfolios]);

    const calculateHoldings = async (p: Portfolio) => {
        const map = new Map<string, { qty: number; cost: number; market: string }>();
        p.trades.forEach((t: Trade) => {
            const current = map.get(t.symbol) || { qty: 0, cost: 0, market: t.market };
            if (t.type === 'BUY') {
                current.qty += t.quantity;
                current.cost += t.quantity * t.price;
            } else {
                current.qty -= t.quantity;
                current.cost -= t.quantity * t.price;
            }
            map.set(t.symbol, current);
        });

        const h: any[] = [];
        let total = 0;
        const symbols = Array.from(map.keys());

        // Fetch prices (Optimized: could be batched)
        await Promise.all(symbols.map(async (sym) => {
            const data = map.get(sym)!;
            if (data.qty <= 0) return;

            try {
                const qRes = await axios.get(`/api/market/quote?symbol=${sym}&market=${data.market}`);
                const price = qRes.data.price;
                const value = data.qty * price;
                total += value;
                h.push({
                    symbol: sym,
                    market: data.market,
                    quantity: data.qty,
                    avgCost: data.cost / data.qty,
                    currentPrice: price,
                    value: value,
                    profit: value - data.cost
                });
            } catch (e) {
                // Fallback if price fetch fails
                const value = data.qty * 0; // Or last known price
                h.push({
                    symbol: sym,
                    market: data.market,
                    quantity: data.qty,
                    avgCost: data.cost / data.qty,
                    currentPrice: 0,
                    value: 0,
                    profit: -data.cost
                });
            }
        }));

        setHoldings(h);
        setTotalValue(total);
    };

    const handleCreatePortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const res = await axios.post('/api/portfolio/manage', { name: newPortfolioName });
            setNewPortfolioName('');
            setIsCreateModalOpen(false);
            enqueueSnackbar('Portföy oluşturuldu', { variant: 'success' });

            // Refresh and select new one
            await fetchPortfolios();
            // We need to wait for state update or manually set it. 
            // Since fetchPortfolios sets state, we might rely on effect or just force select it next render.
            // But let's set it here if we can verify it's in the list or just trust it.
            // Actually fetchPortfolios might overwrite if we are not careful, but let's see.
            // Better: update portfolios state manually
            // But simpler is to re-fetch.
        } catch (error) {
            enqueueSnackbar('Oluşturulamadı', { variant: 'error' });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeletePortfolio = async () => {
        if (!selectedPortfolioId) return;
        if (!confirm('Bu portföyü ve içindeki tüm işlemleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            await axios.delete(`/api/portfolio/${selectedPortfolioId}`);
            enqueueSnackbar('Portföy silindi', { variant: 'success' });
            setSelectedPortfolioId(''); // Clear selection to trigger re-select logic
            fetchPortfolios();
        } catch (error) {
            enqueueSnackbar('Silinemedi', { variant: 'error' });
        }
    };

    const handleDeleteTrade = async (tradeId: string) => {
        if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) return;
        try {
            await axios.delete(`/api/portfolio/${tradeId}`);
            enqueueSnackbar('İşlem silindi', { variant: 'success' });
            fetchPortfolios(); // Refresh whole state
        } catch (error) {
            enqueueSnackbar('Silme işlemi başarısız', { variant: 'error' });
        }
    };

    const handleUpdateTrade = async () => {
        if (!editingTrade) return;
        try {
            await axios.put(`/api/portfolio/${editingTrade.id}`, editForm);
            enqueueSnackbar('İşlem güncellendi', { variant: 'success' });
            setEditingTrade(null);
            fetchPortfolios();
        } catch (error) {
            enqueueSnackbar('Güncelleme başarısız', { variant: 'error' });
        }
    };

    const handleEditTrade = (trade: Trade) => {
        setEditingTrade(trade);
        setEditForm({ quantity: trade.quantity, price: trade.price });
    };

    const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);

    if (loading) return <div className="p-6">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold">Portföy</h1>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={selectedPortfolioId}
                        onChange={(e) => setSelectedPortfolioId(e.target.value)}
                        className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 min-w-[200px]"
                    >
                        {portfolios.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="h-10">
                        <Plus className="mr-2" size={16} /> Yeni
                    </Button>

                    {portfolios.length > 0 && portfolios.length > 1 && ( // Only show delete if > 1 or generally allowed? Let's allow deleting even the last one if we want empty state, but usually keep one.
                        <Button
                            variant="danger"
                            size="sm"
                            className="h-10 w-10 px-0"
                            onClick={handleDeletePortfolio}
                            title="Bu Portföyü Sil"
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                    {portfolios.length === 1 && (
                        <Button
                            variant="danger"
                            size="sm"
                            className="h-10 w-10 px-0 opacity-50 cursor-not-allowed"
                            title="Son portföy silinemez"
                            disabled
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            </div>

            {portfolios.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500 mb-4">Henüz bir portföyünüz yok.</p>
                        <Button onClick={() => setIsCreateModalOpen(true)}>İlk Portföyünü Oluştur</Button>
                    </CardContent>
                </Card>
            ) : (
                <>


                    <PortfolioAnalysis
                        trades={selectedPortfolio?.trades || []}
                        holdings={holdings}
                        totalValue={totalValue}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1 border-none shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg">Varlık Dağılımı</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PortfolioAllocationChart holdings={holdings} />
                            </CardContent>
                        </Card>

                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-semibold">Varlık Listesi</h2>
                            {holdings.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center text-gray-500">
                                        Bu portföyde açık pozisyon bulunmuyor.
                                    </CardContent>
                                </Card>
                            ) : (
                                holdings.map(h => (
                                    <Card key={h.symbol} className="hover:shadow-md transition-shadow">
                                        <CardContent className="flex justify-between items-center p-6">
                                            <div>
                                                <div className="font-bold text-lg">{h.symbol}</div>
                                                <div className="text-sm text-gray-500">{h.quantity} Adet • Ort. {h.avgCost.toFixed(2)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{h.value.toLocaleString('tr-TR')} ₺</div>
                                                <div className={`text-sm ${h.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {h.profit >= 0 ? '+' : ''}{h.profit.toLocaleString('tr-TR')} ({h.value ? ((h.profit / h.value) * 100).toFixed(2) : 0}%)
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mt-8">İşlem Geçmişi</h2>
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3">Tarih</th>
                                        <th className="px-6 py-3">Sembol</th>
                                        <th className="px-6 py-3">İşlem</th>
                                        <th className="px-6 py-3">Adet</th>
                                        <th className="px-6 py-3">Fiyat</th>
                                        <th className="px-6 py-3">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPortfolio?.trades.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Henüz işlem geçmişi yok.</td>
                                        </tr>
                                    ) : (
                                        selectedPortfolio?.trades.map(t => (
                                            <tr key={t.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-medium">{t.symbol}</td>
                                                <td className={`px-6 py-4 font-bold ${t.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'BUY' ? 'ALIŞ' : 'SATIŞ'}
                                                </td>
                                                <td className="px-6 py-4">{t.quantity}</td>
                                                <td className="px-6 py-4">{t.price}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditTrade(t)} className="text-blue-600 hover:text-blue-800" title="Düzenle">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteTrade(t.id)} className="text-red-600 hover:text-red-800" title="Sil">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}

            {/* Create Portfolio Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>Yeni Portföy Oluştur</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreatePortfolio} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Portföy Adı</label>
                                    <Input
                                        value={newPortfolioName}
                                        onChange={(e) => setNewPortfolioName(e.target.value)}
                                        placeholder="Örn: Uzun Vade"
                                        required
                                        autoFocus
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>İptal</Button>
                                    <Button type="submit" disabled={createLoading}>
                                        {createLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Trade Modal */}
            {editingTrade && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>İşlemi Düzenle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Sembol</label>
                                    <Input value={editingTrade.symbol} disabled className="bg-gray-100" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Adet</label>
                                    <Input
                                        type="number"
                                        value={editForm.quantity}
                                        onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Fiyat</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end mt-4">
                                    <Button type="button" variant="ghost" onClick={() => setEditingTrade(null)}>İptal</Button>
                                    <Button onClick={handleUpdateTrade}>Güncelle</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
