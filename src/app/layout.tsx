import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./notistack-fix.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { getTrackingScripts, getSystemSettings } from "@/lib/settings";
import { HtmlParser } from "@/components/HtmlParser";
import { GoogleAdSenseScript } from "@/components/ads/GoogleAdSenseScript";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings();

  return {
    title: {
      default: settings.seoTitle || `${settings.siteName} - Canlı Borsa ve Hisse Analizi`,
      template: `%s | ${settings.siteName}`
    },
    description: settings.seoDescription || "Borsa İstanbul (BIST) ve ABD borsalarını canlı takip edin. Hisse analizleri, portföy takibi ve anlık fiyat alarmları.",
    keywords: settings.seoKeywords ? settings.seoKeywords.split(',').map(k => k.trim()) : ["Borsa", "BIST", "Hisse Senedi", "Canlı Borsa", "Portfolio", "Analiz", "Teknik Analiz", "Temettü"],
    authors: [{ name: "Bayram Aktaş" }],
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: "https://e-borsa.net",
      title: settings.seoTitle || `${settings.siteName} - Profesyonel Borsa Analiz Platformu`,
      description: settings.seoDescription || "Yapay zeka destekli analizler ve canlı verilerle yatırımlarınızı yönetin.",
      siteName: settings.siteName
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description: settings.seoDescription || "Canlı Borsa ve Hisse Analizi",
      creator: "@eborsa"
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/icon-192x192.png",
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.siteName,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const scripts = await getTrackingScripts();
  const settings = await getSystemSettings();

  return (
    <html lang={settings.defaultLanguage || "tr"} suppressHydrationWarning>
      <head>
        {/* Header Scripts (Google Analytics etc.) */}
        {!!scripts.header && <HtmlParser html={scripts.header} context="head" />}
      </head>
      <body className={inter.className}>
        {/* Body Start Scripts (GTM etc.) */}
        {!!scripts.body && <HtmlParser html={scripts.body} context="body" />}
        <GoogleAdSenseScript />

        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </Providers>

        {/* Footer Scripts (Chat widgets etc.) */}
        {!!scripts.footer && <HtmlParser html={scripts.footer} context="body" />}
      </body>
    </html>
  );
}
