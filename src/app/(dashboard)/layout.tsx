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
import { AuthModal } from '@/components/auth/AuthModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { getContainerClass, getContentClass } = useLayoutWidth();
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

    const openLogin = () => {
        setAuthView('LOGIN');
        setAuthModalOpen(true);
    };

    const openRegister = () => {
        setAuthView('REGISTER');
        setAuthModalOpen(true);
    };

    // Authentication check removed for public access
    // useEffect(() => {
    //     if (status === 'unauthenticated') {
    //         router.push('/login');
    //     }
    // }, [status, router]);

    // Close mobile menu on path change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    if (status === 'loading') { // Or return a skeleton
        return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
    }

    // if (!session) return null; // Removed for public access

    const navItems = session ? [
        { name: 'Portföy', href: '/portfolio' },
        { name: 'Alarmlar', href: '/alerts' },
        { name: 'Analizler', href: '/analysis' },
        { name: 'Haberler', href: '/news' },
    ] : [
        { name: 'Piyasalar', href: '/' },
        { name: 'Portföy', href: '/portfolio' },
        { name: 'Alarmlar', href: '/alerts' },
        { name: 'Haberler', href: '/news' },
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
                            {session ? (
                                <>
                                    <Link href="/upgrade">
                                        <PackageBadge />
                                    </Link>
                                    <NotificationBell />
                                    <button
                                        onClick={() => setThemeDialogOpen(true)}
                                        className="p-2 ml-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors hidden sm:block"
                                        title="Görünüm ve Ayarlar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
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
                                    <Button variant="ghost" size="sm" onClick={() => signOut({ redirect: false }).then(() => router.push('/'))}>
                                        Çıkış
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <NotificationBell />
                                    <button
                                        onClick={() => setThemeDialogOpen(true)}
                                        className="p-2 ml-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors hidden sm:block"
                                        title="Görünüm ve Ayarlar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                    <ThemeToggle />
                                    <div className="flex items-center gap-2 ml-2">
                                        <Button variant="ghost" size="sm" onClick={openLogin}>Giriş Yap</Button>
                                        <Button size="sm" onClick={openRegister}>Kayıt Ol</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav >

            {/* Secondary Navigation (Ticker / Submenu) */}
            <div className="bg-card/50 border-b border-border/50 backdrop-blur-sm sticky top-16 z-30 transition-colors duration-300">
                <div className={`mx-auto ${getContainerClass()} px-4 sm:px-6 lg:px-8`}>
                    <div className="flex items-center h-9 overflow-x-auto no-scrollbar gap-6">
                        <Link
                            href="/market/ipo"
                            className="text-[11px] font-thin tracking-wide text-foreground/80 hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1.5 uppercase"
                        >
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                            Halka Arz
                        </Link>
                        {/* More items can be added here */}
                    </div>
                </div>
            </div>

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
                        {session ? (
                            <>
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
                                    onClick={() => signOut({ redirect: false }).then(() => router.push('/'))}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="border-t border-border my-2"></div>
                                <button
                                    onClick={() => {
                                        setThemeDialogOpen(true);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                                >
                                    🌓 Tema ve Görünüm
                                </button>
                                <button
                                    onClick={() => {
                                        openLogin();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10"
                                >
                                    Giriş Yap
                                </button>
                                <button
                                    onClick={() => {
                                        openRegister();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Kayıt Ol
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <main className={`mx-auto ${getContentClass()} px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300`}>
                {children}
            </main>

            <Footer />

            <ThemeSettingsDialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} />
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialView={authView}
            />
            <Chatbot />
        </div >
    );
}
