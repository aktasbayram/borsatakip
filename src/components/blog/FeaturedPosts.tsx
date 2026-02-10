'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedPost {
    id: string;
    title: string;
    slug: string;
    imageUrl: string;
    category?: string;
    categoryId?: string;
    catRel?: {
        name: string;
        slug: string;
    };
    publishedAt: string;
}

export function FeaturedPosts() {
    const [posts, setPosts] = useState<FeaturedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await axios.get('/api/blog/featured');
                setPosts(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch featured posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[300px] mb-6">
                <Skeleton className="md:col-span-2 md:row-span-2 rounded-lg" />
                <Skeleton className="rounded-lg" />
                <Skeleton className="rounded-lg" />
                <Skeleton className="rounded-lg" />
                <Skeleton className="rounded-lg" />
            </div>
        );
    }

    if (posts.length === 0) return null;

    const mainPost = posts[0];
    const sidePosts = posts.slice(1, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-2 h-auto md:h-[300px] mb-6">
            {/* Main Featured Post */}
            <Link
                href={`/blog/${mainPost.slug}`}
                className="group relative md:col-span-2 md:row-span-2 overflow-hidden rounded-lg bg-gray-950 border border-white/5 shadow-lg transition-all duration-300"
            >
                <img
                    src={mainPost.imageUrl || '/images/placeholder.jpg'}
                    alt={mainPost.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 lg:p-5 space-y-1">
                    <Badge className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-1.5 py-0 font-bold tracking-wider text-[7px] uppercase">
                        {mainPost.catRel?.name || mainPost.category || 'Bilgi'}
                    </Badge>
                    <h2 className="text-base lg:text-xl font-black text-white leading-tight tracking-tight">
                        {mainPost.title}
                    </h2>
                </div>
            </Link>

            {/* Side Grid */}
            {sidePosts.map((post) => (
                <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group relative overflow-hidden rounded-lg bg-gray-950 border border-white/5 transition-all duration-300 min-h-[140px]"
                >
                    <img
                        src={post.imageUrl || '/images/placeholder.jpg'}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3 space-y-1">
                        <Badge className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-1 py-0 text-[6px] font-bold uppercase tracking-widest leading-none">
                            {post.catRel?.name || post.category || 'Bilgi'}
                        </Badge>
                        <h3 className="text-[10px] lg:text-[11px] font-bold text-white line-clamp-2 leading-tight tracking-tight">
                            {post.title}
                        </h3>
                    </div>
                </Link>
            ))}
        </div>
    );
}
