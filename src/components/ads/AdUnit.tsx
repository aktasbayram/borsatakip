'use client';

import { useEffect, useState } from 'react';

interface AdPlacement {
    id: string;
    label: string;
    location: string;
    adCode: string; // This expects the INS tag attributes or partial HTML
    isActive: boolean;
    platform: string;
    maxWidth?: string;
    maxHeight?: string;
}

interface AdUnitProps {
    location: string;
    className?: string;
}

export function AdUnit({ location, className = '' }: AdUnitProps) {
    const [ad, setAd] = useState<AdPlacement | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Fetch ad config for this location with cache busting
        fetch(`/api/ads?location=${location}&t=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error('API Error');
                return res.json();
            })
            .then(data => {
                // API returns array, find the one matching location
                if (Array.isArray(data)) {
                    // Public API already filters by isActive: true and location if provided
                    const match = data.find((a: any) => a.location === location);
                    if (match) {
                        setAd(match);
                    } else {
                        setAd(null); // Explicitly clear if not found/inactive
                    }
                }
            })
            .catch(err => {
                console.error('Ad fetch error:', err);
                setAd(null);
            });
    }, [location]);

    useEffect(() => {
        if (ad && isClient && ad.adCode.includes('adsbygoogle')) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e: any) {
                // Ignore "All 'ins' elements... already have ads" error as it's benign
                if (!e.message?.includes('already have ads')) {
                    console.error('AdSense push error:', e);
                }
            }
        }
    }, [ad, isClient]);

    if (!ad || !isClient) return null;

    return (
        <div
            className={`w-full flex flex-col my-8 px-4 overflow-hidden rounded-2xl bg-accent/5 border border-border/20 backdrop-blur-sm ${className}`}
            style={{
                maxWidth: ad.maxWidth || undefined,
                maxHeight: ad.maxHeight || undefined,
                marginInline: 'auto'
            }}
        >
            <div className="flex items-center justify-center gap-2 py-2 border-b border-border/10">
                <div className="h-0.5 w-4 bg-muted-foreground/20"></div>
                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Sponsorlu İçerik</span>
                <div className="h-0.5 w-4 bg-muted-foreground/20"></div>
            </div>
            <div className="w-full py-4 flex justify-center [&>*]:w-full transition-opacity duration-500 min-h-[50px]" dangerouslySetInnerHTML={{ __html: ad.adCode }} />
        </div>
    );
}
