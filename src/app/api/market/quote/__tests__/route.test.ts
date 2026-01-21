/**
 * @jest-environment node
 */
import { GET } from '../route';
import { MarketService } from '@/services/market';

// Mock the service
jest.mock('@/services/market', () => ({
    MarketService: {
        getQuote: jest.fn(),
    },
}));

describe('Quote API', () => {
    it('should return 400 if parameters missing', async () => {
        const req = new Request('http://localhost/api/market/quote');
        const res = await GET(req);
        expect(res.status).toBe(400);
    });

    it('should return quote data', async () => {
        (MarketService.getQuote as jest.Mock).mockResolvedValueOnce({
            symbol: 'THYAO',
            price: 300,
        });

        const req = new Request('http://localhost/api/market/quote?symbol=THYAO&market=BIST');
        const res = await GET(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.symbol).toBe('THYAO');
        expect(data.price).toBe(300);
    });
});
