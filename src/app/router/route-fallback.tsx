import { Skeleton } from '@/shared/ui'

export function RouteFallback() {
  return (
    <main aria-label="Завантаження сторінки" className="grid min-h-svh place-items-center p-8">
      <div className="w-full max-w-2xl space-y-5">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-4/5" />
      </div>
    </main>
  )
}
