'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Holding {
    symbol: string;
    value: number;
    // other props we don't need for the chart
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

export function PortfolioAllocationChart({ holdings }: { holdings: Holding[] }) {
    if (!holdings || holdings.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/50 rounded-xl border-2 border-dashed border-border">
                Veri yok
            </div>
        );
    }

    const data = holdings
        .map(h => ({ name: h.symbol, value: h.value }))
        .sort((a, b) => b.value - a.value); // Sort by value desc

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover text-popover-foreground p-3 border border-border rounded-lg shadow-lg">
                    <p className="font-bold">{payload[0].name}</p>
                    <p className="text-sm text-primary">
                        {payload[0].value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                    </p>
                    <p className="text-xs text-muted-foreground">
                        %{(payload[0].payload.percent * 100).toFixed(1)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        formatter={(value, entry: any) => (
                            <span className="text-sm text-foreground ml-2">
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
