'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import axios from 'axios';

interface HeatmapNode {
    name: string;
    size?: number;
    value: number; // For TreeMap weighting
    change?: number; // For Coloring
    category: string;
    children?: HeatmapNode[];
    [key: string]: any;
}

const CustomizedContent = (props: any) => {
    const { depth, name, change, width: rawWidth, height: rawHeight, x: rawX, y: rawY } = props;

    // Pixel-snap coordinates and dimensions to eliminate blur/ghosting
    const x = Math.round(rawX);
    const y = Math.round(rawY);
    const width = Math.round(rawWidth);
    const height = Math.round(rawHeight);

    const isPositive = change >= 0;
    const absChange = Math.abs(change || 0);

    // Dynamic color intensity based on change magnitude
    const opacity = Math.min(0.2 + (absChange / 5) * 0.8, 1);
    const showText = width > 45 && height > 30;
    const showPercent = width > 55 && height > 45;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={4}
                ry={4}
                style={{
                    fill: depth === 0 ? 'none' : (isPositive ? `rgba(34, 197, 94, ${opacity})` : `rgba(239, 68, 68, ${opacity})`),
                    stroke: '#fff',
                    strokeWidth: depth === 0 ? 0 : 1,
                    transition: 'fill 0.4s ease'
                }}
                className={depth === 2 ? "cursor-pointer transition-all duration-200 hover:brightness-110" : ""}
            />
            {depth === 2 && showText && (
                <text
                    x={x + width / 2}
                    y={showPercent ? y + height / 2 - 9 : y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={Math.round(Math.max(10, Math.min(width * 0.16, 14)))}
                    fontWeight="600"
                    fontFamily="Arial, sans-serif"
                    style={{
                        pointerEvents: 'none',
                        textShadow: 'none',
                        WebkitFontSmoothing: 'antialiased'
                    }}
                >
                    {name}
                </text>
            )}
            {depth === 2 && showPercent && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={Math.round(Math.max(9, Math.min(width * 0.14, 12)))}
                    fontWeight="400"
                    fontFamily="Arial, sans-serif"
                    style={{
                        pointerEvents: 'none',
                        textShadow: 'none',
                        opacity: 0.95,
                        WebkitFontSmoothing: 'antialiased'
                    }}
                >
                    %{change?.toFixed(2)}
                </text>
            )}
        </g>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isPositive = data.change >= 0;

        return (
            <div
                className="bg-[#18181b] border border-[#3f3f46] p-4 rounded-xl shadow-2xl min-w-[180px]"
                style={{ fontFamily: 'Arial, sans-serif' }}
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-white tracking-tight">{data.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                        {isPositive ? '+' : ''}{data.change?.toFixed(2)}%
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Sektör</span>
                        <span className="font-bold text-zinc-100">{data.category}</span>
                    </div>
                    <div className="h-px bg-zinc-800 w-full" />
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Son Fiyat</span>
                        <span className="font-bold text-zinc-100">{Math.abs(data.size).toFixed(2)} ₺</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const ColorScale = () => (
    <div className="flex items-center justify-center gap-2 mt-6 select-none italic text-foreground/80">
        <span className="text-[10px] font-black uppercase tracking-wider">-5%</span>
        <div className="flex h-2 w-56 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div className="flex-1 bg-[#b91c1c]"></div>
            <div className="flex-1 bg-[#dc2626]"></div>
            <div className="flex-1 bg-[#ef4444]"></div>
            <div className="flex-1 bg-gray-400/50"></div>
            <div className="flex-1 bg-[#4ade80]"></div>
            <div className="flex-1 bg-[#22c55e]"></div>
            <div className="flex-1 bg-[#16a34a]"></div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider">+5%</span>
    </div>
);

export function MarketHeatmap() {
    const [data, setData] = useState<HeatmapNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState<'XU030' | 'XU100'>('XU030');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/market/heatmap?index=${index}`);
                const flatData = res.data;
                const categories: Record<string, HeatmapNode[]> = {};

                flatData.forEach((item: any) => {
                    if (!categories[item.category]) categories[item.category] = [];
                    categories[item.category].push({
                        ...item,
                        value: 100 // Flat weighting for better visibility of names
                    });
                });

                const treeData = Object.keys(categories).map(cat => {
                    const children = categories[cat];
                    const sumValue = children.reduce((acc, curr) => acc + curr.value, 0);
                    return {
                        name: cat,
                        category: cat,
                        value: sumValue,
                        children
                    };
                });

                setData(treeData);
            } catch (error) {
                console.error('Heatmap fetch failed', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [index]);

    const handleIndexChange = (newIndex: string) => {
        if (newIndex === 'XU030' || newIndex === 'XU100') {
            setIndex(newIndex as any);
        }
    };

    if (loading && data.length === 0) {
        return (
            <div className="w-full h-[500px] flex flex-col items-center justify-center space-y-4 bg-muted/5 rounded-3xl border border-dashed border-border">
                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Harita Yükleniyor...</span>
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-none bg-transparent h-full flex flex-col overflow-visible">
            <CardHeader className="pb-8 px-0 flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-4xl font-black tracking-tighter flex items-center gap-3">
                        {index === 'XU030' ? 'BIST 30' : 'BIST 100'}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-primary text-primary-foreground rounded-md shadow-sm">CANLI</span>
                    </CardTitle>
                    <p className="text-sm text-foreground font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] anim-pulse"></span>
                        Piyasa anlık performans dağılımı
                    </p>
                </div>

                <div className="flex bg-muted/50 backdrop-blur-md border border-border/50 rounded-xl p-1 shadow-inner">
                    <button
                        onClick={() => handleIndexChange('XU030')}
                        className={`relative px-6 py-2 rounded-lg text-[10px] font-black transition-all duration-300 uppercase tracking-widest ${index === 'XU030'
                            ? 'bg-background shadow-lg text-primary scale-105'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        BIST 30
                    </button>
                    <button
                        onClick={() => handleIndexChange('XU100')}
                        className={`relative px-6 py-2 rounded-lg text-[10px] font-black transition-all duration-300 uppercase tracking-widest ${index === 'XU100'
                            ? 'bg-background shadow-lg text-primary scale-105'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        BIST 100
                    </button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-visible relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-[2rem] -z-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="h-[600px] w-full bg-card/40 backdrop-blur-sm rounded-3xl border border-border/40 p-1 shadow-2xl overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey="value"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent />}
                            isAnimationActive={false}
                        >
                            <Tooltip content={<CustomTooltip />} cursor={false} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
                <ColorScale />
            </CardContent>
        </Card>
    );
}
