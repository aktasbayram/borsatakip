import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, Clock, ArrowLeft, Tag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await db.post.findUnique({
        where: { slug, isPublished: true },
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* Premium Header Layout */}
            <div className="relative overflow-hidden rounded-[2rem] bg-card dark:bg-slate-950 border border-border dark:border-slate-800 shadow-2xl group transition-colors duration-300">
                {post.imageUrl && (
                    <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-105">
                        <img src={post.imageUrl} alt="" className="w-full h-full object-cover blur-2xl scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-b from-card via-card/80 to-card"></div>
                    </div>
                )}

                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-1000"></div>

                <div className="relative p-8 lg:p-12 space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <Link href="/blog" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
                                <ArrowLeft className="w-3 h-3" />
                                Geri Dön
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-cyan-500/60 uppercase">{post.category || "Analiz"}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-muted/50 dark:bg-slate-900/50 backdrop-blur-md rounded-lg px-3 py-1.5 border border-border/50">
                                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                    {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                            <Tag className="w-3 h-3" />
                            {post.category || "Haber & Analiz"}
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-black tracking-tighter leading-[1.1] text-foreground dark:text-white italic uppercase pr-4">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="text-muted-foreground text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-cyan-500/30 pl-6 py-2">
                                {post.excerpt}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content Area */}
                <div className="lg:col-span-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                    <Card className="relative bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-[1.75rem] overflow-hidden">
                        {post.imageUrl && (
                            <div className="w-full aspect-video overflow-hidden border-b border-border/50">
                                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardContent className="p-8 lg:p-12">
                            <article className="prose dark:prose-invert prose-slate lg:prose-lg max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:italic prose-headings:uppercase prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-medium prose-p:text-lg
                prose-strong:text-foreground prose-strong:font-black
                prose-a:text-cyan-500 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-border/50
                prose-hr:border-border/50
                prose-blockquote:border-cyan-500/30 prose-blockquote:bg-cyan-500/5 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl prose-blockquote:font-medium prose-blockquote:italic">
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </article>

                            <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-500/20">
                                        BT
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Yazar</div>
                                        <div className="text-lg font-black italic">BorsaTakip Editör</div>
                                    </div>
                                </div>

                                <Button variant="outline" className="rounded-full border-cyan-500/30 text-cyan-600 hover:bg-cyan-500/10 gap-2 font-bold px-6">
                                    <Share2 className="w-4 h-4" />
                                    Makaleyi Paylaş
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / Related Info */}
                <div className="lg:col-span-4 space-y-6 sticky top-24">
                    <Card className="border-none shadow-xl bg-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 p-6 rounded-[1.75rem]">
                        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Bilgilendirme
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Burada paylaşılan tüm içerikler eğitim ve bilgilendirme amaçlıdır. Yatırım tavsiyesi niteliği taşımamaktadır. Kararlarınızı alırken kendi araştırmanızı yapmanız veya bir uzmana danışmanız önerilir.
                        </p>
                    </Card>

                    <div className="relative group p-px rounded-[1.75rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20"></div>
                        <Card className="relative bg-card/80 backdrop-blur-xl border-none p-6 rounded-[1.7rem]">
                            <h3 className="text-lg font-black italic mb-4">Ücretsiz Premium İçerikler</h3>
                            <p className="text-sm text-muted-foreground font-medium mb-6">
                                Daha fazla teknik ve temel analiz için bültenimize abone olun.
                            </p>
                            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/30 transition-all font-black uppercase tracking-widest text-[10px] rounded-xl h-11">
                                Abone Ol &rarr;
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
