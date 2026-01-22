'use client';

import React from 'react';

interface SentimentGaugeProps {
    score: number; // 0 to 10
    label?: string;
}

export const SentimentGauge = ({ score, label = "Piyasa Atmosferi" }: SentimentGaugeProps) => {
    // Clamp score
    const clampedScore = Math.min(Math.max(score, 0), 10);
    const percentage = (clampedScore / 10) * 100;

    let statusText = "Nötr";
    let statusColor = "text-gray-500";
    let gradientFrom = "from-gray-400";
    let gradientTo = "to-gray-600";

    if (clampedScore >= 8) {
        statusText = "Aşırı İştahlı (Extreme Greed)";
        statusColor = "text-green-600";
        gradientFrom = "from-green-400";
        gradientTo = "to-green-600";
    } else if (clampedScore >= 6) {
        statusText = "Pozitif (Greed)";
        statusColor = "text-green-500";
        gradientFrom = "from-emerald-400";
        gradientTo = "to-emerald-600";
    } else if (clampedScore <= 2) {
        statusText = "Aşırı Korku (Extreme Fear)";
        statusColor = "text-red-600";
        gradientFrom = "from-red-500";
        gradientTo = "to-red-700";
    } else if (clampedScore <= 4) {
        statusText = "Negatif (Fear)";
        statusColor = "text-red-500";
        gradientFrom = "from-orange-400";
        gradientTo = "to-red-500";
    } else {
        gradientFrom = "from-yellow-400";
        gradientTo = "to-yellow-600";
        statusColor = "text-yellow-600";
    }

    return (
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-80`}></div>
            <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full blur-[100px] opacity-10 dark:opacity-20 pointer-events-none`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{label}</h3>
                        <div className={`text-2xl md:text-3xl font-bold ${statusColor} transition-colors duration-500`}>
                            {statusText}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {clampedScore.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-lg font-medium">/10</span>
                    </div>
                </div>

                {/* Modern Linear Meter */}
                <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4 shadow-inner">
                    {/* Zones Background */}
                    <div className="absolute inset-0 flex opacity-30">
                        <div className="flex-1 bg-red-500"></div>   {/* Fear */}
                        <div className="flex-[0.5] bg-yellow-400"></div> {/* Neutral */}
                        <div className="flex-1 bg-green-500"></div> {/* Greed */}
                    </div>

                    {/* Active Bar */}
                    <div
                        className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} relative transition-all duration-1000 ease-out shadow-lg`}
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer"></div>
                    </div>
                </div>

                {/* Range Labels with Bull/Bear Icons */}
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wide text-gray-400">
                    <div className="flex items-center gap-2 text-red-500/80">
                        <span className="text-lg">🐻</span>
                        <span>Ayı (Fear)</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-500/80">
                        <span>Boğa (Greed)</span>
                        <span className="text-lg">🐂</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};
