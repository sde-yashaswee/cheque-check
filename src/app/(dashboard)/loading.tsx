import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full space-y-8 p-4">
      {/* Title block */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 rounded-lg"/>
        <Skeleton className="h-4 w-64 rounded-lg"/>
      </div>
      
      {/* Summary cards block */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-lg"/>
        <Skeleton className="h-24 w-full rounded-lg"/>
      </div>
      
      {/* List block */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-8 w-32 rounded-lg"/>
        <Skeleton className="h-32 w-full rounded-lg"/>
        <Skeleton className="h-32 w-full rounded-lg"/>
      </div>
    </div>
  );
}
