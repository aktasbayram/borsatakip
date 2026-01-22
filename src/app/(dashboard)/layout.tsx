'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeSettingsDialog } from "@/components/ui/theme-settings-dialog";
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
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
        { name: 'Alarmlar', href: '/alerts' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white shadow-sm dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <button
                                type="button"
                                className="md:hidden -ml-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
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
                                <Link href="/" className="text-xl font-bold text-blue-600">
                                    BorsaTakip
                                </Link>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
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
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            {/* Settings Dropdown - Hidden on very small screens if crowded, or keep it */}
                            <div className="relative group hidden sm:block">
                                <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center gap-1">
                                    Ayarlar
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                        <Link
                                            href="/settings/indices"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            📊 Endeks Yönetimi
                                        </Link>
                                        <Link
                                            href="/settings/account"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            🔐 Hesap Ayarları
                                        </Link>
                                        <button
                                            onClick={() => setThemeDialogOpen(true)}
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            🌓 Tema Ayarları
                                        </button>
                                        <Link
                                            href="/settings/notifications"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            🔔 Bildirim Ayarları
                                        </Link>
                                        {session.user?.role === 'ADMIN' && (
                                            <>
                                                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
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
                                className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                title="Hesap Ayarları"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                    {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                <div className="md:hidden fixed inset-0 z-50 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Mobile Menu Panel */}
            <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <Link href="/" className="text-xl font-bold text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                            BorsaTakip
                        </Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
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
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                        <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ayarlar</div>
                        <Link href="/settings/indices" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            📊 Endeks Yönetimi
                        </Link>
                        <Link href="/settings/account" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            🔐 Hesap Ayarları
                        </Link>
                        <button
                            onClick={() => { setThemeDialogOpen(true); setMobileMenuOpen(false); }}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            🌓 Tema Ayarları
                        </button>
                        <Link href="/settings/notifications" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            🔔 Bildirim Ayarları
                        </Link>
                        {session.user?.role === 'ADMIN' && (
                            <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20">
                                ⚡ Admin Panel
                            </Link>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
                        <button
                            onClick={() => signOut({ redirect: false }).then(() => router.push('/login'))}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <ThemeSettingsDialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} />
        </div >
    );
}
