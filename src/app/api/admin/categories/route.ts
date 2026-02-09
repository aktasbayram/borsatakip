import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import slugify from 'slugify';

// GET all categories
export async function GET() {
    try {
        const categories = await db.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Categories fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// CREATE new category
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const slug = slugify(name, { lower: true, strict: true });

        // Check if slug exists
        const existing = await db.category.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
        }

        const category = await db.category.create({
            data: {
                name,
                slug,
                description
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Category create error:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
