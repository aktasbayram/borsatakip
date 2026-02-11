import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting (Note: limiting per-instance in Vercel)
const ipMap = new Map<string, { count: number; lastReset: number }>();

// Rate Limit Config: 500 requests per minute (Relaxed for Dev/Testing)
const LIMIT = 500;
const WINDOW_MS = 60 * 1000;

function rateLimit(ip: string) {
    const now = Date.now();
    const record = ipMap.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > WINDOW_MS) {
        record.count = 1;
        record.lastReset = now;
    } else {
        record.count++;
    }

    ipMap.set(ip, record);
    return record.count <= LIMIT;
}

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // 1. Rate Limiting -> ONLY for API routes
    // (Prevents blocking static assets or frontend pages in Dev mode)
    if (request.nextUrl.pathname.startsWith('/api/')) {
        if (!rateLimit(ip)) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 2. Security Headers (Apply to all responses)
    const response = NextResponse.next();
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    // Matcher still captures everything to apply Security Headers,
    // but Rate Limit logic is now scoped inside the function.
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
};
