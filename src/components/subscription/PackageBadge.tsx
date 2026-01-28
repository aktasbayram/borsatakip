'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface PackageBadgeProps {
    className?: string;
}

export function PackageBadge({ className = '' }: PackageBadgeProps) {
    const [tier, setTier] = useState<string>('FREE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTier();
    }, []);

    const fetchTier = async () => {
        try {
            const res = await axios.get('/api/user/credits');
            setTier(res.data.tier || 'FREE');
        } catch (error) {
            console.error('Failed to fetch tier:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    const badges: Record<string, { icon: string; label: string; color: string }> = {
        'FREE': { icon: '⚡', label: "Pro'ya Yükselt", color: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700' },
        'BASIC': { icon: '📦', label: 'BASIC', color: 'bg-blue-600 hover:bg-blue-700' },
        'PRO': { icon: '👑', label: 'PRO', color: 'bg-purple-600 hover:bg-purple-700' },
    };

    const badge = badges[tier] || badges['FREE'];

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-sm font-medium transition-all shadow-sm ${badge.color} ${className}`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
        </span>
    );
}
