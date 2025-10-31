'use client'

import { LucideIcon, Link2, Image, Users, FileText, Calendar, Mail, Sparkles, Plus } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-500" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-slate-400 max-w-md mb-6">
        {description}
      </p>

      <div className="flex gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm font-medium transition"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export function NoLinksEmpty({ onAddLink }: { onAddLink?: () => void }) {
  return (
    <EmptyState
      icon={Link2}
      title="No links yet"
      description="Start building your link page by adding your first link. You can add social media profiles, websites, or any custom links."
      actionLabel="Add Your First Link"
      onAction={onAddLink}
    />
  )
}

export function NoAnalyticsEmpty() {
  return (
    <EmptyState
      icon={Sparkles}
      title="No analytics data yet"
      description="Once people start visiting your profile and clicking your links, you'll see detailed analytics here including views, clicks, and visitor insights."
      className="py-20"
    />
  )
}

export function NoWidgetsEmpty({ onAddWidget }: { onAddWidget?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No widgets added"
      description="Enhance your profile with widgets like About Me, Gallery, Testimonials, FAQ, Countdown, or Newsletter signup."
      actionLabel="Add Widget"
      onAction={onAddWidget}
    />
  )
}

export function NoImagesEmpty({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={Image}
      title="No images uploaded"
      description="Upload images to create a beautiful gallery on your profile. Supported formats: JPG, PNG, GIF (max 5MB each)."
      actionLabel="Upload Images"
      onAction={onUpload}
    />
  )
}

export function NoTestimonialsEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No testimonials yet"
      description="Showcase social proof by adding testimonials from your satisfied customers or clients. Include their name, role, and feedback."
      actionLabel="Add Testimonial"
      onAction={onAdd}
    />
  )
}

export function NoEventsEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No upcoming events"
      description="Create countdown timers for product launches, events, sales, or any important dates you want to highlight."
      actionLabel="Add Countdown"
      onAction={onAdd}
    />
  )
}

export function SearchEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms or filters.`}
      className="py-16"
    />
  )
}

export function ErrorState({ 
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
}: { 
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-slate-400 max-w-md mb-6">
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white text-sm font-medium transition"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function SuccessState({ 
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-slate-400 max-w-md mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
