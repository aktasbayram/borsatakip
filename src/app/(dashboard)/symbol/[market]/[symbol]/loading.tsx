import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-24 hidden md:block" />
                    <Skeleton className="h-10 w-24 hidden md:block" />
                    <div className="text-right">
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[600px] w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-4">
                <div className="flex gap-2 mb-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-12" />
                    ))}
                </div>
                <Skeleton className="h-[500px] w-full" />
            </div>

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        </div>
    );
}
