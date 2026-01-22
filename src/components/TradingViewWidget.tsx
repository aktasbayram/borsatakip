'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
    symbol: string;
    market?: string; // Add market prop
    theme?: 'light' | 'dark';
    autosize?: boolean;
    height?: number;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
    symbol,
    market = 'BIST', // Default to BIST if not specified
    theme = 'light',
    autosize = true,
    height = 500
}) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Clear previous widget
        container.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;

        let tvSymbol = symbol;

        // Special handling for common pairs
        if (symbol === 'USDTRY' || symbol === 'USD-TRY') tvSymbol = 'FX:USDTRY';
        else if (symbol === 'EURTRY' || symbol === 'EUR-TRY') tvSymbol = 'FX:EURTRY';
        else if (symbol === 'XU100' || symbol === 'XU100:INDEXBIST') tvSymbol = 'BIST:XU100';
        else if (symbol === 'XU030' || symbol === 'XU030:INDEXBIST') tvSymbol = 'BIST:XU030';
        else if (symbol === 'XAGUSD') tvSymbol = 'TVC:XAGUSD';
        else if (symbol === 'XAUUSD') tvSymbol = 'TVC:XAUUSD';
        else if (symbol === 'BTC-USD' || symbol === 'BTC') tvSymbol = 'BINANCE:BTCUSD';
        else if (!symbol.includes(':')) {
            // Context-aware resolution
            const clean = symbol.replace('.IS', '');

            if (market === 'US') {
                tvSymbol = clean;
            } else {
                tvSymbol = `BIST:${clean}`;
            }
        }

        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": tvSymbol,
            "interval": "D",
            "timezone": "Europe/Istanbul",
            "theme": theme,
            "style": "1",
            "locale": "tr",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "calendar": false,
            "support_host": "https://www.tradingview.com"
        });

        container.current.appendChild(script);

        return () => {
            // Cleanup if necessary
            if (container.current) container.current.innerHTML = '';
        };

    }, [symbol, market, theme, autosize, height]);

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
            <div className="tradingview-widget-copyright">
                <a href="https://tr.tradingview.com/" rel="noopener nofollow" target="_blank">
                    <span className="blue-text">TradingView</span>
                </a> tarafından Piyasa verileri
            </div>
        </div>
    );
};

export default memo(TradingViewWidget);
