'use client';

import { useEffect, useState } from 'react';

export type LayoutWidth = 'compact' | 'wide' | 'auto';

const LAYOUT_WIDTH_KEY = 'layout-width-v2';

export function useLayoutWidth() {
    const [layoutWidth, setLayoutWidthState] = useState<LayoutWidth>('compact');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Read from localStorage on mount
        const stored = localStorage.getItem(LAYOUT_WIDTH_KEY) as LayoutWidth | null;
        if (stored === 'compact' || stored === 'wide' || stored === 'auto') {
            setLayoutWidthState(stored);
        }
    }, []);

    const setLayoutWidth = (width: LayoutWidth) => {
        setLayoutWidthState(width);
        localStorage.setItem(LAYOUT_WIDTH_KEY, width);
    };

    const getContainerClass = () => {
        if (layoutWidth === 'auto') return 'max-w-full';
        return layoutWidth === 'wide' ? 'max-w-7xl' : 'max-w-7xl';
    };

    const getContentClass = () => {
        if (layoutWidth === 'auto') return 'max-w-full';
        return layoutWidth === 'wide' ? 'max-w-[1000px]' : 'max-w-7xl';
    };

    return {
        layoutWidth,
        setLayoutWidth,
        getContainerClass,
        getContentClass,
        mounted,
    };
}
