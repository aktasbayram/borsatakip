'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
    symbol: string;
    theme?: 'light' | 'dark';
    autosize?: boolean;
    height?: number;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
    symbol,
    theme = 'light',
    autosize = true,
    height = 500
}) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Clear previous widget content if any (though React key usually handles this, safety check)
        container.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
        script.type = "text/javascript";
        script.async = true;

        // Enhance symbol for BIST
        // Google uses XU100:INDEXBIST, TradingView uses BIST:XU100
        // Google uses THYAO, TradingView uses BIST:THYAO
        let tvSymbol = symbol;

        if (symbol === 'USDTRY' || symbol === 'USD-TRY') tvSymbol = 'FX:USDTRY';
        else if (symbol === 'EURTRY' || symbol === 'EUR-TRY') tvSymbol = 'FX:EURTRY';
        else if (symbol === 'XU100' || symbol === 'XU100:INDEXBIST') tvSymbol = 'BIST:XU100';
        else if (symbol === 'XU030' || symbol === 'XU030:INDEXBIST') tvSymbol = 'BIST:XU030';
        else if (symbol === 'XAGUSD') tvSymbol = 'TVC:XAGUSD'; // Silver
        else if (symbol === 'XAUUSD') tvSymbol = 'TVC:XAUUSD'; // Gold
        else if (symbol === 'BTC-USD' || symbol === 'BTC') tvSymbol = 'BINANCE:BTCUSD';
        else if (!symbol.includes(':')) {
            // Assume BIST for standard stocks (GARAN, THYAO etc)
            // Check if it already has .IS suffix or similar
            const clean = symbol.replace('.IS', '');
            tvSymbol = `BIST:${clean}`;
        }

        script.innerHTML = JSON.stringify({
            "symbols": [
                [
                    symbol,
                    tvSymbol  // e.g. "BIST:SASA"
                ]
            ],
            "chartOnly": false,
            "width": "100%",
            "height": "100%",
            "locale": "tr",
            "colorTheme": theme,
            "autosize": true,
            "showVolume": false,
            "showMA": false,
            "hideDateRanges": false,
            "hideMarketStatus": false,
            "hideSymbolLogo": false,
            "scalePosition": "right",
            "scaleMode": "Normal",
            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            "fontSize": "10",
            "noTimeScale": false,
            "valuesTracking": "1",
            "changeMode": "price-and-percent",
            "chartType": "candlesticks", // Prefer candles
            "maLineColor": "#2962FF",
            "maLineWidth": 1,
            "maLength": 9,
            "dateTimeFormat": "dd MMM 'yy",
            "lineWidth": 2,
            "lineType": 0,
            "dateRanges": [
                "1d|1",
                "1w|15",
                "1m|30",
                "3m|60",
                "12m|1D",
                "60m|1W",
                "all|1M"
            ]
        });

        container.current.appendChild(script);

        return () => {
            // Cleanup if necessary
            if (container.current) container.current.innerHTML = '';
        };

    }, [symbol, theme, autosize, height]);

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
