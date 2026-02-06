import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShieldAlert, Lock, Sparkles, TrendingUp, AlertCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function EditorChoicesPage() {
    const session = await auth();
    let isAllowed = false;

    let currentTier = 'FREE';

    if (session?.user?.id) {
        // Fetch fresh user data to handle immediate package changes without re-login
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { subscriptionTier: true }
        });

        if (user?.subscriptionTier) {
            currentTier = user.subscriptionTier;
            // @ts-ignore
            const userPackage = await db.package.findFirst({
                where: { name: user.subscriptionTier }
            });
            // @ts-ignore
            isAllowed = userPackage?.canSeeEditorChoices || false;
        }
    }

    let choices: any[] = [];
    if (isAllowed) {
        try {
            // @ts-ignore
            choices = await db.editorChoice.findMany({
                where: { isPublished: true },
                orderBy: { publishedAt: 'desc' },
                take: 20
            });
        } catch (error) {
            console.error("Failed to fetch editor choices:", error);
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                            Editörün Seçimleri
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Piyasa uzmanlarımızın detaylı teknik ve temel analizleriyle öne çıkan hisseler.
                    </p>
                </div>
                {!isAllowed && (
                    <Link href="/upgrade">
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8">
                            Premium'a Geç
                        </Button>
                    </Link>
                )}
            </div>

            {/* Access Control section */}
            {!session?.user ? (
                // Guest / Not Logged In
                <div className="relative rounded-3xl overflow-hidden border border-border bg-card min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="absolute inset-0 bg-grid-zinc-900/5 dark:bg-grid-white/5 [mask-image:radial-gradient(white,transparent)]" />
                    <div className="relative z-10 space-y-4 max-w-md">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">Önce Giriş Yapmalısın</h2>
                        <p className="text-muted-foreground">
                            Editörün Seçimleri ve diğer tüm analizleri görebilmek için üye olmanız veya giriş yapmanız gerekmektedir.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Link href="/register" className="flex-1">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6 rounded-xl">
                                    Hemen Kayıt Ol
                                </Button>
                            </Link>
                            <Link href="/login" className="flex-1">
                                <Button variant="outline" className="w-full text-lg py-6 rounded-xl">
                                    Giriş Yap
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : !isAllowed ? (
                // Logged In but No Access
                <div className="relative rounded-3xl overflow-hidden border border-border bg-card min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="absolute inset-0 bg-grid-zinc-900/5 dark:bg-grid-white/5 [mask-image:radial-gradient(white,transparent)]" />
                    <div className="relative z-10 space-y-4 max-w-md">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <TrendingUp className="w-10 h-10 text-amber-500" />
                        </div>

                        {currentTier === 'FREE' ? (
                            <>
                                <h2 className="text-3xl font-bold font-black">Bu İçerik Sadece Premium Üyelere Özeldir</h2>
                                <p className="text-muted-foreground">
                                    Anlaşılan henüz FREE pakettesiniz. Editörün Seçimleri, derinlemesine analizler ve özel hisse yorumlarını içerir.
                                    Piyasa fırsatlarını kaçırmamak için üyeliğinizi hemen yükseltin.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold font-black">Paket Yükseltmeniz Gerekiyor</h2>
                                <p className="text-muted-foreground">
                                    Mevcut paketiniz (<span className="font-bold text-foreground">{currentTier}</span>) bu içeriğe erişim izni vermiyor.
                                    Editörün seçimlerini görüntülemek için paketinizi yükseltmeniz gerekmektedir.
                                </p>
                            </>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Link href="/upgrade" className="flex-1">
                                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-lg py-6 rounded-xl border-none font-bold">
                                    {currentTier === 'FREE' ? "Hemen Yükselt" : "Paketi Yükselt"}
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="w-full text-lg py-6 rounded-xl">
                                    Geri Dön
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {choices.length === 0 ? (
                        <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-border">
                            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground italic">Henüz güncel bir analiz bulunmuyor. Takipte kalın.</p>
                        </div>
                    ) : (
                        choices.map((choice) => (
                            <div key={choice.id} className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col">
                                {/* Card Header */}
                                <div className="p-6 pb-0 flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-amber-500 text-white font-bold h-7 px-3 text-lg rounded-lg">
                                                {choice.symbol}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {format(new Date(choice.publishedAt), 'd MMMM yyyy', { locale: tr })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold group-hover:text-amber-500 transition-colors pt-2">
                                            {choice.title}
                                        </h3>
                                    </div>
                                    {choice.targetPrice && (
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Hedef Fiyat</p>
                                            <p className="text-2xl font-black text-emerald-500">₺{choice.targetPrice.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4 flex-grow">
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                                        {choice.content}
                                    </p>

                                    {choice.chartUrl && (
                                        <div className="relative mt-4 group/chart overflow-hidden rounded-2xl border border-border bg-zinc-50 dark:bg-zinc-900/50">
                                            {/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(choice.chartUrl) ? (
                                                <div className="aspect-video relative overflow-hidden">
                                                    <img
                                                        src={choice.chartUrl}
                                                        alt={`${choice.symbol} Analiz Grafiği`}
                                                        className="w-full h-full object-cover group-hover/chart:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/chart:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                        <a
                                                            href={choice.chartUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transform translate-y-4 group-hover/chart:translate-y-0 transition-transform"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Tam Ekran Gör
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-amber-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">Analiz Grafiği</p>
                                                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{choice.chartUrl}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={choice.chartUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Grafiği Aç
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                        {choice.stopLoss && (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-zinc-500">Stop Loss</p>
                                                <p className="font-bold text-red-500">₺{choice.stopLoss.toFixed(2)}</p>
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-zinc-500">Görünüm</p>
                                            <Badge variant="outline" className="text-emerald-500 bg-emerald-500/5 border-emerald-500/20">
                                                POZİTİF
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Sections Link / Expansion (Simplified for now) */}
                                <div className="p-6 pt-0">
                                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 space-y-4">
                                        {choice.technicalReview && (
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    Teknik Analiz
                                                </h4>
                                                <p className="text-xs text-muted-foreground italic">{choice.technicalReview}</p>
                                            </div>
                                        )}
                                        {choice.fundamentalReview && (
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Temel Analiz
                                                </h4>
                                                <p className="text-xs text-muted-foreground italic">{choice.fundamentalReview}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="px-6 py-4 bg-zinc-100 dark:bg-zinc-950/50 mt-auto">
                                    <p className="text-[10px] text-zinc-400 font-medium">
                                        Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir. Yatırım Tavsiyesi Değildir (YTD).
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Legal Warning Footer */}
            <div className="mt-12 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <div className="space-y-1">
                    <h4 className="font-bold text-red-500">Yasal Uyarı</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Sayfada paylaşılan tüm içerik editörün kişisel görüşlerinden ibarettir. Hiçbir paylaşım "Al", "Tut" veya "Sat" tavsiyesi amacı gütmez.
                        Borsada işlem yapmak yüksek risk içerir ve sermaye kaybına neden olabilir. Yatırım kararlarınızı kendi risk profilinize göre vermelisiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}
