import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { getTrackingScripts } from "@/lib/settings";
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

export const metadata: Metadata = {
  title: {
    default: "Borsa Takip - Canlı Borsa ve Hisse Analizi",
    template: "%s | Borsa Takip"
  },
  description: "Borsa İstanbul (BIST) ve ABD borsalarını canlı takip edin. Hisse analizleri, portföy takibi ve anlık fiyat alarmları.",
  keywords: ["Borsa", "BIST", "Hisse Senedi", "Canlı Borsa", "Portfolio", "Analiz", "Teknik Analiz", "Temettü"],
  authors: [{ name: "Bayram Aktaş" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://borsatakip.app",
    title: "Borsa Takip - Profesyonel Borsa Analiz Platformu",
    description: "Yapay zeka destekli analizler ve canlı verilerle yatırımlarınızı yönetin.",
    siteName: "Borsa Takip"
  },
  twitter: {
    card: "summary_large_image",
    title: "Borsa Takip",
    description: "Canlı Borsa ve Hisse Analizi",
    creator: "@borsatakipapp" // Placeholder
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Borsa Takip",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const scripts = await getTrackingScripts();

  return (
    <html lang="tr" suppressHydrationWarning>
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
