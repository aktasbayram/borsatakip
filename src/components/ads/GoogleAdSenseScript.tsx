'use client';

import Script from 'next/script';

export function GoogleAdSenseScript() {
    return (
        <Script
            id="google-adsense"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" // Placeholder, user will need to update or we extract from DB if global config exists
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
