import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default async function BlogListPage() {
    const posts = await db.post.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0">
            {/* Elegant Header - Consistent Style */}
            <div className="relative overflow-hidden rounded-[2rem] bg-card dark:bg-slate-950 p-8 lg:p-12 border border-border dark:border-slate-800 shadow-2xl group transition-colors duration-300">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-1000"></div>

                <div className="relative space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Link href="/" className="hover:text-primary transition-colors">BorsaTakip</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-cyan-500/60">Analiz & Haber</span>
                    </div>

                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em] border border-cyan-500/20">
                            <Clock className="w-3 h-3" />
                            Güncel Analizler
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none text-foreground dark:text-white italic uppercase">
                            Yazılar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 pr-2">& Makaleler</span>
                        </h1>
                    </div>
                    <p className="max-w-xl text-muted-foreground text-sm font-medium leading-relaxed">
                        Piyasalardaki son gelişmeleri, uzman analizlerini ve eğitim içeriklerimizi buradan takip edebilirsiniz.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/50">
                        <LayoutList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Henüz yazı bulunmuyor.</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <Card className="relative h-full bg-card/40 backdrop-blur-xl border border-border/50 hover:border-cyan-500/30 transition-all duration-300 rounded-[2rem] overflow-hidden flex flex-col">
                                {post.imageUrl && (
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4">
                                            <Badge className="bg-cyan-500/90 text-white border-none text-[10px] font-black uppercase tracking-widest">
                                                {post.category || "Analiz"}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <CardContent className="p-6 flex-1 flex flex-col">
                                    {!post.imageUrl && (
                                        <div className="mb-4">
                                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-500 text-[10px] font-black uppercase tracking-widest">
                                                {post.category || "Analiz"}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-3">
                                        <h2 className="text-xl font-black tracking-tight group-hover:text-cyan-500 transition-colors duration-300 leading-tight">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="text-muted-foreground text-sm font-medium line-clamp-3 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                                        </div>
                                        <div className="group-hover:translate-x-1 transition-transform duration-300 text-cyan-500">
                                            Okumaya Devam Et &rarr;
                                        </div>
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

function Badge({ children, className, variant = "default" }: any) {
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
