'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface CreditBadgeProps {
    className?: string;
}

export function CreditBadge({ className = '' }: CreditBadgeProps) {
    const { status } = useSession();
    const [credits, setCredits] = useState<{ credits: number; total: number } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchCredits();
        }
    }, [status]);

    const fetchCredits = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/user/credits');
            setCredits(res.data);
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        } finally {
            setLoading(false);
        }
    };

    if (status !== 'authenticated') {
        return null;
    }

    if (loading && !credits) {
        return <span className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>;
    }

    if (!credits) return null;

    const isLow = credits.credits <= 1;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isLow
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                } ${className}`}
        >
            <span>✨</span>
            <span>{credits.credits}/{credits.total}</span>
        </span>
    );
}

