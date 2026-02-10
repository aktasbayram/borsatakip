'use client';

import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';

interface AdPlacement {
    id: string;
    label: string;
    location: string;
    adCode: string;
    isActive: boolean;
    platform: string;
    maxWidth?: string;
    maxHeight?: string;
}

interface BlogFeedAdProps {
    location?: string;
    className?: string;
}

export function BlogFeedAd({ location = "blog_feed_middle", className = "" }: BlogFeedAdProps) {
    const [ad, setAd] = useState<AdPlacement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const res = await fetch(`/api/ads?location=${location}&t=${Date.now()}`);
                if (!res.ok) throw new Error('API Error');
                const data = await res.json();

                if (Array.isArray(data)) {
                    const match = data.find((a: any) => a.location === location);
                    setAd(match || null);
                }
            } catch (err) {
                console.error('Ad fetch error:', err);
                setAd(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAd();
    }, [location]);

    if (loading) return (
        <div className={`py-6 h-[150px] bg-muted/5 animate-pulse rounded-2xl border border-dashed border-border/40 ${className}`} />
    );

    if (ad && ad.isActive) {
        return (
            <div
                className="py-6 w-full flex justify-center"
                style={{
                    maxWidth: ad.maxWidth || undefined,
                    maxHeight: ad.maxHeight || undefined,
                    marginInline: 'auto'
                }}
            >
                <div className="w-full flex justify-center [&>*]:w-full" dangerouslySetInnerHTML={{ __html: ad.adCode }} />
            </div>
        );
    }

    // If no ad is found or it's not active, show nothing (consistent with header/footer)
    return null;
}
