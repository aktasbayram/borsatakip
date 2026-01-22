'use client';

import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface PriceChartProps {
    data: {
        time: string | number;
        open: number;
        high: number;
        low: number;
        close: number;
    }[];
    height?: number;
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const PriceChart = (props: PriceChartProps) => {
    const {
        data,
        height = 400,
        colors: {
            backgroundColor = 'transparent',
            lineColor = '#2962FF',
            textColor = 'black',
            areaTopColor = '#2962FF',
            areaBottomColor = 'rgba(41, 98, 255, 0.28)',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            width: chartContainerRef.current.clientWidth,
            height: height,
            grid: {
                vertLines: { color: 'rgba(197, 203, 206, 0.2)' },
                horzLines: { color: 'rgba(197, 203, 206, 0.2)' },
            },
        });

        // Determine type based on data but here assume Candlestick for simplicity or Line
        // const newSeries = chart.addAreaSeries({ lineColor, topColor: areaTopColor, bottomColor: areaBottomColor });
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350'
        });

        // Process data: ensure timestamps are valid, sorted, and unique
        const processedData = [...data]
            .map(d => {
                let time = d.time;
                // Handle date conversion
                if (typeof time === 'string') {
                    // Try to parse ISO string or other formats
                    const parsed = new Date(time).getTime();
                    if (!isNaN(parsed)) time = parsed;
                }

                // Convert ms to seconds (Lightweight Charts uses seconds for UTCTimestamp)
                // If timestamp is in milliseconds (e.g. > 10 digits), divide by 1000
                if (typeof time === 'number' && time > 10000000000) {
                    time = Math.floor(time / 1000);
                }

                return {
                    ...d,
                    time: time as any
                };
            })
            .filter(d => typeof d.time === 'number' && !isNaN(d.time))
            .sort((a, b) => (a.time as number) - (b.time as number));

        // Remove duplicates by time
        const uniqueData: typeof processedData = [];
        const seenTimes = new Set();

        for (const item of processedData) {
            if (!seenTimes.has(item.time)) {
                seenTimes.add(item.time);
                uniqueData.push(item);
            }
        }

        candlestickSeries.setData(uniqueData);
        chart.timeScale().fitContent();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

    return (
        <div
            ref={chartContainerRef}
            className="w-full relative"
        />
    );
};
