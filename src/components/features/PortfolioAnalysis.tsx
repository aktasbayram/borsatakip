
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

interface Trade {
    id: string;
    symbol: string;
    market: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    date: string;
}

interface Holding {
    symbol: string;
    market: string;
    quantity: number;
    avgCost: number;
    currentPrice: number;
    value: number;
    profit: number; // This is Unrealized + Realized of current portion? Actually in calculateHoldings it is Value - RemainingCost.
}

interface PortfolioAnalysisProps {
    trades: Trade[];
    holdings: Holding[];
    totalValue: number;
}

export function PortfolioAnalysis({ trades, holdings, totalValue }: PortfolioAnalysisProps) {
    const analysis = useMemo(() => {
        let realizedProfit = 0;
        let totalCostBasis = 0; // Cost of currently held assets

        // Calculate Realized Profit using Average Cost logic (matches calculateHoldings)
        // We need to replay trades to track "Realized" explicitly.
        // calculateHoldings logic simply maintains a running 'cost' variable.
        // When selling, it reduces cost by (quantity * sellPrice). 
        // Wait, line 111 in page.tsx: current.cost -= t.quantity * t.price.
        // If I buy 1 @ 10, cost=10. Sell 1 @ 20, cost becomes 10 - 20 = -10. 
        // Holding qty = 0.
        // It is skipped in display. But the "cost" is -10. That means -cost = +10 profit.
        // So we CAN assume the map in calculateHoldings (if we had access to full map including 0 qty) 
        // contains realized profit as negative cost.

        // Let's re-calculate here properly.
        const conversionMap = new Map<string, { qty: number; cost: number; realized: number }>();

        trades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
            const current = conversionMap.get(t.symbol) || { qty: 0, cost: 0, realized: 0 };

            if (t.type === 'BUY') {
                current.qty += t.quantity;
                current.cost += t.quantity * t.price;
            } else {
                // SELL
                // Average Cost Basis of sold items
                const avgCost = current.qty > 0 ? (current.cost / current.qty) : 0;
                const costOfSold = avgCost * t.quantity;

                // Realized = Sell Total - Cost of Sold
                const profit = (t.quantity * t.price) - costOfSold;
                current.realized += profit;

                current.qty -= t.quantity;
                current.cost -= costOfSold;
            }
            conversionMap.set(t.symbol, current);
        });

        // Sum up
        let totalRealized = 0;
        let totalUnrealized = 0;
        let totalInvested = 0;

        conversionMap.forEach((v) => {
            totalRealized += v.realized;
        });

        // Unrealized comes from current holdings
        holdings.forEach(h => {
            // In page.tsx: profit = value - data.cost.
            // Here data.cost is the remaining cost basis. 
            // value is current market value.
            // So h.profit IS the unrealized profit.
            totalUnrealized += h.profit;
            totalInvested += (h.value - h.profit); // Cost basis
        });

        return {
            realized: totalRealized,
            unrealized: totalUnrealized,
            totalInvested: totalInvested,
            totalReturn: totalRealized + totalUnrealized
        };

    }, [trades, holdings]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Toplam Portföy Değeri</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalValue, 'TRY')}</div>
                    {analysis.totalInvested > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                            Maliyet: {formatCurrency(analysis.totalInvested, 'TRY')}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Toplam Kar/Zarar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${analysis.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysis.totalReturn, 'TRY')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Gerçekleşen + Potansiyel
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Gerçekleşen (Realize)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${analysis.realized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysis.realized, 'TRY')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Satışlardan elde edilen
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Potansiyel (Unrealize)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${analysis.unrealized >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysis.unrealized, 'TRY')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Açık pozisyonlardan
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
