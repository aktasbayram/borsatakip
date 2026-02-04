import { MetadataRoute } from 'next';

// In a real scenario, you would fetch these from your API/DB
const POPULAR_SYMBOLS = ['THYAO', 'ASELS', 'GARAN', 'AKBNK', 'EREGL', 'SASA', 'HEKTS', 'SISE', 'KCHOL', 'BIMAS'];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://borsatakip.app';

    // 1. Static Routes
    const routes = [
        '',
        '/market/ipo',
        '/market/bulten',
        '/market/tavan-serisi',
        '/market/restricted',
        '/analysis',
        '/news',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Symbol Routes (Sample)
    const symbolRoutes = POPULAR_SYMBOLS.map((symbol) => ({
        url: `${baseUrl}/symbol/BIST/${symbol}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
    }));

    return [...routes, ...symbolRoutes];
}
