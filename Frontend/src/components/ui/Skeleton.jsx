export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-charcoal-800 ${className}`}
      aria-hidden="true"
    />
  )
}

export function FeedSkeleton() {
  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="sticky top-0 z-10 bg-charcoal-800 border-b border-charcoal-700 px-6 py-4">
        <Skeleton className="h-8 w-32" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-9 w-24 rounded-pill" />
          <Skeleton className="h-9 w-28 rounded-pill" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-card border border-charcoal-700 overflow-hidden">
            <div className="p-4 flex items-center gap-3 border-b border-charcoal-700">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WalletSkeleton() {
  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40 w-full rounded-card" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-card" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    </div>
  )
}

export function PageSkeleton({ rows = 4 }) {
  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-card" />
        ))}
      </div>
    </div>
  )
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid mb-4"
          style={{ height: `${140 + (i % 4) * 40}px` }}
        >
          <Skeleton className="h-full w-full rounded-card" />
        </div>
      ))}
    </div>
  )
}

export function MessagesSkeleton() {
  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-5rem)] md:h-screen">
        <div className="w-full md:w-80 border-r border-charcoal-700 p-4 space-y-3">
          <Skeleton className="h-8 w-32 mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:flex flex-1 flex-col p-4">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className={`h-16 ${i % 2 ? 'w-2/3 ml-auto' : 'w-1/2'} rounded-card`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContentViewSkeleton() {
  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full rounded-card" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-card" />
            <Skeleton className="h-12 w-full rounded-card" />
            <Skeleton className="h-12 w-full rounded-card" />
          </div>
        </div>
      </div>
    </div>
  )
}
