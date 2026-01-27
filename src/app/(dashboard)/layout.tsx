'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeSettingsDialog } from "@/components/ui/theme-settings-dialog";
import { PackageBadge } from '@/components/subscription/PackageBadge';
import { useLayoutWidth } from '@/hooks/useLayoutWidth';
import { Footer } from '@/components/layout/Footer';
import { useEffect, useState } from 'react';
import { Chatbot } from '@/components/ai/Chatbot';
import { NotificationBell } from '@/components/layout/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { getContainerClass, getContentClass } = useLayoutWidth();
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Close mobile menu on path change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    if (status === 'loading') { // Or return a skeleton
        return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
    }

    if (!session) return null; // Will redirect

    const navItems = [
        { name: 'Takip Listesi', href: '/' },
        { name: 'Portföy', href: '/portfolio' },
        { name: 'Analizler', href: '/analysis' },
        { name: 'Haberler', href: '/news' },
        { name: 'Alarmlar', href: '/alerts' },
    ];

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-40 transition-colors duration-300">
                <div className={`mx-auto ${getContainerClass()} px-4 sm:px-6 lg:px-8`}>
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <button
                                type="button"
                                className="md:hidden -ml-2 p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent focus:outline-none transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>

                            <div className="flex flex-col ml-2 md:ml-0">
                                <Link href="/" className="text-xl font-bold text-primary">
                                    BorsaTakip
                                </Link>
                                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                                    By Bayram Aktaş
                                </span>
                            </div>
                            <div className="hidden md:flex ml-10 items-baseline space-x-4">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/upgrade">
                                <PackageBadge />
                            </Link>
                            <NotificationBell />
                            <ThemeToggle />
                            {/* Settings Dropdown - Hidden on very small screens if crowded, or keep it */}
                            <div className="relative group hidden sm:block">
                                <button className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                                    Ayarlar
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-card rounded-lg shadow-lg border border-border py-2">
                                        <Link
                                            href="/settings/indices"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            📊 Endeks Yönetimi
                                        </Link>
                                        <Link
                                            href="/settings/account"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            🔐 Hesap Ayarları
                                        </Link>
                                        <button
                                            onClick={() => setThemeDialogOpen(true)}
                                            className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            🌓 Tema ve Görünüm
                                        </button>
                                        <Link
                                            href="/settings/dashboard"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            🎨 Dashboard Görünümü
                                        </Link>
                                        <Link
                                            href="/settings/notifications"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            🔔 Bildirim Ayarları
                                        </Link>
                                        {session.user?.role === 'ADMIN' && (
                                            <>
                                                <div className="border-t border-border my-1"></div>
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                                >
                                                    ⚡ Admin Panel
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/settings/account"
                                className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent transition-colors group"
                                title="Hesap Ayarları"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                    {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-muted-foreground font-medium group-hover:text-primary transition-colors">
                                    {session.user?.name || session.user?.email}
                                </span>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => signOut({ redirect: false }).then(() => router.push('/login'))}>
                                Çıkış
                            </Button>
                        </div>
                    </div>
                </div>
            </nav >

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Mobile Menu Panel */}
            <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <Link href="/" className="text-xl font-bold text-primary" onClick={() => setMobileMenuOpen(false)}>
                            BorsaTakip
                        </Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="px-2 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="border-t border-border my-2"></div>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ayarlar</div>
                        <Link href="/settings/indices" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground">
                            📊 Endeks Yönetimi
                        </Link>
                        <Link href="/settings/account" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground">
                            🔐 Hesap Ayarları
                        </Link>
                        <button
                            onClick={() => {
                                setThemeDialogOpen(true);
                                setMobileMenuOpen(false);
                            }}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                        >
                            🌓 Tema ve Görünüm
                        </button>
                        <Link href="/settings/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground">
                            🎨 Dashboard Görünümü
                        </Link>
                        <Link href="/settings/notifications" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground">
                            🔔 Bildirim Ayarları
                        </Link>
                        <div className="border-t border-border my-2"></div>
                        <Link href="/upgrade" className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
                            ⚡ Pro'ya Yükselt
                        </Link>
                        {session.user?.role === 'ADMIN' && (
                            <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20">
                                ⚡ Admin Panel
                            </Link>
                        )}
                        <div className="border-t border-border my-2"></div>
                        <button
                            onClick={() => signOut({ redirect: false }).then(() => router.push('/login'))}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>

            <main className={`mx-auto ${getContentClass()} px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300`}>
                {children}
            </main>

            <Footer />

            <ThemeSettingsDialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} />
            <Chatbot />
        </div >
    );
}
