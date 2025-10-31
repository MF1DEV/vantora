'use client'

import { ReactNode, useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxHeight?: string
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxHeight = 'max-h-[85vh]'
}: BottomSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      setTimeout(() => setIsAnimating(false), 300)
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen && !isAnimating) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${maxHeight} overflow-hidden`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          {children}
        </div>
      </div>
    </>
  )
}

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className = '' }: SwipeableCardProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (Math.abs(currentX) > 100) {
      if (currentX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (currentX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    setCurrentX(0)
    setIsSwiping(false)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`transition-transform ${className}`}
      style={{ transform: `translateX(${currentX}px)` }}
    >
      {children}
    </div>
  )
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return
    
    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY)
    setPullDistance(Math.min(distance, 100))
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setIsPulling(false)
    setPullDistance(0)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div
          className="flex justify-center pt-4 transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <div className={`text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`}>
            {isRefreshing ? '⟳' : '↓'}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export function TouchFriendlyButton({ 
  children, 
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`min-h-[44px] min-w-[44px] active:scale-95 transition-transform ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function MobileNavBar({ 
  items 
}: { 
  items: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }[] 
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 z-30 md:hidden">
      <div className="flex justify-around items-center">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              item.active 
                ? 'text-blue-400 bg-blue-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

interface ResponsiveDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function ResponsiveDialog({ isOpen, onClose, title, children, footer }: ResponsiveDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Desktop: Modal */}
      <div className="hidden md:block">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {children}
          </div>
          {footer && (
            <div className="p-6 border-t border-slate-800">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Bottom Sheet */}
      <div className="md:hidden">
        <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
          <div className="p-6">
            {children}
          </div>
          {footer && (
            <div className="p-6 border-t border-slate-800">
              {footer}
            </div>
          )}
        </BottomSheet>
      </div>
    </>
  )
}
