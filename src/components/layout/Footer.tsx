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

    const [socials, setSocials] = useState<any>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pagesRes, settingsRes] = await Promise.all([
                    axios.get('/api/pages'),
                    axios.get('/api/settings/public')
                ]);

                if (pagesRes.data.success) {
                    setPages(pagesRes.data.data);
                }

                if (settingsRes.data) {
                    setSocials({
                        twitter: settingsRes.data.socialX,
                        instagram: settingsRes.data.socialInstagram,
                        facebook: settingsRes.data.socialFacebook,
                        linkedin: settingsRes.data.socialLinkedin
                    });
                }
            } catch (error) {
                console.error("Footer fetch error:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <footer className="bg-card border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-primary">
                            e-borsa
                        </Link>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md">
                            e-borsa ve hisse senedi takibi için gelişmiş analiz ve alarm sistemi.
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
                            © {currentYear} e-borsa. Tüm hakları saklıdır.
                        </p>
                        <div className="flex items-center gap-6">
                            {socials.twitter && (
                                <Link href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </Link>
                            )}
                            {socials.instagram && (
                                <Link href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 014.18 4.184c.636-.247 1.363-.416 2.427-.465C7.674 3.67 8.029 3.656 10.33 3.656c2.301 0 2.656.014 3.738.064 1.258.058 1.944.332 2.385.503.585.227 1.003.498 1.442.937.439.439.71.857.937 1.442.171.441.445 1.127.503 2.385.05 1.082.064 1.437.064 3.738 0 2.301-.014 2.656-.064 3.738-.058 1.258-.332 1.944-.503 2.385-.227.585-.498 1.003-.937 1.442-.439.439-.857.71-1.442.937-.441.171-1.127.445-2.385.503-1.082.05-1.437.064-3.738.064-2.301 0-2.656-.014-3.738-.064-1.258-.058-1.944-.332-2.385-.503-.585-.227-1.003-.498-1.442-.937-.439-.439-.71-.857-.937-1.442-.171-.441-.445-1.127-.503-2.385-.05-1.082-.064-1.437-.064-3.738 0-2.301.014-2.656.064-3.738.058-1.258.332-1.944.503-2.385.227-.585.498-1.003.937-1.442.439-.439.857-.71 1.442-.937.441-.171 1.127-.445 2.385-.503 1.082-.05 1.437-.064 3.738-.064 2.301 0 2.656.014 3.738.064zM12 7.556a4.444 4.444 0 110 8.889 4.444 4.444 0 010-8.889z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            )}
                            {socials.facebook && (
                                <Link href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            )}
                            {socials.linkedin && (
                                <Link href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
