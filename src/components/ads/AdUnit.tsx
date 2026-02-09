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
            className={`w-full flex justify-center my-3 ${className}`}
            style={{
                maxWidth: ad.maxWidth || undefined,
                maxHeight: ad.maxHeight || undefined,
                marginInline: 'auto'
            }}
        >
            <div className="w-full flex justify-center [&>*]:w-full transition-opacity duration-500 min-h-[50px]" dangerouslySetInnerHTML={{ __html: ad.adCode }} />
        </div>
    );
}
