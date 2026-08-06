import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4">
      <div className="flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-full"/>
        <Skeleton className="h-11 w-11 rounded-full"/>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg"/>
        ))}
      </div>
    </div>
  );
}
