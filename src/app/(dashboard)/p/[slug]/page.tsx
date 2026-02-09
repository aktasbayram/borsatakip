import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = await prisma.page.findUnique({
        where: { slug }
    });

    if (!page) return { title: 'Sayfa Bulunamadı' };

    return {
        title: `${page.title} | Borsa Takip`,
        description: page.content.substring(0, 160),
    };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const page = await prisma.page.findUnique({
        where: { slug }
    });

    if (!page || !page.isActive) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* Elegant Header - Premium Design (Matching Restricted Stocks style) */}
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card dark:bg-slate-950 p-5 lg:p-7 border border-border dark:border-slate-800 shadow-2xl group transition-colors duration-300">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[70px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-1000"></div>

                <div className="relative space-y-2.5">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Link href="/" className="hover:text-primary transition-colors">BorsaTakip</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary/60">Kurumsal</span>
                    </div>

                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] border border-primary/20">
                            <FileText className="w-2.5 h-2.5" />
                            Resmi Bilgilendirme
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tighter leading-none text-foreground dark:text-white italic uppercase pr-2">
                            {page.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-2 bg-muted/50 dark:bg-slate-900/50 backdrop-blur-md rounded-lg px-2.5 py-1 border border-border/50">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                                Güncelleme: {new Date(page.updatedAt).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                <Card className="relative bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-[1.75rem] overflow-hidden">
                    <CardContent className="p-6 lg:p-10">
                        <article className="prose dark:prose-invert prose-slate lg:prose-lg max-w-none 
                            prose-headings:font-black prose-headings:tracking-tight prose-headings:italic prose-headings:uppercase
                            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-medium
                            prose-strong:text-foreground prose-strong:font-black
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-2xl prose-img:shadow-xl
                            prose-hr:border-border/50">
                            <div dangerouslySetInnerHTML={{ __html: page.content }} />
                        </article>
                    </CardContent>
                </Card>
            </div>

            {/* Sub-Footer Brand Decoration */}
            <div className="text-center pt-10 select-none opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden h-24">
                <span className="text-[120px] font-black tracking-tighter text-foreground inline-block rotate-1 whitespace-nowrap">
                    BORSATAKIP KURUMSAL
                </span>
            </div>
        </div>
    );
}
