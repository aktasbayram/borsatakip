'use client';

import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries, IChartApi, Time } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface IndicatorData {
    time: string | number;
    value: number;
}

interface MACDData {
    time: string | number;
    macd: number;
    signal: number;
    histogram: number;
}

interface PriceChartProps {
    data: {
        time: string | number;
        open: number;
        high: number;
        low: number;
        close: number;
    }[];
    rsiData?: IndicatorData[];
    macdData?: MACDData[];
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
        rsiData,
        macdData,
        height = 500,
        colors: {
            backgroundColor = 'transparent',
            textColor = 'black',
        } = {},
    } = props;

    const mainContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const macdContainerRef = useRef<HTMLDivElement>(null);

    const mainChartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const macdChartRef = useRef<IChartApi | null>(null);

    // Initial Chart Creation
    useEffect(() => {
        if (!mainContainerRef.current) return;

        // -- Main Chart --
        const mainChart = createChart(mainContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
            width: mainContainerRef.current.clientWidth,
            height: height * 0.6, // 60% height for main
            grid: { vertLines: { color: '#e1e1e1' }, horzLines: { color: '#e1e1e1' } },
            timeScale: { visible: true, timeVisible: true, secondsVisible: false },
        });
        mainChartRef.current = mainChart;

        const candlestickSeries = mainChart.addSeries(CandlestickSeries, {
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350'
        });

        // -- RSI Chart --
        let rsiChart: IChartApi | null = null;
        let rsiSeries: any = null;
        if (rsiContainerRef.current && rsiData && rsiData.length > 0) {
            rsiChart = createChart(rsiContainerRef.current, {
                layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
                width: rsiContainerRef.current.clientWidth,
                height: height * 0.2, // 20% height
                grid: { vertLines: { color: '#e1e1e1' }, horzLines: { color: '#e1e1e1' } },
                timeScale: { visible: false }, // Hide stats, share timescale logic
            });
            rsiChartRef.current = rsiChart;
            rsiSeries = rsiChart.addSeries(LineSeries, { color: '#8800CC', lineWidth: 1 });
            // Add RSI levels
            const rsiAbove70 = rsiChart.addSeries(LineSeries, { color: 'rgba(255,0,0,0.5)', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false });
            const rsiBelow30 = rsiChart.addSeries(LineSeries, { color: 'rgba(0,128,0,0.5)', lineWidth: 1, lineStyle: 2, crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false });

            // We need to set data for reference lines, which is tricky in LW charts without data. 
            // We can just use the PriceLine feature or map the data time range.
            // Simplified: Draw lines if we have data time range? Or just rely on visual levels.
            // LW Charts doesn't support "HorizontalLine" primitive easily without series data.
            // We'll skip static lines for now or add them properly with data map later.
        }

        // -- MACD Chart --
        let macdChart: IChartApi | null = null;
        let macdLineSeries: any = null;
        let signalLineSeries: any = null;
        let histogramSeries: any = null;

        if (macdContainerRef.current && macdData && macdData.length > 0) {
            macdChart = createChart(macdContainerRef.current, {
                layout: { background: { type: ColorType.Solid, color: backgroundColor }, textColor },
                width: macdContainerRef.current.clientWidth,
                height: height * 0.2, // 20% height
                grid: { vertLines: { color: '#e1e1e1' }, horzLines: { color: '#e1e1e1' } },
                timeScale: { visible: true },
            });
            macdChartRef.current = macdChart;

            histogramSeries = macdChart.addSeries(HistogramSeries, { color: '#26a69a' });
            macdLineSeries = macdChart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 1 });
            signalLineSeries = macdChart.addSeries(LineSeries, { color: '#FF6D00', lineWidth: 1 });
        }


        // -- Data Processing & Setting --
        const processData = (rawData: any[]) => {
            return rawData.map(d => {
                let time = d.time;
                if (typeof time === 'string') {
                    const parsed = new Date(time).getTime();
                    if (!isNaN(parsed)) time = Math.floor(parsed / 1000) as unknown as Time;
                } else if (typeof time === 'number' && time > 10000000000) {
                    time = Math.floor(time / 1000) as unknown as Time;
                }
                return { ...d, time: time as Time };
            }).sort((a, b) => (a.time as number) - (b.time as number));
        }

        const cleanData = processData(data);
        candlestickSeries.setData(cleanData);

        if (rsiChart && rsiSeries && rsiData) {
            rsiSeries.setData(processData(rsiData));
        }

        if (macdChart && macdData) {
            const cleanMacd = processData(macdData);
            macdLineSeries.setData(cleanMacd.map((d: any) => ({ time: d.time, value: d.macd })));
            signalLineSeries.setData(cleanMacd.map((d: any) => ({ time: d.time, value: d.signal })));
            histogramSeries.setData(cleanMacd.map((d: any) => ({
                time: d.time,
                value: d.histogram,
                color: d.histogram >= 0 ? '#26a69a' : '#ef5350'
            })));
        }

        // -- Synchronization --
        const charts = [mainChart, rsiChart, macdChart].filter(c => c !== null) as IChartApi[];

        const syncHandler = (sourceChart: IChartApi) => (range: any) => {
            if (!range) return;
            charts.forEach(c => {
                if (c !== sourceChart) {
                    const currentRange = c.timeScale().getVisibleLogicalRange();
                    // Avoid infinite loop by checking roughly equality or forcing
                    c.timeScale().setVisibleLogicalRange(range);
                }
            });
        };

        if (charts.length > 1) {
            mainChart.timeScale().subscribeVisibleLogicalRangeChange(syncHandler(mainChart));
            if (rsiChart) rsiChart.timeScale().subscribeVisibleLogicalRangeChange(syncHandler(rsiChart));
            if (macdChart) macdChart.timeScale().subscribeVisibleLogicalRangeChange(syncHandler(macdChart));
        }


        // -- Cleanup --
        const handleResize = () => {
            if (mainContainerRef.current) mainChart.applyOptions({ width: mainContainerRef.current.clientWidth });
            if (rsiContainerRef.current && rsiChart) rsiChart.applyOptions({ width: rsiContainerRef.current.clientWidth });
            if (macdContainerRef.current && macdChart) macdChart.applyOptions({ width: macdContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            mainChart.remove();
            if (rsiChart) rsiChart.remove();
            if (macdChart) macdChart.remove();
        };
    }, [data, rsiData, macdData, height, backgroundColor, textColor]);

    return (
        <div className="flex flex-col w-full relative">
            <div ref={mainContainerRef} className="w-full" />
            {(rsiData && rsiData.length > 0) && <div ref={rsiContainerRef} className="w-full h-[20%] border-t dark:border-gray-700" />}
            {(macdData && macdData.length > 0) && <div ref={macdContainerRef} className="w-full h-[20%] border-t dark:border-gray-700" />}
        </div>
    );
};
