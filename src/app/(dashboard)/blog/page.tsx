import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogListPageProps {
    searchParams: Promise<{
        category?: string;
    }>
}

export default async function BlogListPage(props: BlogListPageProps) {
    const searchParams = await props.searchParams;
    const categorySlug = searchParams.category;

    // Fetch categories and posts in parallel
    const [categories, posts] = await Promise.all([
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
            orderBy: { publishedAt: "desc" },
            include: { catRel: true }
        })
    ]);

    // Find current category name for display
    const currentCategory = categories.find((c: any) => c.slug === categorySlug);

    return (
        <div className="max-w-7xl mx-auto space-y-4 pb-20 px-4 md:px-0">
            {/* Ultra-Minimal Compact Header */}
            <div className="relative bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 lg:px-5 lg:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                        <nav className="flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-40">
                            <Link href="/" className="hover:text-primary transition-colors">BorsaTakip</Link>
                            <ChevronRight className="w-2 h-2" />
                            <span>Analiz & Haber</span>
                        </nav>
                        <h1 className="text-lg lg:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
                            {currentCategory ? currentCategory.name : 'Yazılar'} <span className="text-primary/70">& Makaleler</span>
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-primary opacity-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Güncel Analizler</span>
                    </div>
                </div>
            </div>

            {/* Compact Category Navigation */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border/10">
                <Link
                    href="/blog"
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!categorySlug ? 'bg-primary text-white shadow-sm' : 'bg-muted/30 hover:bg-muted/60 text-muted-foreground'}`}
                >
                    Tümü
                </Link>
                {categories.map((cat: any) => (
                    <Link
                        key={cat.id}
                        href={`/blog?category=${cat.slug}`}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${categorySlug === cat.slug ? 'bg-primary text-white shadow-sm' : 'bg-muted/30 hover:bg-muted/60 text-muted-foreground'}`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/40">
                        <p className="text-base font-bold">Henüz yazı bulunmuyor.</p>
                    </div>
                ) : (
                    posts.map((post: any) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group h-full">
                            <Card className="h-full bg-card border border-border/40 hover:border-primary/40 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md flex flex-col">
                                {post.imageUrl && (
                                    <div className="relative h-32 w-full overflow-hidden border-b border-border/10">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}

                                <CardContent className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest px-2 py-0.5">
                                            {post.catRel?.name || post.category || "Analiz"}
                                        </Badge>
                                        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                                            {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <h2 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors duration-300 leading-tight line-clamp-2">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="text-muted-foreground text-[11px] font-semibold line-clamp-2 leading-relaxed opacity-70">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-border/10 flex items-center justify-between text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">
                                        Devamını Oku
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
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
