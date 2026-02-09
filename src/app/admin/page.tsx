import Link from 'next/link';
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getStats() {
    const totalUsers = await prisma.user.count();
    const totalPortfolios = await prisma.portfolio.count();
    const totalWatchlists = await prisma.watchlist.count();
    const newUsers = await prisma.user.count({
        where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }
    });

    return { totalUsers, totalPortfolios, totalWatchlists, newUsers };
}

export default async function AdminPage() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Toplam Kullanıcı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Yeni Kullanıcılar (7 Gün)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.newUsers}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Toplam Portföy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalPortfolios}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Takip Listeleri</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalWatchlists}</div>
                        <Link href="/admin/watchlist" className="text-xs text-amber-100/80 hover:text-white underline mt-2 inline-block">
                            Varsayılan Listeyi Yönet &rarr;
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <Card className="hover:shadow-lg transition-shadow border-primary/20 bg-primary/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">🗞️ Günün Bülteni</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Günlük piyasa özetlerini hazırlayın ve editör notu ekleyin.</p>
                        <Link href="/admin/bulten" className="block w-full">
                            <Button className="w-full rounded-2xl shadow-lg ring-1 ring-primary/20">Bülteni Yönet &rarr;</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-yellow-500/20 bg-yellow-500/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">⚠️ Tedbirli Hisseler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Borsa İstanbul VBTS kapsamındaki tedbirli hisse listesini yönetin.</p>
                        <Link href="/admin/restricted" className="block w-full">
                            <Button variant="outline" className="w-full rounded-2xl border-yellow-500/50 hover:bg-yellow-500/10">Tedbirleri Yönet &rarr;</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-indigo-500/20 bg-indigo-500/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">🚀 Halka Arzlar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Halka arz takvimini ve bekleyen başvuruları güncelleyin.</p>
                        <Link href="/admin/ipos" className="block w-full">
                            <Button variant="outline" className="w-full rounded-2xl border-indigo-500/50 hover:bg-indigo-500/10">IPoları Yönet &rarr;</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-slate-500/20 bg-slate-500/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">📄 Sayfalar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Gizlilik politikası, kullanım şartları gibi statik sayfaları yönetin.</p>
                        <Link href="/admin/pages" className="block w-full">
                            <Button variant="outline" className="w-full rounded-2xl border-slate-500/50 hover:bg-slate-500/10">Sayfaları Yönet &rarr;</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-cyan-500/20 bg-cyan-500/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">✍️ Yazılar & Blog</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground font-medium">Sitedeki haberleri, analizleri ve makaleleri yönetin.</p>
                        <Link href="/admin/posts" className="block w-full">
                            <Button variant="outline" className="w-full rounded-2xl border-cyan-500/50 hover:bg-cyan-500/10">Yazıları Yönet &rarr;</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
