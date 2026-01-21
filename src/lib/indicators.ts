
export interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export function calculateSMA(data: number[], period: number): number | null {
    if (data.length < period) return null;
    const slice = data.slice(data.length - period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

export function calculateEMA(data: number[], period: number): number | null {
    if (data.length < period) return null;
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
    }
    // Consider returning the last EMA, but typically EMA is recursive. 
    // For simple display, we might want the EMA of the *end* of the series.
    // A more robust way often involves seeding with SMA.
    // Let's stick to a simple iterative calculation ending at the last point.

    // Recalculate properly for the whole series to get the final value
    // usually you start with SMA of first 'period' elements
    let initialSma = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema = initialSma;
    for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * k + ema;
    }
    return ema;
}

export function calculateRSI(data: number[], period: number = 14): number | null {
    if (data.length <= period) return null;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const diff = data[i] - data[i - 1];
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i] - data[i - 1];
        let currentGain = 0;
        let currentLoss = 0;
        if (diff >= 0) currentGain = diff;
        else currentLoss = Math.abs(diff);

        avgGain = ((avgGain * (period - 1)) + currentGain) / period;
        avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}
