export interface IndicatorData {
    time: string | number;
    value: number;
}

export interface MACDData {
    time: string | number;
    macd: number;
    signal: number;
    histogram: number;
}

export function calculateRSI(prices: number[], times: (string | number)[], period = 14): IndicatorData[] {
    if (prices.length < period + 1) return [];

    const rsiData: IndicatorData[] = [];
    let gains = 0;
    let losses = 0;

    // First RSI Calculation
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Subsequent calculations
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];

        // Smoothing
        if (change > 0) {
            avgGain = (avgGain * (period - 1) + change) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
        }

        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        rsiData.push({ time: times[i], value: rsi });
    }

    return rsiData;
}

export function calculateMACD(
    prices: number[],
    times: (string | number)[],
    shortPeriod = 12,
    longPeriod = 26,
    signalPeriod = 9
): MACDData[] {
    if (prices.length < longPeriod) return [];

    const emaShort = calculateEMA(prices, shortPeriod);
    const emaLong = calculateEMA(prices, longPeriod);

    const macdLine: number[] = [];
    // MACD line starts from the point where long EMA exists
    // The EMA array returned aligns with the END of the prices array
    // We need to align them carefully.

    // We calculate EMA for the whole array, but valid values start after `period-1`

    // Start comparison from where long EMA is valid
    const validStart = longPeriod - 1;

    for (let i = 0; i < prices.length; i++) {
        if (i < validStart) continue;

        const macdVal = emaShort[i] - emaLong[i];
        macdLine.push(macdVal);
    }

    // Signal Line (EMA of MACD Line)
    const signalLine = calculateEMA(macdLine, signalPeriod);

    const macdData: MACDData[] = [];

    // Combine
    for (let i = 0; i < macdLine.length; i++) {
        // Alignment: macdLine[i] corresponds to prices[validStart + i]
        const timeIndex = validStart + i;

        // We need signal line to have enough data
        if (i < signalPeriod - 1) continue;

        const macd = macdLine[i];
        const signal = signalLine[i];
        const histogram = macd - signal;

        macdData.push({
            time: times[timeIndex],
            macd,
            signal,
            histogram
        });
    }

    return macdData;
}

// Helper for scalar return (latest value)
export function calculateSMA(data: number[], period: number): number | null {
    if (data.length < period) return null;
    let sum = 0;
    for (let i = data.length - period; i < data.length; i++) {
        sum += data[i];
    }
    return sum / period;
}

export function calculateEMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const emaArray: number[] = new Array(data.length).fill(0);

    // SMA for the first EMA
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    emaArray[period - 1] = sum / period;

    for (let i = period; i < data.length; i++) {
        emaArray[i] = (data[i] * k) + (emaArray[i - 1] * (1 - k));
    }

    return emaArray;
}
