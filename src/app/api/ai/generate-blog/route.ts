
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiService } from '@/services/ai/gemini';

export async function POST(request: Request) {
    try {
        console.log('[AI Blog API] Request received');
        const session = await auth();
        console.log('[AI Blog API] Session check:', session?.user ? 'Authenticated' : 'Not authenticated');
        // Check if user is admin (optional, depending on your auth setup)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { keyword } = await request.json();
        console.log('[AI Blog API] Keyword received:', keyword);

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        console.log('[AI Blog API] Initializing GeminiService...');
        const geminiService = new GeminiService();

        console.log('[AI Blog API] Calling generateBlogPost...');
        const blogPost = await geminiService.generateBlogPost(keyword);
        console.log('[AI Blog API] Blog post generated:', blogPost ? 'Success' : 'Failed');

        if (!blogPost) {
            return NextResponse.json({ error: 'Failed to generate blog post' }, { status: 500 });
        }

        // Generate a random high-quality image from Lorem Picsum using the category or keyword
        // Using a random seed based on time to ensure variety
        const imageSeed = Math.floor(Math.random() * 1000);
        const imageUrl = `https://picsum.photos/seed/${imageSeed}/1200/630`;

        console.log('[AI Blog API] Returning response with image URL');

        return NextResponse.json({
            ...blogPost,
            imageUrl
        });

    } catch (error: any) {
        console.error('AI Blog Generation API Error:', error);
        console.error('[AI Blog API] ERROR CAUGHT:', error);
        console.error('[AI Blog API] Error name:', error.name);
        console.error('[AI Blog API] Error message:', error.message);
        console.error('[AI Blog API] Error stack:', error.stack);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
