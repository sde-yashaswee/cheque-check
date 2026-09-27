import { Skeleton } from '@/components/ui/skeleton'

export function AppShellSkeleton() {
  return (
    <div
      className="flex min-h-full flex-col pb-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="sticky top-0 z-40 flex h-[52px] w-full items-center justify-between border-b border-primary/5 bg-canvas-parchment/80 px-4 backdrop-blur-md dark:bg-black/80">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-5 w-28 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <main className="flex flex-1 flex-col space-y-8 px-4 pt-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        <div className="space-y-4 pt-4">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-primary/5 bg-canvas-parchment/80 px-4 pb-safe backdrop-blur-md dark:bg-black/80">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-2.5 w-10 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
