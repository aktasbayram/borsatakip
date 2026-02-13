import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Wallet, TrendingUp, TrendingDown, Clock, Shield, Bell } from 'lucide-react';
import { UserActions } from '@/app/admin/users/user-actions';


export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/");

    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            portfolios: {
                include: {
                    trades: {
                        orderBy: { date: 'desc' }
                    }
                }
            }
        }
    });

    if (!user) notFound();

    // Calculate aggregations
    const totalPortfolios = user.portfolios.length;
    let totalInvested = 0;

    // Flatten trades for detailed list
    const allTrades = user.portfolios.flatMap(p =>
        p.trades.map(t => ({ ...t, portfolioName: p.name }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate rough stats
    const holdings: Record<string, number> = {};

    allTrades.forEach(t => {
        if (!holdings[t.symbol]) holdings[t.symbol] = 0;
        if (t.type === 'BUY') {
            holdings[t.symbol] += t.quantity;
            totalInvested += t.quantity * t.price;
        } else {
            holdings[t.symbol] -= t.quantity;
            totalInvested -= t.quantity * t.price;
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/admin/users"
                            className="group p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 border border-white/10"
                        >
                            <svg className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-white tracking-tight">{user.name || 'İsimsiz Kullanıcı'}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${user.role === 'ADMIN'
                                    ? 'bg-amber-400/20 border-amber-400/30 text-amber-200'
                                    : 'bg-emerald-400/20 border-emerald-400/30 text-emerald-200'
                                    } backdrop-blur-md`}>
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-blue-100 mt-1 font-medium bg-blue-900/20 px-3 py-1 rounded-lg inline-block backdrop-blur-sm border border-white/5">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[120px]">
                        <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Kayıt Tarihi</span>
                        <span className="text-white font-bold text-lg">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                </div>




                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Toplam Portföy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                                {totalPortfolios}
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Toplam İşlem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                                {allTrades.length}
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tahmini Yatırım</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                                {totalInvested.toLocaleString('tr-TR', { notation: 'compact', maximumFractionDigits: 1 })} ₺
                            </div>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Portfolios List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portföyler</h2>
                    </div>

                    {user.portfolios.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 italic">Henüz portföy oluşturulmamış.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {user.portfolios.map(p => (
                                <div key={p.id} className="group relative bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/50 dark:to-gray-950 p-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 shadow-md hover:shadow-xl transition-all duration-300 hover:border-indigo-500 dark:hover:border-indigo-400 overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent dark:from-indigo-900/20 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex justify-between items-center relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 mt-2 block pl-8">Oluşturulma: {new Date(p.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end bg-gray-50 dark:bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors">
                                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{p.trades.length}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">İşlem</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Holdings Summary */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Varlık Dağılımı</h2>
                    </div>

                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0">
                            {Object.keys(holdings).length === 0 ? (
                                <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-gray-500 italic">İşlem verisi yok.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(holdings).map(([symbol, quantity]) => (
                                        quantity > 0 && (
                                            <div key={symbol} className="flex justify-between items-center bg-white dark:bg-gray-900/80 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs">
                                                        {symbol.substring(0, 2)}
                                                    </div>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{symbol}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{quantity.toLocaleString('tr-TR')}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase">Lot</span>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">İşlem Geçmişi</h2>
                </div>

                <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Tarih</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Sembol</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">İşlem</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Miktar</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Fiyat</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Portföy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {allTrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                            Kayıtlı işlem bulunmamaktadır.
                                        </td>
                                    </tr>
                                ) : (
                                    allTrades.map((trade) => (
                                        <tr key={trade.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(trade.date).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {trade.symbol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border ${trade.type === 'BUY'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                                                    : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30'
                                                    }`}>
                                                    {trade.type === 'BUY' ? (
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                    ) : (
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                                    )}
                                                    {trade.type === 'BUY' ? 'ALIM' : 'SATIM'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                                                {trade.quantity.toLocaleString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                                                {trade.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                                    {trade.portfolioName}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
}
