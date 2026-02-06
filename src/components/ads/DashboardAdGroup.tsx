'use client';

import { useEffect, useState } from 'react';
import { AdUnit } from './AdUnit';

export function DashboardAdGroup() {
    const [showFirst, setShowFirst] = useState(true);

    useEffect(() => {
        // Randomly decide which one to show on mobile
        setShowFirst(Math.random() < 0.5);
    }, []);

    const baseClass = "col-span-1 shadow-sm border rounded-xl bg-white dark:bg-gray-950";

    return (
        <>
            {/* Ad 1: Visible if showFirst OR Desktop */}
            <div className={`${showFirst ? 'block' : 'hidden'} md:block col-span-1`}>
                <AdUnit
                    location="dashboard_grid_1"
                    className={baseClass}
                />
            </div>

            {/* Ad 2: Visible if NOT showFirst OR Desktop */}
            <div className={`${!showFirst ? 'block' : 'hidden'} md:block col-span-1`}>
                <AdUnit
                    location="dashboard_grid_2"
                    className={baseClass}
                />
            </div>
        </>
    );
}
