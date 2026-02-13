import { db } from '@/lib/db';
import { MetadataRoute } from 'next';

// In a real scenario, you would fetch these from your API/DB
const POPULAR_SYMBOLS = ['THYAO', 'ASELS', 'GARAN', 'AKBNK', 'EREGL', 'SASA', 'HEKTS', 'SISE', 'KCHOL', 'BIMAS'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://e-borsa.net';

    // 1. Static Routes
    const routes = [
        '',
        '/market/ipo',
        '/market/bulten',
        '/market/tavan-serisi',
        '/market/restricted',
        '/analysis',
        '/news',
        '/blog',
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

    // 3. Dynamic Blog Posts
    const posts = await db.post.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
    });

    const postRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. Dynamic Pages
    const pages = await db.page.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
    });

    const pageRoutes = pages.map((page) => ({
        url: `${baseUrl}/p/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...routes, ...symbolRoutes, ...postRoutes, ...pageRoutes];
}
