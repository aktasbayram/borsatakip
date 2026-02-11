import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { BlogFeedAd } from "@/components/blog/BlogFeedAd";
import { NewsletterWidget } from "@/components/blog/NewsletterWidget";

interface BlogListPageProps {
    searchParams: Promise<{
        category?: string;
        limit?: string;
    }>
}

export default async function BlogListPage(props: BlogListPageProps) {
    const searchParams = await props.searchParams;
    const categorySlug = searchParams.category;
    const limit = parseInt(searchParams.limit || "10");

    // Fetch categories and posts in parallel
    const [categories, allPostsFetched, popularPosts] = await Promise.all([
        db.category.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { posts: true } } }
        }),
        db.post.findMany({
            where: {
                isPublished: true,
                ...(categorySlug ? {
                    catRel: { slug: categorySlug }
                } : {})
            },
            take: limit + 1, // Fetch one extra to see if there are more
            orderBy: { publishedAt: "desc" },
            include: { catRel: true }
        }),
        db.post.findMany({
            where: { isPublished: true },
            take: 4,
            orderBy: { viewCount: "desc" },
            include: { catRel: true }
        })
    ]);

    const hasMore = allPostsFetched.length > limit;
    const posts = allPostsFetched.slice(0, limit);

    // Find current category name for display
    const currentCategory = categories.find((c: any) => c.slug === categorySlug);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0">
            {/* Featured Posts (Vitrine) remains at top */}
            <FeaturedPosts />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* MAIN CONTENT (75%) */}
                <div className="flex-1 space-y-6">
                    {/* Modern Refined Category Navigation */}
                    <div className="relative group/nav">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                            <div className="flex bg-muted/20 backdrop-blur-sm p-1 rounded-2xl border border-border/5 shadow-inner">
                                <Link
                                    href="/blog"
                                    className={`relative px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 z-10 ${!categorySlug
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                                        : 'text-muted-foreground/70 hover:text-foreground hover:bg-white/5'
                                        }`}
                                >
                                    Tümü
                                </Link>

                                <div className="mx-1 w-[1px] h-4 bg-border/20 self-center" />

                                <div className="flex gap-1">
                                    {categories.map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={`/blog?category=${cat.slug}`}
                                            className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${categorySlug === cat.slug
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                                                : 'text-muted-foreground/70 hover:text-foreground hover:bg-white/5'
                                                }`}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Subtle fade effect for overflow on mobile */}
                        <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-foreground/80">Son Yazılar</h2>
                        </div>

                        {posts.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/40">
                                <p className="text-base font-bold">Henüz yazı bulunmuyor.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {posts.map((post: any, index: number) => (
                                    <React.Fragment key={post.id}>
                                        <Link href={`/blog/${post.slug}`} className="group block">
                                            <Card className="bg-card border-none shadow-none hover:bg-accent/5 transition-all duration-300 rounded-xl overflow-hidden flex flex-col md:flex-row gap-5 p-2 md:p-3">
                                                {post.imageUrl && (
                                                    <div className="relative w-full md:w-56 h-40 md:h-36 shrink-0 overflow-hidden rounded-lg">
                                                        <img
                                                            src={post.imageUrl}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex-1 flex flex-col justify-center py-1 space-y-2">
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <Badge variant="outline" className="text-[8px] border-primary/20 text-primary px-1.5 py-0">
                                                            {post.catRel?.name || "Borsa"}
                                                        </Badge>
                                                    </div>

                                                    <h2 className="text-base md:text-xl font-black tracking-tight group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                                        {post.title}
                                                    </h2>

                                                    <p className="text-muted-foreground text-[11px] md:text-xs font-medium line-clamp-2 leading-relaxed opacity-80">
                                                        {post.excerpt || (post.content ? post.content.replace(/[#*`]/g, '').replace(/<[^>]*>/g, '').slice(0, 150) + "..." : "")}
                                                    </p>

                                                    <div className="pt-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                                                            <div className="w-6 h-[2px] bg-primary/30" />
                                                            Devamını Oku
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>

                                        {/* Inject dynamic Ad every 4 posts */}
                                        {(index + 1) % 4 === 0 && (
                                            <BlogFeedAd />
                                        )}
                                    </React.Fragment>
                                ))}

                                {/* Load More Button */}
                                {hasMore && (
                                    <div className="pt-8 pb-4 flex justify-center">
                                        <Link
                                            href={{
                                                pathname: '/blog',
                                                query: {
                                                    ...(categorySlug ? { category: categorySlug } : {}),
                                                    limit: limit + 10
                                                }
                                            }}
                                            scroll={false}
                                            className="group relative px-8 py-3 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/20 border border-primary/10 hover:border-primary active:scale-95"
                                        >
                                            <span className="relative z-10">Daha Fazla Gör</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR (25%) */}
                <div className="w-full lg:w-80 shrink-0 space-y-8">
                    {/* Newsletter Widget */}
                    <NewsletterWidget />

                    {/* Popular Posts Widget */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Popüler Yazılar</h3>
                            <div className="flex-1 h-[1px] bg-border/20" />
                        </div>
                        <div className="space-y-4">
                            {popularPosts.map((post: any, i: number) => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-3 group">
                                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                                        <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        <div className="absolute top-0 left-0 bg-black/60 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center">{i + 1}</div>
                                    </div>
                                    <div className="space-y-1 py-0.5">
                                        <h4 className="text-[11px] font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground/60">
                                            <Clock className="w-2 h-2" />
                                            {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sticky Sidebar Ad - Persistent Visibility */}
                    <div className="sticky top-24 pt-4">
                        <BlogFeedAd
                            location="blog_sidebar_sticky"
                            className="py-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" | "secondary" }) {
    const variants: any = {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground"
    };
    return (
        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}

function LayoutList({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
            <path d="M14 4h7" />
            <path d="M14 9h7" />
            <path d="M14 15h7" />
            <path d="M14 20h7" />
        </svg>
    )
}
