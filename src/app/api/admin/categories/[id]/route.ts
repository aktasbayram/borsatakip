import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import slugify from 'slugify';

// UPDATE category
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check if slug changed and conflicts
        const newSlug = slugify(name, { lower: true, strict: true });
        const existing = await db.category.findUnique({ where: { slug: newSlug } });

        if (existing && existing.id !== id) {
            return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
        }

        const category = await db.category.update({
            where: { id },
            data: {
                name,
                slug: newSlug,
                description
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Category update error:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE category
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if category has posts
        const category = await db.category.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } }
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        if (category._count.posts > 0) {
            return NextResponse.json({
                error: 'Cannot delete category with associated posts. Please reassign posts first.'
            }, { status: 400 });
        }

        await db.category.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Category delete error:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
