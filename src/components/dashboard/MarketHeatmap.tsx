'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import axios from 'axios';

interface HeatmapNode {
    name: string;
    size: number;
    value: number; // For TreeMap weighting
    change: number; // For Coloring
    category: string;
    children?: HeatmapNode[];
    [key: string]: any; // Allow any other props for Treemap compatibility
}

const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, name, change } = props;

    // Filter out nodes that are too small to render text
    const showText = width > 30 && height > 30;

    // Determine color based on change
    // Green for > 0, Red for < 0, Gray for 0
    let fillColor = '#9ca3af'; // gray-400
    if (change > 0) {
        // Linear gradient or steps for green intensity
        if (change > 5) fillColor = '#16a34a'; // green-600
        else if (change > 2) fillColor = '#22c55e'; // green-500
        else fillColor = '#4ade80'; // green-400
    } else if (change < 0) {
        if (change < -5) fillColor = '#dc2626'; // red-600
        else if (change < -2) fillColor = '#ef4444'; // red-500
        else fillColor = '#f87171'; // red-400
    }

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: fillColor,
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {showText ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    fontWeight="bold"
                    dy={-5}
                >
                    {name}
                </text>
            ) : null}
            {showText ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={10}
                    dy={10}
                >
                    %{change?.toFixed(2)}
                </text>
            ) : null}
        </g>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md border text-xs">
                <p className="font-bold">{data.name}</p>
                <p>Fiyat: {Math.abs(data.size).toFixed(2)} ₺</p>
                <p className={data.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                    Değişim: %{data.change?.toFixed(2)}
                </p>
                <p className="text-muted-foreground mt-1">{data.category}</p>
            </div>
        );
    }
    return null;
};

export function MarketHeatmap() {
    const [data, setData] = useState<HeatmapNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/market/heatmap');
                // The API returns a flat list. Recharts Treemap prefers nested data for "groups" (like sectors)
                // But it can also work with flat list if we just process it.
                // However, to make it look nice, let's group by category.

                const flatData = res.data;
                const categories: Record<string, HeatmapNode[]> = {};

                flatData.forEach((item: any) => {
                    if (!categories[item.category]) categories[item.category] = [];
                    categories[item.category].push({
                        ...item,
                        value: Math.abs(item.value) // Treemap needs positive value for size
                    });
                });

                const treeData = Object.keys(categories).map(cat => ({
                    name: cat,
                    category: cat,
                    size: 0,
                    value: 0,
                    change: 0, // category aggregate change (optional)
                    children: categories[cat]
                }));

                setData(treeData);
            } catch (error) {
                console.error('Heatmap fetch failed', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // 1 min update
        return () => clearInterval(interval);
    }, []);

    if (loading && data.length === 0) {
        return (
            <Card className="h-[400px] animate-pulse">
                <CardHeader>
                    <CardTitle>BIST 30 Haritası</CardTitle>
                </CardHeader>
                <CardContent className="h-full bg-muted/20"></CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span>BIST 30 Isı Haritası</span>
                    <span className="text-xs font-normal text-muted-foreground">Anlık Veri</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] p-0 overflow-hidden rounded-b-xl">
                <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                        data={data}
                        dataKey="value"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedContent />}
                    >
                        <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
