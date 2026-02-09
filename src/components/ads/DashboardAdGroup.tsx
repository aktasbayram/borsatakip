'use client';

import { useEffect, useState } from 'react';
import { AdUnit } from './AdUnit';

export function DashboardAdGroup() {
    const [showFirst, setShowFirst] = useState(true);

    useEffect(() => {
        // Randomly decide which one to show on mobile
        setShowFirst(Math.random() < 0.5);
    }, []);

    return (
        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ad 1: Visible if showFirst OR Desktop */}
            <div className={`${showFirst ? 'block' : 'hidden'} md:block col-span-1`}>
                <AdUnit
                    location="dashboard_grid_1"
                    className="w-full"
                />
            </div>

            {/* Ad 2: Visible if NOT showFirst OR Desktop */}
            <div className={`${!showFirst ? 'block' : 'hidden'} md:block col-span-1`}>
                <AdUnit
                    location="dashboard_grid_2"
                    className="w-full"
                />
            </div>
        </div>
    );
}
