export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div 
      className={`animate-pulse bg-slate-700/50 rounded ${className}`}
      aria-label="Loading..."
    />
  )
}

export function ProfileSkeleton() {
  return (
    <div className="backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
      <div className="flex flex-col items-center text-center mb-8">
        {/* Avatar */}
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        
        {/* Display Name */}
        <Skeleton className="h-8 w-48 mb-2" />
        
        {/* Username */}
        <Skeleton className="h-5 w-32 mb-4" />
        
        {/* Bio */}
        <Skeleton className="h-4 w-64 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Links */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Editor Skeleton */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        {/* Preview Skeleton */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <Skeleton className="h-6 w-24 mb-6" />
          <div className="bg-slate-900/50 rounded-xl p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Skeleton className="w-20 h-20 rounded-full mb-3" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Links Manager Skeleton */}
      <div className="mt-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
