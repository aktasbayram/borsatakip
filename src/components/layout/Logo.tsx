"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LogoProps {
    dynamic?: boolean;
}

export function Logo({ dynamic = false }: LogoProps) {
    const [settings, setSettings] = useState({
        siteName: 'e-borsa',
        siteLogoUrl: ''
    });

    useEffect(() => {
        if (dynamic) {
            // Fetch public settings for non-admin use if needed
            // For now, we'll try to get them from a window variable or just fallback
            // because fetching prisma in server component and passing to client is better.
            fetch('/api/settings/public')
                .then(res => res.json())
                .then(data => {
                    if (data.siteName) {
                        setSettings({
                            siteName: data.siteName,
                            siteLogoUrl: data.siteLogoUrl || ''
                        });
                    }
                })
                .catch(() => { });
        }
    }, [dynamic]);

    const content = (
        <div className="flex items-center gap-2">
            {settings.siteLogoUrl ? (
                <img
                    src={settings.siteLogoUrl}
                    alt={settings.siteName}
                    className="h-8 w-auto object-contain"
                />
            ) : null}
            <span className="text-xl font-bold text-primary">
                {settings.siteName}
            </span>
        </div>
    );

    return content;
}
