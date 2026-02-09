"use client";

import Link from 'next/link';
import { useLayoutWidth } from '@/hooks/useLayoutWidth';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface PageItem {
    title: string;
    slug: string;
}

export function Footer() {
    const { getContainerClass } = useLayoutWidth();
    const currentYear = new Date().getFullYear();
    const [pages, setPages] = useState<PageItem[]>([]);

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await axios.get('/api/pages');
                if (response.data.success) {
                    setPages(response.data.data);
                }
            } catch (error) {
                console.error("Footer pages fetch error:", error);
            }
        };

        fetchPages();
    }, []);

    return (
        <footer className="bg-card border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-primary">
                            BorsaTakip
                        </Link>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md">
                            Borsa ve hisse senedi takibi için gelişmiş analiz ve alarm sistemi.
                            Portföyünüzü yönetin, piyasa hareketlerini takip edin.
                        </p>
                        <p className="mt-4 text-xs text-muted-foreground">
                            Made with ❤️ by <span className="text-primary font-semibold">Bayram Aktaş</span>
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                            Hızlı Erişim
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Takip Listesi
                                </Link>
                            </li>
                            <li>
                                <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Portföy
                                </Link>
                            </li>
                            <li>
                                <Link href="/analysis" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Analizler
                                </Link>
                            </li>
                            <li>
                                <Link href="/alerts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Alarmlar
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    İletişim
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Settings & Pages Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                            Kurumsal
                        </h3>
                        <ul className="space-y-2">
                            {pages.map((page) => (
                                <li key={page.slug}>
                                    <Link href={`/p/${page.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    İletişim
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-muted-foreground">
                            © {currentYear} BorsaTakip. Tüm hakları saklıdır.
                        </p>
                        <div className="flex items-center gap-6">
                            <a
                                href="https://github.com/aktasbayram"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                title="GitHub"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
