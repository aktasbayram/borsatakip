import { FinnhubProvider } from '../finnhub';
import { marketCache } from '../cache';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FinnhubProvider', () => {
    let provider: FinnhubProvider;

    beforeEach(() => {
        provider = new FinnhubProvider();
        marketCache.clear();
        jest.clearAllMocks();
    });

    it('should fetch quote successfully', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                c: 150.0,
                d: 1.5,
                dp: 1.0,
                h: 155.0,
                l: 149.0,
                o: 149.5,
                pc: 148.5,
            },
        });

        const quote = await provider.getQuote('AAPL');

        expect(quote).toEqual({
            symbol: 'AAPL',
            price: 150.0,
            change: 1.5,
            changePercent: 1.0,
            currency: 'USD',
            market: 'US',
            timestamp: expect.any(Number),
        });
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should return cached quote if available', async () => {
        // 1. Mock first call
        mockedAxios.get.mockResolvedValueOnce({
            data: { c: 100, d: 0, dp: 0 },
        });
        await provider.getQuote('AAPL');

        // 2. Clear network mock
        mockedAxios.get.mockClear();

        // 3. Call again - should use cache
        const quote = await provider.getQuote('AAPL');

        expect(quote.price).toBe(100);
        expect(mockedAxios.get).not.toHaveBeenCalled();
    });
});
