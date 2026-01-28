import {Skeleton} from "@/components/ui/skeleton";
export const SkeletonPanel = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 text-black space-y-4">
            <h3>Extracting label data...</h3>
            <Skeleton className="h-5 w-48" />
            <div className="space-y-3">
                {Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3">
                        <Skeleton className="h-4 w-full col-span-1" />
                        <Skeleton className="h-4 w-full col-span-1" />
                        <Skeleton className="h-10 w-full col-span-1" />
                        <Skeleton className="h-4 w-full col-span-1" />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-end gap-3">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
            </div>
        </div>
    );
};
