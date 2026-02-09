import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, Clock, ArrowLeft, Tag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post: any = await db.post.findUnique({
        where: { slug, isPublished: true },
    });

    if (!post) {
        return {
            title: "Yazı Bulunamadı | BorsaTakip",
            description: "Aradığınız yazı bulunamadı.",
        };
    }

    return {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        keywords: post.keywords?.split(","),
        openGraph: {
            title: post.ogTitle || post.seoTitle || post.title,
            description: post.ogDescription || post.seoDescription || post.excerpt,
            images: post.ogImage || post.imageUrl ? [{ url: post.ogImage || post.imageUrl }] : [],
        },
        alternates: {
            canonical: post.canonicalUrl,
        },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post: any = await db.post.findUnique({
        where: { slug, isPublished: true },
    });

    if (!post) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.seoTitle || post.title,
        "description": post.seoDescription || post.excerpt,
        "image": post.imageUrl ? [post.imageUrl] : [],
        "datePublished": post.publishedAt,
        "dateModified": post.updatedAt,
        "author": [{
            "@type": "Organization",
            "name": "BorsaTakip",
            "url": "https://borsatakip.com"
        }]
    };

    return (
        <div className="max-w-7xl mx-auto space-y-4 pb-20 px-4 md:px-0">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Ultra-Minimal Compact Header */}
            <div className="relative bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 lg:px-5 lg:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                        <nav className="flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-40">
                            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                            <ChevronRight className="w-2 h-2" />
                            <span>{post.category || "Analiz"}</span>
                        </nav>
                        <h1 className="text-lg lg:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5 opacity-50" />
                                {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                            </span>
                            <span className="opacity-20">|</span>
                            <span className="flex items-center gap-1 text-primary/70">
                                <Tag className="w-2.5 h-2.5" />
                                {post.category || "Genel"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-5">
                    <Card className="bg-card border-border/40 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-5 lg:p-8">
                            {post.excerpt && (
                                <div className="mb-6 pb-6 border-b border-border/10">
                                    <p className="text-base lg:text-lg text-muted-foreground font-medium italic leading-relaxed opacity-90">
                                        {post.excerpt}
                                    </p>
                                </div>
                            )}
                            <article className="prose dark:prose-invert prose-slate max-w-none 
                prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-normal
                prose-strong:text-foreground prose-strong:font-bold
                prose-a:text-primary prose-a:font-semibold
                prose-img:rounded-lg prose-img:border prose-img:border-border/40
                prose-hr:border-border/40">
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </article>

                            <div className="mt-16 pt-10 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary/20 transform rotate-3">
                                        <span className="-rotate-3">BT</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Yazar</div>
                                        <div className="text-xl font-bold text-foreground">BorsaTakip Editör</div>
                                    </div>
                                </div>

                                <Button variant="outline" className="rounded-full border-border hover:bg-muted gap-2 font-semibold px-8 h-12">
                                    <Share2 className="w-4 h-4" />
                                    Paylaş
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Related Info */}
                <div className="lg:col-span-4 space-y-8 sticky top-28">
                    <Card className="bg-primary/5 dark:bg-primary/10 border-none p-8 rounded-[2rem] shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-primary">
                            <Clock className="w-5 h-5" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Bilgilendirme</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            Burada paylaşılan tüm içerikler eğitim ve bilgilendirme amaçlıdır. Yatırım tavsiyesi niteliği taşımamaktadır. Kararlarınızı alırken kendi araştırmanızı yapmanız veya bir uzmana danışmanız önerilir.
                        </p>
                    </Card>

                    <div className="relative p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors"></div>
                        <div className="relative space-y-4">
                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">Ücretsiz Premium İçerikler</h3>
                            <p className="text-sm text-slate-400 font-medium">
                                Günlük piyasa analizleri ve portföy stratejileri için bültenimize katılın.
                            </p>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl mt-2 transition-all shadow-lg shadow-primary/25">
                                Abone Ol
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
