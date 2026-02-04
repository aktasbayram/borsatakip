import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Indices Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>

            {/* Widgets Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[280px] w-full" />
                <Skeleton className="h-[280px] w-full" />
            </div>

            {/* Watchlist Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-64" />
            </div>

            {/* Watchlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
        </div>
    );
}
